"""Build native PHP/CSS from original Figma layer measurements.

Sections use CSS Grid for their desktop composition. Artwork retains Figma's
internal transforms and crop masks. Responsive components reflow independently.
The default / --check stages output without modifying the theme. --write
backs up the current CSS/PHP/JS before applying changed generated files.
Run parse-figma.py first; this generator never reads or writes to Figma.
"""
from pathlib import Path
import argparse, atexit, copy, hashlib, html, json, re, shutil, subprocess, tempfile
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser(description=__doc__)
mode = parser.add_mutually_exclusive_group()
mode.add_argument('--check', action='store_true', help='Compare staged output without modifying theme files (default).')
mode.add_argument('--write', action='store_true', help='Back up verified files, then apply changed generated output on develop.')
args = parser.parse_args()
if args.write:
    if Path.cwd().resolve() != ROOT:
        parser.error('--write must run in the current WordPress theme directory.')
    branch = subprocess.check_output(['git','branch','--show-current'],cwd=ROOT,text=True).strip()
    if branch != 'develop':
        parser.error('--write is allowed only on develop.')
backup_root = ROOT/'tools/generator-backups'
backup_root.mkdir(parents=True,exist_ok=True)
staging = tempfile.TemporaryDirectory(prefix='staging-',dir=backup_root)
atexit.register(staging.cleanup)
OUTPUT = Path(staging.name)
layers = json.loads((ROOT/'tools/flat-layers.json').read_text(encoding='utf-8'))
manifest = json.loads((ROOT/'assets/asset-map.json').read_text())
asset_names = {a['name']:a['file'] for a in manifest}
by_id = {int(n['attrs']['data-node-id'].split(':')[1]):n for n in layers}
paint_order = {int(n['attrs']['data-node-id'].split(':')[1]):i+1 for i,n in enumerate(layers)}
# Figma masks are in the artboard's coordinate space. CSS transforms rotate
# a mask with its child, so apply those masks to the untransformed outer layer.
MASK_CANVASES={
 11:(-.5,0,1441,779.239,'rectangle44.svg'),
 **{i:(26,2374.54,333.98,599.528,'rectangle31.svg') for i in (124,125,126)},
 **{i:(726.5,2374.54,334,599.528,'rectangle35.svg') for i in (561,562,563)},
 **{i:(58.14,1712.76,537.859,116.436,'rectangle33.svg') for i in (367,368,369)},
 **{i:(719.13,7422.18,576.367,547.461,'rectangle30.svg') for i in (104,105,106)},
}
SECTIONS = [
 ('navigation',0,45.419),('hero',45.419,783),('statistics',783,984.176),
 ('quiz',984.176,1900),('services',1900,3190),('about',3190,3930),
 ('process',3930,4600),('results',4600,5390),('testimonials',5390,6240),
 ('partners',6240,6550),('tax-intro',6550,7136),('calculator',7136,8020),
 ('contact',8020,8523.046),('site-footer',8523.046,9072.024)]

def val(v):
    return v.replace('_',' ')

def declarations(classes, extra=''):
    out={}; transforms=[]; gradient={}
    simple={'absolute':('position','absolute'),'relative':('position','relative'),
    'block':('display','block'),'flex':('display','flex'),'contents':('display','contents'),
    'flex-none':('flex','none'),'items-center':('align-items','center'),
    'justify-center':('justify-content','center'),'max-w-none':('max-width','none'),
    'overflow-hidden':('overflow','hidden'),'overflow-clip':('overflow','clip'),
    'pointer-events-none':('pointer-events','none'),'object-cover':('object-fit','cover'),
    'text-center':('text-align','center'),'text-right':('text-align','right'),
    'whitespace-nowrap':('white-space','nowrap'),'whitespace-pre':('white-space','pre'),
    'whitespace-pre-wrap':('white-space','pre-wrap'),'cursor-pointer':('cursor','pointer'),
    'underline':('text-decoration-line','underline'),'decoration-solid':('text-decoration-style','solid'),
    'decoration-from-font':('text-decoration-thickness','from-font'),'mb-0':('margin-bottom','0'),
    'font-normal':('font-weight','400'),'border':('border-width','1px'),
    'border-solid':('border-style','solid'),'mask-alpha':('mask-mode','alpha'),
    'mask-intersect':('mask-composite','intersect'),'mask-no-repeat':('mask-repeat','no-repeat'),
    'mask-no-clip':('mask-clip','no-clip'),'mix-blend-screen':('mix-blend-mode','screen'),
    'mix-blend-color':('mix-blend-mode','color'),
    'bg-white':('background-color','#fff'),'bg-black':('background-color','#000'),
    'text-white':('color','#fff'),'text-black':('color','#000'),'border-white':('border-color','#fff'),
    'h-full':('height','100%'),'w-full':('width','100%'),'h-0':('height','0'),'w-0':('width','0'),
    'top-0':('top','0'),'left-0':('left','0'),'left-1/2':('left','50%'),'inset-0':('inset','0'),
    'opacity-20':('opacity','.2'),'opacity-30':('opacity','.3')}
    for token in classes.split():
        if token in simple: out[simple[token][0]]=simple[token][1]; continue
        if token=='size-full': out.update(width='100%',height='100%');continue
        if token=='not-italic': continue # Figma face names already carry the actual italic outlines.
        if token=='-translate-x-1/2': transforms.append('translateX(-50%)');continue
        if token=='-translate-x-full': transforms.append('translateX(-100%)');continue
        if token in ('rotate-180','rotate-90','-rotate-90'):
            transforms.append('rotate('+token.replace('rotate-','').replace('-rotate-','-')+'deg)');continue
        if token in ('-scale-y-100','-scale-x-100'):
            transforms.append('scale'+token[7].upper()+'(-1)');continue
        m=re.fullmatch(r'font-\[\'(.+?):(.+?)\'\]',token)
        if m:
            family,face=m.groups();family=family.replace('_',' ')
            out['font-family']="'"+family+"'"
            out['font-weight']='700' if 'Bold' in face else '500' if 'Medium' in face else '400'
            out['font-style']='italic' if 'Italic' in face else 'normal';continue
        if token.startswith('[') and token.endswith(']') and ':' in token:
            k,v=token[1:-1].split(':',1);out[k]=val(v);continue
        m=re.fullmatch(r'(.+?)-\[(.*)\]',token)
        if m:
            k,v=m.groups();v=val(v)
            if k in ('from','to','via'):
                gradient[k+('-position' if v.endswith('%') else '')]=v;continue
            if k=='text': out['color' if v.startswith(('#','rgb')) else 'font-size']=v;continue
            if k=='border': out['border-color' if v.startswith(('#','rgb')) else 'border-width']=v;continue
            if k=='size': out.update(width=v,height=v);continue
            prop={'h':'height','w':'width','bg':'background-color','rounded':'border-radius',
              'leading':'line-height','tracking':'letter-spacing','backdrop-blur':'backdrop-filter',
              'mask-size':'mask-size','mask-position':'mask-position'}.get(k,k)
            if k=='backdrop-blur':v='blur('+v+')'
            if k=='rotate': transforms.append('rotate('+v+')');continue
            if k=='skew-x': transforms.append('skewX('+v+')');continue
            if k=='scale-y': transforms.append('scaleY('+str(float(v.rstrip('%'))/100)+')');continue
            out[prop]=v;continue
        if token.startswith('scale-y-'):
            transforms.append('scaleY('+str(int(token[8:])/100)+')');continue
        if token=='bg-gradient-to-b':continue
        raise ValueError('Unknown Figma style '+token)
    if transforms:out['transform']=' '.join(transforms)
    if gradient:
        stops=[gradient.get('from','transparent')+' 0%']
        if 'via' in gradient:stops.append(gradient['via']+' '+gradient.get('via-position','50%'))
        stops.append(gradient.get('to','transparent')+' '+gradient.get('to-position','100%'))
        out['background-image']='linear-gradient(to bottom, '+', '.join(stops)+')'
    for m in re.finditer(r'(\w+):\s*([\'"`])(.*?)\2',extra):
        key,value=m.group(1),m.group(3)
        prop=re.sub(r'([A-Z])',lambda m:'-'+m.group(1).lower(),key)
        value=re.sub(r'\$\{(\w+)\}',lambda m:'../images/'+asset_names[m.group(1)],value)
        out[prop]=value
    return out

def number(value,total):
    if value is None:return 0
    if value.startswith('calc('):
        expr=value[5:-1]
        expr=re.sub(r'(-?\d+(?:\.\d+)?)%',lambda m:str(float(m.group(1))*total/100),expr)
        return eval(expr.replace('px',''),{'__builtins__':{}})
    if value.endswith('%'):return float(value[:-1])*total/100
    return float(value.replace('px',''))

def geom(n):
    d=declarations(n['attrs'].get('class',''),n['attrs'].get('figmaStyle',''))
    m=n['measurement'];w=number(d.get('width'),1440) if 'width' in d else float(m.get('width',0))
    h=number(d.get('height'),8443) if 'height' in d else float(m.get('height',0))
    x=number(d.get('left'),1440);y=number(d.get('top'),8443)
    if 'inset' in d:
        q=d['inset'].split();q=q*4 if len(q)==1 else q*2 if len(q)==2 else q
        y=number(q[0],8443);x=number(q[3],1440)
        w=1440-x-number(q[1],1440);h=8443-y-number(q[2],8443)
    elif 'bottom' in d and 'height' not in d:h=8443-y-number(d['bottom'],8443)
    if 'translateX(-50%)' in d.get('transform',''):x-=w/2
    elif 'translateX(-100%)' in d.get('transform',''):x-=w
    # Use exact Figma text coordinates rather than rounded percentage calculations.
    if n['tag'] in ('p','a') or any(c['tag']=='p' for c in n['children']):
        x=float(m.get('x',x));y=float(m.get('y',y))
    return x,y,w,h,d

def text(n): return re.sub(r'\s+',' ',n['text']+''.join(text(c)+c['tail'] for c in n['children'])).strip()
css=[]; fluid=[]; counter=0; used=set(); removed={22}
HEADINGS={175:'h1',18:'h2',322:'h2',520:'h2',492:'h2',447:'h2',438:'h2',107:'h2',60:'h2',
162:'h3',163:'h3',593:'h3',594:'h3',499:'h3',505:'h3',516:'h3',454:'h3',455:'h3'}
LINKS={203:'#about',204:'https://oxen.nz/podcasts/',205:'#results',206:'#calculator',208:'#services',
43:'mailto:hello@oxen.nz',44:'#calculator',45:'https://oxen.nz/services/business-and-financial-coaching/',46:'https://oxen.nz/privacy-policy/',
48:'https://www.linkedin.com/company/oxenaccounting/',49:'https://www.instagram.com/oxenaccounting/',51:'https://oxen.nz/podcasts/',52:'https://www.youtube.com/@OxenAccounting',
55:'https://oxen.nz/services/cash-flow-budgeting-forecasting/',56:'#results',57:'https://oxen.nz/services/business-and-financial-coaching/',58:'https://oxen.nz/services/tax-advice-financial-reporting/',59:'#about',39:'https://oxen.nz/services/income-tax-tax-returns/',365:'tel:0800640001'}
# Link external content through WordPress's configurable destinations in production.
ACTION_MAP={
195:(200,[196],'#contact'),180:(181,[],'#contact'),183:(184,[185],'tel:0800640001'),
573:(574,[575],'#contact'),580:(581,[582],'#contact'),610:(611,[612],'#contact'),617:(618,[619],'#contact'),
64:(65,[],'#contact'),67:(68,[],'tel:0800640001'),511:(512,[],'#contact'),118:(119,[],'#contact')}
ANSWER_MAP={336:341,337:342,338:343,339:344,340:345}
for bg,(label,icons,href) in ACTION_MAP.items():
    if bg not in by_id:continue
    removed.add(label);removed.update(icons)
removed.add(185)
for bg,label in ANSWER_MAP.items():removed.add(label)
removed.update({95,98,91,92,82,84})
removed.add(487)

def serialize(n, start=0, root=False, local_origin=None):
    global counter
    n=copy.deepcopy(n);attrs=n['attrs'];nid=int(attrs.get('data-node-id','0:0').split(':')[-1])
    counter+=1;cls='layer-'+str(nid) if root and nid else 'art-'+str(counter)
    d=declarations(attrs.get('class',''),attrs.get('figmaStyle',''))
    x,y,w,h,_=geom(n) if root else (0,0,0,0,{})
    if root and nid in MASK_CANVASES:
        mx,my,mw,mh,mfile=MASK_CANVASES[nid]
        d.update({'mask-image':'url("../images/'+mfile+'")','mask-position':f'{mx-x:.4f}px {my-y:.4f}px','mask-size':f'{mw}px {mh}px','mask-repeat':'no-repeat','mask-mode':'alpha','mask-clip':'no-clip'})
        def clear_inner_mask(child):
            child['attrs']['class']=' '.join(t for t in child['attrs'].get('class','').split() if not t.startswith('mask-'))
            child['attrs'].pop('figmaStyle',None)
            for c in child['children']:clear_inner_mask(c)
        for child in n['children']:clear_inner_mask(child)
    tag=HEADINGS.get(nid,n['tag']) if root else n['tag']
    if local_origin and tag=='p' and nid in removed:tag='span'
    a={k:v for k,v in attrs.items() if k not in ('class','figmaStyle','data-name','src','target')}
    classes=cls
    if root:
        classes='design-layer '+classes+(' copy-layer' if tag in ('p','span','a','h1','h2','h3') or any(c['tag']=='p' for c in n['children']) else ' art-layer')
        for k in ('position','top','left','right','bottom','inset'):d.pop(k,None)
        if 'transform' in d:
            d['transform']=re.sub(r'translateX\(-(?:50|100)%\)\s*','',d['transform']).strip()
            if not d['transform']:d.pop('transform')
        if local_origin:x-=local_origin[0];y-=local_origin[1]
        else:y-=start
        d.update({'position':'relative','grid-area':'1 / 1','align-self':'start','justify-self':'start','margin-left':f'{x:.4f}px','margin-top':f'{y:.4f}px','z-index':str(paint_order.get(nid,1))})
        if 'height' not in d and h and 'art-layer' in classes:d['height']=f'{h:.4f}px'
        if 'width' not in d and w and 'art-layer' in classes:d['width']=f'{w:.4f}px'
    if root and nid in LINKS:
        tag='a';a['href']=LINKS[nid];classes+=' text-link'
    if root and nid in (47,50):
        tag='button';a['type']='button';a['data-open-policy' if nid==47 else 'data-open-social']='';a['aria-haspopup']='dialog';classes+=' text-button'
    if nid==41:a.pop('href',None);tag='div' # Figma's long footer paragraph had an accidental tel: link.
    if nid==40:a['href']='tel:0800640001'
    if root and nid in (355,356,378,357,394,395,396,397,310,431,528,533,536):
        tag='button';a['type']='button';classes+=' text-button'
        if nid in (355,356,378,357,394,395,396,397):
            a['data-preview-plan']=str((355,356,378,357).index(nid) if nid in (355,356,378,357) else (394,395,396,397).index(nid))
        if nid==310:a['data-open-comparison']='';a['aria-haspopup']='dialog'
        if nid==431:a['data-slider-next']='';a['aria-label']='Next client story'
        if nid in (528,533,536):a['data-about-detail']=str((528,533,536).index(nid));a['aria-haspopup']='dialog'
    if nid in (113,114,116):
        tag='output';a['id']={113:'tax-owed',114:'effective-rate',116:'after-tax-profit'}[nid];a['form']='tax-form'
    if nid in (86,87,88):
        tag='label';a['for']={86:'annual-revenue',87:'business-structure',88:'annual-profit'}[nid]
    inner=None
    if root and nid in ACTION_MAP:
        label,icons,href=ACTION_MAP[nid];tag='a';a['href']=href;classes+=' action-link';d['display']='grid'
        inner=serialize(by_id[label],root=True,local_origin=(geom(n)[0],geom(n)[1]))
        for icon in icons:inner+=serialize(by_id[icon],root=True,local_origin=(geom(n)[0],geom(n)[1]))
    if root and nid in ANSWER_MAP:
        tag='button';a['type']='button';a['data-quiz-answer']={336:'0',338:'1',340:'2',337:'3',339:'4'}[nid];a['aria-pressed']='false';classes+=' quiz-answer';d['display']='grid'
        inner=serialize(by_id[ANSWER_MAP[nid]],root=True,local_origin=(geom(n)[0],geom(n)[1]))
    if root and nid in (90,94,97):
        classes+=' tax-control';d['padding']='0 14px';d['font-family']="'Satoshi'";d['font-size']='19px';d['color']='#18265d';d['letter-spacing']='-.8333px'
        if nid==97:
            tag='select';a.update(id='business-structure',name='structure',form='tax-form');inner='<option value="company">Limited Company</option><option value="sole-trader">Sole Trader</option><option value="partnership">Partnership</option>'
        else:
            tag='input';a.update(id='annual-profit' if nid==90 else 'annual-revenue',name='profit' if nid==90 else 'revenue',form='tax-form',type='text',inputmode='decimal',required='required',value='$ 250,000.00' if nid==90 else '$ 1,200,000',maxlength='20')
    if nid==81:
        tag='button';a.update(type='submit',form='tax-form');classes+=' calculate-button';d['text-align']='left';inner='<span>Calculate my Tax</span><img src="<?php echo oxen_asset( \'frame.svg\' ); ?>" alt="" width="20" height="20">';removed.update({82,84})
    if root and nid==486:
        tag='button';a.update(type='button',**{'data-open-case-study':'','aria-label':'Read the manufacturing client story','aria-haspopup':'dialog'});classes+=' action-link';d['display']='grid';d['border']='0';d['padding']='0'
        inner=serialize(by_id[487],root=True,local_origin=(geom(n)[0],geom(n)[1]))
    if not root and n['tag']=='span' and 'Meet everyone' in n['text']:
        tag='a';a['href']='https://oxen.nz/about-us/'
    if tag=='img':
        file=attrs['src'];used.add(file)
        a['src']="<?php echo oxen_asset( '"+file+"' ); ?>"
        a['alt']=attrs.get('alt','');a['decoding']='async'
        # Decorative images stay empty; provide meaningful alternatives for portraits/brand.
        if file=='image3.png':a['alt']='Oxen';a['width']='88';a['height']='18'
        elif file=='image15.png':a['alt']='Jeremy Wilson, Founder and Managing Director of Oxen'
        elif file in ('image6.png','image7.png','image8.png','image9.png','image10.png','image11.png'):
            a['alt']={'image6.png':'Bootleg Jerky Co','image7.png':'Cali Woods','image8.png':'Low Carb Haven','image9.png':'Manage','image10.png':'Follow','image11.png':'Tikitibu'}[file]
    a['class']=classes
    if root and 'art-layer' in classes and tag not in ('a','button','select','input'):a['aria-hidden']='true'
    if root and nid in (13,628,629,630,631,632,633):a.pop('aria-hidden',None)
    if root and nid in (13,628,629,630,631,632,633):
        def expose_image(child):
            child['attrs'].pop('aria-hidden',None)
            for c in child['children']:expose_image(c)
        for child in n['children']:expose_image(child)
    if nid in (346,347):a['id']='quiz-question' if nid==346 else 'quiz-progress'
    if nid==440:a['id']='client-story';a['aria-live']='polite';a['aria-atomic']='true'
    if nid==439:a['id']='client-name'
    if nid==441:a['id']='client-role'
    if nid==175:a['id']='homepage-title'
    if nid in (18,322,520,492,447,438,107,60):a['id']='heading-'+str(nid)
    if nid==213:
        tag='a';a['href']='/';a['aria-label']='Oxen home';a['class']+=' brand-link';a.pop('aria-hidden',None)
    if nid==520:
        # JSX indentation is not rendered text. Preserve the two source lines
        # using valid heading content, without XML whitespace creating indents.
        d['white-space']='normal'
        for c in n['children']:
            c['tag']='span';c['attrs']['class']=c['attrs'].get('class','')+' block'
    if root and tag in ('h1','h2','h3'):
        for c in n['children']:
            if c['tag']=='p':c['tag']='span';c['attrs']['class']=c['attrs'].get('class','')+' block'
    if nid==628:d['background-color']='#f0f0f0'
    if root and nid in ACTION_MAP and ACTION_MAP[nid][2]=='#contact':
        a['data-open-contact']='';a['aria-haspopup']='dialog'
    # Wide layouts retain the source's horizontal anchors, without retaining
    # an outer 1440px canvas. Component-local button/card children stay local.
    if root and not local_origin:
        wide={'margin-left':f'{x/1440*100:.6f}%'}
        width=d.get('width','')
        if width.endswith('px') and float(width[:-2]) > 200:
            rw=float(width[:-2])
            if 'copy-layer' in classes:
                maximum=max(rw,min(rw*1.25,720))
            fw=f'clamp({rw}px, {rw/1440*100:.6f}vw, {maximum:.4f}px)' if 'copy-layer' in classes else f'{rw/1440*100:.6f}%'
            wide['width']=fw
            if d.get('text-align')=='center':
                wide['margin-left']=f'calc({(x+rw/2)/1440*100:.6f}% - ({fw}) / 2)'
        if start==45.419:
            wide['margin-top']=f'calc({y:.4f}px + var(--hero-growth) * {y/737.581:.8f})'
            if nid in {187,188,220,221,222,223,224,229,246,317}:
                wide['margin-left']=f'calc(100% - {1440-x:.4f}px)'
        fluid.append('.'+cls+' {'+'; '.join(k+': '+v for k,v in wide.items())+';}')
    css.append('.'+cls+' {'+'; '.join(k+': '+v for k,v in d.items())+';}')
    attributes=' '.join(k+'="'+(v if k=='src' and v.startswith('<?php') else html.escape(v,quote=True))+'"' for k,v in a.items())
    if tag=='input' or tag=='img':return '<'+tag+' '+attributes+'>'
    if inner is None:
        inner=html.escape(n['text'] if n['text'].strip() or n['tag']=='span' else '')+''.join(serialize(c)+html.escape(c['tail'] if c['tail'].strip() else '') for c in n['children'])
    return '<'+tag+' '+attributes+'>'+inner+'</'+tag+'>'

section_nodes={name:[] for name,_,_ in SECTIONS}
for n in layers:
    nid=int(n['attrs']['data-node-id'].split(':')[1]);x,y,w,h,d=geom(n)
    if nid in removed:continue
    if 190<=nid<=213:name='navigation'
    elif 6<=nid<=14:name='hero'
    elif nid==5:name='statistics'
    elif nid==4:name='results'
    elif nid in (24,26):name='contact'
    else:name=next((name for name,start,end in SECTIONS if start<=max(0,y)<end),'hero')
    section_nodes[name].append(n)

# Semantic component groups use display:contents on the measured desktop canvas
# and become normal Grid/Flex components at tablet and phone widths.
GROUPS={
 'hero': [('hero-copy',{175,176,177,180,183,316}),('hero-portrait',{13}),('hero-author',{215,216,217}),('hero-proof',{187,188,220,221,222,223,224,229,246,317})],
 'quiz': [('quiz-copy',{324,325,352,353,354,355,356,357,365,370,371,373,376,377,378,326,327,328,360,362,366,367,368,369}),('quiz-widget',set(range(333,352)))],
 'services': [('service-timeline',set(range(380,403))),
 ('service-card service-foundations',set(range(122,135))|{157,158,162,164,166,168,170,172,555,573,553}),
 ('service-card service-essentials',set(range(136,145))|{160,161,163,165,167,169,171,173,556,580,554}),
 ('service-card service-advisory',set(range(559,572))|{587,588,589,593,595,597,599,601,603,607,610,605}),
 ('service-card service-cfo',set(range(147,156))|{591,592,594,596,598,600,602,604,608,617,606})],
 'about': [('about-copy',{519,520,522,523}),('about-team',set(range(547,553))),('about-photo',{544}),('about-details',set(range(524,547))-{544})],
 'process': [('process-card',set(range(497,501))),('process-card',set(range(501,506))),('process-card process-final',set(range(506,517)))],
 'results': [('result-card',{4,445,448,450,454,456,459,461,462,463,464,465,467,469,471,473,475,486}),('result-card',{449,451,455,457,458,460,477,478,479,480,481,483,485,489})],
 'testimonials': [('testimonial-photo',{414,416}),('testimonial-card',set(range(418,442)))],
 'calculator': [('calculator-form',{79,81,85,86,87,88,90,94,97}),('calculator-result',{77,99,101,102,103,104,105,106,110,111,112,113,114,115,116})],
 'site-footer': [('footer-address',{36,42}),('footer-contact',{37,40,43}),('footer-services',{35,39,45,55,57,58}),('footer-other',{38,44,56,59}),('footer-social',{48,49,50,51,52}),('footer-legal',{46,47,53,54}),('footer-badge',{74,75})]
}
for i,(border,metric,label) in enumerate([(264,268,272),(265,269,273),(266,270,274),(267,271,275)]):
    GROUPS.setdefault('statistics',[]).append(('stat-card',{border,metric,label}))

headids={'hero':175,'quiz':322,'services':18,'about':520,'process':492,'results':447,'testimonials':438,'calculator':107,'contact':60}
for name,start,end in SECTIONS:
    part=OUTPUT/'template-parts/home'/f'{name}.php';part.parent.mkdir(parents=True,exist_ok=True)
    tag='header' if name=='navigation' else 'footer' if name=='site-footer' else 'section'
    attrs=f'id="{name}" class="home-section {name}-section"'
    if name in headids:attrs+=' aria-labelledby="'+('homepage-title' if name=='hero' else 'heading-'+str(headids[name]))+'"'
    elif name=='statistics':attrs+=' aria-label="Oxen in numbers"'
    elif name=='partners':attrs+=' aria-label="Clients and partners"'
    elif name=='tax-intro':attrs+=' aria-label="Tax planning"'
    groups=GROUPS.get(name,[]); rendered=set(); chunks=[]
    nodes=section_nodes[name]
    if name=='navigation':nodes=sorted(nodes,key=lambda n:geom(n)[0])
    for n in nodes:
        nid=int(n['attrs']['data-node-id'].split(':')[1])
        group=next((i for i,(_,ids) in enumerate(groups) if nid in ids),None)
        if group is None: chunks.append(serialize(n,start,root=True));continue
        if group in rendered:continue
        rendered.add(group); groupclass,ids=groups[group]
        members=[v for v in section_nodes[name] if int(v['attrs']['data-node-id'].split(':')[1]) in ids]
        # Preserve the original paint order in CSS, while reading and tabbing
        # through each component in its visible top-to-bottom order.
        members.sort(key=lambda v:(round(geom(v)[1],2),geom(v)[0]))
        group_origin=None
        if groupclass.startswith('service-card'):
            bg=next(i for i in (122,136,559,147) if i in ids)
            gx,gy,gw,gh,_=geom(by_id[bg]);group_origin=(gx,gy)
            css.append('@media (min-width:1440px) {.services-section .'+groupclass.split()[-1]+' {display:grid;grid-area:1/1;align-self:start;justify-self:start;width:'+str(gw)+'px;height:'+str(gh)+'px;margin-left:'+str(gx)+'px;margin-top:'+str(gy-start)+'px;overflow:clip;}}')
            fluid.append('.services-section .'+groupclass.split()[-1]+' {width:'+str(gw/1440*100)+'%;margin-left:'+str(gx/1440*100)+'%;}')
        metric_ids=({461,462,463,464} if 461 in ids else {477,478,479,480}) if groupclass=='result-card' else set()
        bodies=[];metrics_rendered=False
        for v in members:
            vid=int(v['attrs']['data-node-id'].split(':')[1])
            if vid in metric_ids:
                if not metrics_rendered:
                    sorted_metrics=sorted(metric_ids)
                    units=[serialize(by_id[i],start,root=True)+serialize(by_id[j],start,root=True) for i,j in zip(sorted_metrics[:2],sorted_metrics[2:])]
                    bodies.append('<div class="metric-pair">'+''.join('<div class="metric-unit">'+u+'</div>' for u in units)+'</div>');metrics_rendered=True
            else:bodies.append(serialize(v,start,root=True,local_origin=group_origin))
        body='\n'.join(bodies)
        # Natural reading order is defined from the original vertical measurements.
        for member in members:
            memberid=int(member['attrs']['data-node-id'].split(':')[1]);order=round(geom(member)[1]*10)
            css.append('.layer-'+str(memberid)+' {--reading-order: '+str(order)+';}')
        if groupclass=='calculator-form':
            chunks.append('<form id="tax-form" class="responsive-group calculator-form" aria-label="New Zealand income tax estimate">'+body+'</form>')
        else:
            chunks.append('<div class="responsive-group '+groupclass+'">'+body+'</div>')
    content='\n'.join(chunks)
    if name=='services':
        # Keep the reading and keyboard order aligned with the visible tiers.
        cfo=next((c for c in chunks if c.startswith('<div class="responsive-group service-card service-cfo"')),None)
        if cfo:
            chunks.remove(cfo)
            advisory=next(i for i,c in enumerate(chunks) if c.startswith('<div class="responsive-group service-card service-advisory"'))
            chunks.insert(advisory+1,cfo);content='\n'.join(chunks)
    if name=='hero':content+='<div class="hero-blur" aria-hidden="true"></div>'
    if name=='navigation':content='<nav aria-label="Main navigation" class="desktop-navigation">'+content+'</nav>\n<button class="menu-toggle" aria-expanded="false" aria-controls="mobile-navigation" type="button">Menu <span aria-hidden="true">☰</span></button>\n<nav id="mobile-navigation" class="mobile-navigation" aria-label="Mobile navigation" hidden><a href="#services">Services</a><a href="#about">About us</a><a href="#calculator">Resources</a><a href="#results">Client stories</a><a href="#contact">Contact us</a></nav>'
    if name=='quiz':content+='\n<div class="quiz-controls"><button type="button" data-quiz-back hidden>Back</button><button type="button" data-quiz-restart hidden>Start again</button><a href="#services" data-quiz-result-link hidden>View your recommended service</a><p id="quiz-result" role="status"></p></div>'
    if name=='calculator':content+='\n<div class="partnership-control" hidden><label for="partner-count">Number of equal-share partners</label><input form="tax-form" id="partner-count" name="partners" type="number" min="2" max="100" value="2"></div><p id="tax-error" class="tax-error" role="alert"></p><p id="tax-status" class="sr-only" role="status" aria-live="polite"></p>'
    if name=='testimonials':content+='\n<button class="slider-previous" type="button" data-slider-previous aria-label="Previous client story">Previous</button><span class="sr-only" id="slider-position" role="status">Client story 1 of 3</span>'
    if name=='site-footer':content+='\n<button class="contrast-toggle" type="button" data-contrast-toggle aria-pressed="false">Increase text contrast</button>'
    part.write_text('<?php defined( \'ABSPATH\' ) || exit; ?>\n<'+tag+' '+attrs+'>\n'+content+'\n</'+tag+'>\n',encoding='utf-8')
    css.append('.'+name+'-section {height: '+str(round(end-start,4))+'px;}')

(OUTPUT/'assets/css').mkdir(parents=True,exist_ok=True)
(OUTPUT/'assets/css/homepage.css').write_text('/* Original Figma 1:3 geometry, translated to native CSS Grid compositions. */\n'+'\n'.join(css)+'\n',encoding='utf-8')
(OUTPUT/'assets/css/wide-measurements.css').write_text('/* Fluid source anchors; component layout and image crops are in wide.css. */\n@media (min-width:1441px) {\n'+'\n'.join(fluid)+'\n}\n',encoding='utf-8')
# Record names/slots rather than temporary URLs in the repository.
(OUTPUT/'assets/asset-map.json').write_text(json.dumps([{'name':a['name'],'file':a['file']} for a in manifest],indent=2),encoding='utf-8')
print(f'Staged {len(SECTIONS)} PHP sections; {len(css)} native CSS rules; {len(used)} img assets used. Masks are recorded separately in CSS.')
print('Image assets not directly used as img:',sorted({a['file'] for a in manifest}-used))

generated=sorted(p.relative_to(OUTPUT) for p in OUTPUT.rglob('*') if p.is_file())
# Ignore platform newline differences; leave matching live files byte-for-byte intact.
changed=[p for p in generated if not (ROOT/p).exists() or (ROOT/p).read_text(encoding='utf-8') != (OUTPUT/p).read_text(encoding='utf-8')]
if not changed:
    print(f'PASS: all {len(generated)} generated files match the current theme; no regeneration needed.')
elif not args.write:
    print('CHECK: generated differences (theme files were not modified):')
    for p in changed:print('  '+p.as_posix())
    raise SystemExit(1)
else:
    backup=backup_root/datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
    protected=sorted(set(ROOT.glob('*.php')) | set((ROOT/'template-parts').rglob('*.php')) | set((ROOT/'assets/css').glob('*.css')) | set((ROOT/'assets/js').glob('*.js')) | {ROOT/'assets/asset-map.json',Path(__file__).resolve(),ROOT/'tools/flat-layers.json'})
    records=[]
    for source in protected:
        relative=source.relative_to(ROOT)
        target=backup/relative;target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(source,target)
        digest=hashlib.sha256(source.read_bytes()).hexdigest()
        if hashlib.sha256(target.read_bytes()).hexdigest()!=digest:
            raise RuntimeError('Backup verification failed: '+relative.as_posix())
        records.append({'file':relative.as_posix(),'sha256':digest})
    head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()
    (backup/'manifest.json').write_text(json.dumps({'git_head':head,'files':records,'generated_changes':[p.as_posix() for p in changed]},indent=2),encoding='utf-8')
    print('Verified backup: '+str(backup))
    for relative in changed:
        target=ROOT/relative;target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(OUTPUT/relative,target)
    print(f'Applied {len(changed)} changed generated files. Review the backup diff and reapply intentional custom changes before browser/screenshot validation.')
