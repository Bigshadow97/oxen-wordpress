"""Build OFL-licensed Latin WOFF2 subsets without changing font outlines/features."""
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent/'performance-runtime/python'))
from fontTools import subset
source=Path(sys.argv[1])
for name in ['noto-serif-400-normal','noto-serif-400-italic','playfair-display-400-normal']:
 options=subset.Options()
 options.flavor='woff2'
 options.layout_features=['*']
 options.name_IDs=['*']
 options.name_languages=['*']
 options.recalc_timestamp=False
 font=subset.load_font(str(source/(name+'.ttf')),options)
 builder=subset.Subsetter(options=options)
 builder.populate(unicodes=subset.parse_unicodes('0000-024F,2000-206F,20A0-20CF,2190-21FF,2212'))
 builder.subset(font)
 target=Path('assets/fonts')/(name+'.woff2')
 subset.save_font(font,str(target),options)
 print(name, target.stat().st_size)
