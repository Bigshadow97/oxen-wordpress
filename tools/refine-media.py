"""Targeted compression refinement after the measured image-delivery audit."""
import hashlib,io,json,sys
from pathlib import Path
from PIL import Image,ImageOps,ImageCms,ImageChops,ImageStat
directory=Path('tools/media-build/optimized')
source=Path(sys.argv[1]) if len(sys.argv)>1 else Path('../../../..').resolve().parent.parent/'oxen-original-assets/images'
manifest=json.loads((directory/'manifest.json').read_text())
audit=json.loads(Path('tools/media-audit.json').read_text())
for asset in manifest['assets']:
 if asset['mime']!='image/avif':continue
 image=ImageOps.exif_transpose(Image.open(source/asset['source']))
 if image.info.get('icc_profile'):
  alpha=image.getchannel('A') if 'A' in image.mode else None
  image=ImageCms.profileToProfile(image.convert('RGB'),ImageCms.ImageCmsProfile(io.BytesIO(image.info['icc_profile'])),ImageCms.createProfile('sRGB'),outputMode='RGB')
  if alpha is not None:image.putalpha(alpha)
 if image.mode=='RGBA' and image.getchannel('A').getextrema()==(255,255):image=image.convert('RGB')
 for file in [asset]+asset['sizes']:
  scaled=image if file==asset else image.resize((file['width'],file['height']),Image.Resampling.LANCZOS)
  target=directory/file['file']
  scaled.save(target,format='AVIF',quality=90,speed=6,subsampling='4:4:4',max_threads=2)
  file['sha256']=hashlib.sha256(target.read_bytes()).hexdigest()
  file['bytes' if file==asset else 'filesize']=target.stat().st_size
 decoded=Image.open(directory/asset['file']).convert(image.mode)
 size=(min(700,image.width),round(image.height*min(700,image.width)/image.width))
 error=ImageStat.Stat(ImageChops.difference(image.resize(size,Image.Resampling.LANCZOS),decoded.resize(size,Image.Resampling.LANCZOS))).mean
 if max(error)>1.8:raise ValueError('Visual error threshold exceeded: '+asset['key'])
 row=next(r for r in audit['images'] if r['source']==asset['source'])
 row.update(optimized_bytes=asset['bytes'],presentation_mean_error=error)
 print(asset['key'],asset['bytes'],'mean error',error)
manifest['summary']['optimized_master_bytes']=sum(r['bytes'] for r in manifest['assets'])
manifest['summary']['optimized_variant_bytes']=sum(s['filesize'] for r in manifest['assets'] for s in r['sizes'])
audit['summary']=manifest['summary']
(directory/'manifest.json').write_text(json.dumps(manifest,indent=2))
Path('tools/media-audit.json').write_text(json.dumps(audit,indent=2))
