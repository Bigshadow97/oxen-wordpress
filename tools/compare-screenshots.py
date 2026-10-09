"""Compare the browser rendering with the original 1440px Figma screenshot."""
from pathlib import Path
from PIL import Image, ImageChops, ImageStat, ImageDraw
import json
ROOT=Path(__file__).resolve().parent
reference=Image.open(ROOT/'figma-reference.png').convert('RGB')
render=Image.open(ROOT/'screenshots/desktop-1440.png').convert('RGB')
sections=[('hero',0,984),('quiz',984,1900),('services',1900,3190),('about',3190,3930),('process',3930,4600),('results',4600,5390),('testimonials',5390,6240),('partners',6240,6550),('tax-intro',6550,7136),('calculator',7136,8020),('contact',8020,8443)]
report=[]
for name,y1,y2 in sections:
    box=(0,y1,1440,y2)
    a=reference.crop(box);b=render.crop(box)
    delta=ImageChops.difference(a,b)
    mae=sum(ImageStat.Stat(delta).mean)/3
    report.append({'section':name,'mean_absolute_channel_difference':round(mae,3)})
    pair=Image.new('RGB',(2880,y2-y1+36),'white')
    pair.paste(a,(0,36));pair.paste(b,(1440,36))
    draw=ImageDraw.Draw(pair);draw.text((16,10),'Original Figma',fill='black');draw.text((1456,10),'WordPress browser',fill='black')
    pair.save(ROOT/'screenshots'/f'compare-{name}.png')
(ROOT/'screenshots/visual-difference.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
for old in (ROOT/'screenshots').glob('inspect-*.png'):old.unlink()
for width in (390,768):
    im=Image.open(ROOT/'screenshots'/f'responsive-{width}.png')
    for i in range(0,im.height,1800):im.crop((0,i,width,min(i+1800,im.height))).save(ROOT/'screenshots'/f'inspect-{width}-{i//1800}.png')

baseline=ROOT/'screenshots/before-full-width-1440.png'
if baseline.exists():
    before=Image.open(baseline).convert('RGB')
    assert before.size==render.size, '1440px page dimensions changed'
    delta=ImageChops.difference(before,render)
    regression={'dimensions':render.size,'changed_pixel_bounds':delta.getbbox(),'mean_absolute_channel_difference':sum(ImageStat.Stat(delta).mean)/3}
    (ROOT/'screenshots/reference-regression.json').write_text(json.dumps(regression,indent=2))
    print('1440px regression:',json.dumps(regression))

for layout in json.loads((ROOT/'screenshots/full-width-layout.json').read_text()):
    width=layout['width']
    if width not in (1440,1600,1920,2560,1024,390):continue
    shot=Image.open(ROOT/'screenshots'/('desktop-1440.png' if width==1440 else f'responsive-{width}.png'))
    print('Capture',width,shot.size,'layout bottom',round(layout['sections'][-1]['y']+layout['sections'][-1]['height']))
    for start,end in [('navigation','statistics'),('quiz','services'),('about','results'),('testimonials','tax-intro'),('calculator','site-footer')]:
        first=next(s for s in layout['sections'] if s['id']==start)
        last=next(s for s in layout['sections'] if s['id']==end)
        shot.crop((0,int(first['y']),width,int(last['y']+last['height']))).save(ROOT/'screenshots'/f'wide-{width}-{start}.png')
