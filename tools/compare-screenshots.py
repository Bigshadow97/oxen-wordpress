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
