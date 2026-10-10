"""Audit and optimise known theme assets before the separate WordPress import.
Requires Pillow/lxml; original sources are never modified. Outputs an import
manifest, secure SVGs, colour-managed modern images and uncropped variants.
"""
from pathlib import Path
from PIL import Image,ImageOps,ImageCms,ImageChops,ImageStat
from lxml import etree
import argparse,json,re,hashlib,io,math
parser=argparse.ArgumentParser();parser.add_argument('--source',required=True);parser.add_argument('--output',default='tools/media-build/optimized');args=parser.parse_args()
source=Path(args.source).resolve();output=Path(args.output).resolve();output.mkdir(parents=True,exist_ok=True)
baseline_file=Path('tools/screenshots/media-performance/baseline.json')
baseline=json.loads(baseline_file.read_text()) if baseline_file.exists() else []
usage={}
for directory in ['assets/css','assets/js','inc','template-parts']:
 for p in Path(directory).rglob('*'):
  if p.suffix in ['.css','.js','.php']:
   for name in re.findall(r'[\w-]+\.(?:png|svg)',p.read_text(encoding='utf-8-sig')):usage.setdefault(name,set()).add(str(p).replace('\\','/'))
for f in ['header.php','footer.php']:
 for name in re.findall(r'[\w-]+\.(?:png|svg)',Path(f).read_text()):usage.setdefault(name,set()).add(f)
keys={'image15.png':'hero_portrait','texture-picture-from-unsplash1.png':'hero_background','image3.png':'site_logo','image14.png':'google_review_logo','image16.png':'footer_partner_logo','image6.png':'partner_bootleg','image7.png':'partner_cali_woods','image8.png':'partner_low_carb_haven','image9.png':'partner_manage','image10.png':'partner_follow','image11.png':'partner_tikitibu','rectangle28.png':'case_study_manufacturing','rectangle48.png':'case_study_professional_services','rectangle32.png':'service_cfo_background','team-photos-fauxels4.png':'testimonial_background','team-photos-fauxels6.png':'about_team_image','ellipse2147.png':'team_portrait_jeremy','ellipse2148.png':'team_portrait_accountant','ellipse2149.png':'team_portrait_adviser','ellipse2150.png':'team_portrait_manager','ellipse2151.png':'team_portrait_associate','rectangle30.svg':'calculator_results_mask','rectangle31.svg':'testimonial_mask','rectangle33.svg':'quiz_skip_mask','rectangle34.svg':'about_photo_mask','rectangle35.svg':'process_card_mask','rectangle44.svg':'footer_badge_mask','ellipse2137.svg':'status_indicator','ellipse2141.svg':'quiz_step_active','ellipse2142.svg':'quiz_step_inactive','frame1.svg':'service_checkmark','frame.svg':'google_review_star'}
alts={'hero_portrait':'Jeremy Wilson, Founder and Managing Director of Oxen','site_logo':'Oxen Accounting','google_review_logo':'Google','footer_partner_logo':'Regional Business Partner Network','partner_bootleg':'Bootleg Jerky Co','partner_cali_woods':'Cali Woods','partner_low_carb_haven':'Low Carb Haven','partner_manage':'Manage','partner_follow':'Follow','partner_tikitibu':'Tikitibu'}
# After migration, semantic fields retain the audited original/component relationship.
existing_manifest=Path('inc/media-manifest.json')
if existing_manifest.exists():
 for field in json.loads(existing_manifest.read_text())['assets']:
  keys[field['source']]=field['key']
  usage.setdefault(field['source'],set()).update(field['components'])
# Strict passive SVG allowlist: no script, foreignObject, external references or event attributes.
tags={'svg','g','defs','path','rect','circle','ellipse','line','polyline','polygon','linearGradient','radialGradient','stop','clipPath','mask','filter','feGaussianBlur','feBlend','feFlood','feComposite','feColorMatrix','feOffset','feMerge','feMergeNode','feComponentTransfer','feFuncR','feFuncG','feFuncB','feFuncA','feDropShadow','use','title','desc'}
def sanitize_svg(data):
 if re.search(br'<!DOCTYPE|<!ENTITY',data,re.I):raise ValueError('DTD/entities are forbidden')
 root=etree.fromstring(data,etree.XMLParser(resolve_entities=False,no_network=True,remove_comments=True))
 for node in root.iter():
  if not isinstance(node.tag,str):continue
  if etree.QName(node).localname not in tags:raise ValueError('Unsafe SVG element: '+node.tag)
  for k,v in node.attrib.items():
   name=etree.QName(k).localname.lower()
   if name.startswith('on') or name in ['src'] or (name=='href' and not v.startswith('#')):raise ValueError('Unsafe SVG attribute')
   if re.search(r'javascript:|@import|expression\s*\(|(?:https?|file|data):',v,re.I):raise ValueError('Unsafe SVG reference')
   if any(not x.strip(' \"\'').startswith('#') for x in re.findall(r'url\(([^)]+)\)',v,re.I)):raise ValueError('External SVG resource')
 vb=[float(n) for n in root.get('viewBox','0 0 1 1').split()];w=float(re.sub(r'px$','',root.get('width',str(vb[2]))));h=float(re.sub(r'px$','',root.get('height',str(vb[3]))))
 return etree.tostring(root,encoding='utf-8'),max(1,round(w)),max(1,round(h))
records=[];audit=[];used_keys=set();dedup={};variants_total=0
for p in sorted(source.iterdir()):
 if p.suffix not in ['.png','.svg']:continue
 original=p.read_bytes();digest=hashlib.sha256(original).hexdigest();row={'source':p.name,'format':p.suffix[1:],'original_bytes':len(original),'source_sha256':digest,'used':p.name in usage,'components':sorted(usage.get(p.name,[]))}
 # Actual image CSS dimensions are recorded independently of viewport width.
 display=[]
 for v in baseline:
  for i in v['images']:
   if i['file']==p.name:display.append({'viewport':v['width'],'width':i['width'],'height':i['height'],'class':i['class'],'section':i['section'],'alt':i['alt']})
 row['display']=display
 if p.suffix=='.svg':clean,w,h=sanitize_svg(original);row.update(width=w,height=h,transparency=True)
 else:
  original_image=Image.open(p);row.update(width=original_image.width,height=original_image.height,transparency='A' in original_image.mode,icc_profile=bool(original_image.info.get('icc_profile')))
 if not row['used']:audit.append(row);continue
 key=keys.get(p.name)
 if not key:
  first=next((i['class'] for i in display if i['class'] and not i['class'].startswith('section__')),None)
  if not first:
   first=next((i['class'] for v in baseline for i in v['backgrounds'] if p.name in i['value'] and i['class']),None)
  if not first:
   # Find the nearest explicitly named parent recipe for an asset without a direct class.
   text=Path(row['components'][0]).read_text();pos=text.find(p.name);classes=re.findall(r'(?:class[=\x27\"\s>]+)([a-z][\w-]+)',text[max(0,pos-300):pos]);first=classes[-1] if classes else p.stem
  key=re.sub(r'[^a-z0-9]+','_',first.split()[0].replace('__','_').replace('--','_').removesuffix('-image')).strip('_')
  key=key.removesuffix('_image')
 if key in used_keys:key+='_'+re.sub(r'[^a-z0-9]+','_',p.stem)
 used_keys.add(key)
 rec={'key':key,'source':p.name,'label':key.replace('_',' ').title(),'alt':alts.get(key,''),'decorative':key not in alts,'components':row['components'],'source_sha256':digest}
 if p.suffix=='.svg':
  filename=key+'.svg';(output/filename).write_bytes(clean);rec.update(file=filename,mime='image/svg+xml',width=w,height=h,sizes=[],bytes=len(clean),sha256=hashlib.sha256(clean).hexdigest())
 else:
  im=ImageOps.exif_transpose(original_image)
  if im.info.get('icc_profile'):
   alpha=im.getchannel('A') if 'A' in im.mode else None
   im=ImageCms.profileToProfile(im.convert('RGB'),ImageCms.ImageCmsProfile(io.BytesIO(im.info['icc_profile'])),ImageCms.createProfile('sRGB'),outputMode='RGB')
   if alpha is not None:im.putalpha(alpha)
  if im.mode not in ['RGB','RGBA']:im=im.convert('RGBA' if 'transparency' in im.info else 'RGB')
  if im.mode=='RGBA' and im.getchannel('A').getextrema()==(255,255):im=im.convert('RGB')
  lossless=key.startswith(('partner_','team_portrait_')) or key in ['site_logo','google_review_logo','footer_partner_logo']
  cap=im.width # Never upscale or discard useful pixels needed by existing masks/crops.
  fmt='WEBP' if lossless else 'AVIF';ext=fmt.lower();settings={'lossless':True,'method':6,'exact':True} if lossless else {'quality':90,'speed':6,'subsampling':'4:4:4','max_threads':2}
  filename=key+'.'+ext;im.save(output/filename,format=fmt,**settings);sizes=[]
  for width in [96,192,320,480,640,960,1280,1600,1920,2560]:
   if width>=cap:continue
   h=max(1,round(im.height*width/im.width));scaled=im.resize((width,h),Image.Resampling.LANCZOS);variant=f'{key}-{width}w.{ext}';scaled.save(output/variant,format=fmt,**settings)
   sizes.append({'name':f'oxen-{width}','file':variant,'width':width,'height':h,'mime-type':'image/'+ext,'filesize':(output/variant).stat().st_size,'sha256':hashlib.sha256((output/variant).read_bytes()).hexdigest()})
  data=(output/filename).read_bytes();rec.update(file=filename,mime='image/'+ext,width=im.width,height=im.height,sizes=sizes,bytes=len(data),sha256=hashlib.sha256(data).hexdigest(),lossless=lossless)
  # Compare colour-managed pixels at actual presentation scale, including alpha.
  decoded=Image.open(output/filename).convert(im.mode);size=(min(700,im.width),round(im.height*min(700,im.width)/im.width));diff=ImageChops.difference(im.resize(size,Image.Resampling.LANCZOS),decoded.resize(size,Image.Resampling.LANCZOS));row['presentation_mean_error']=ImageStat.Stat(diff).mean
  if max(row['presentation_mean_error'])>1.8:raise ValueError('Compression exceeds visual tolerance: '+p.name)
 variants_total+=len(rec['sizes']);records.append(rec);row.update(key=key,optimized_bytes=rec['bytes'],optimized_format=rec['mime']);audit.append(row)
manifest={'version':1,'assets':records,'summary':{'original_assets':len(audit),'used_assets':len(records),'unused_assets':[r['source'] for r in audit if not r['used']],'original_bytes':sum(r['original_bytes'] for r in audit),'used_original_bytes':sum(r['original_bytes'] for r in audit if r['used']),'optimized_master_bytes':sum(r['bytes'] for r in records),'variants':variants_total,'optimized_variant_bytes':sum(s['filesize'] for r in records for s in r['sizes'])}}
(output/'manifest.json').write_text(json.dumps(manifest,indent=2));Path('tools/media-audit.json').write_text(json.dumps({'images':audit,'summary':manifest['summary']},indent=2));Path('inc/media-manifest.json').write_text(json.dumps({'version':1,'assets':[{k:r[k] for k in ['key','source','label','alt','decorative','components']} for r in records]},indent=2))
print(json.dumps(manifest['summary'],indent=2))
