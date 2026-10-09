"""Convert the read-only Figma JSX response into a neutral layer tree.

This is development tooling, not a browser framework or theme dependency.
"""
import re, json, html
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent
source = (ROOT / 'figma-reference.jsx').read_text(encoding='utf-8')
assets = {a['name']: a for a in json.loads((ROOT / 'assets.json').read_text())}
styles = []
def style(match):
    styles.append(match.group(1))
    return f'data-style="{len(styles)-1}"'
body = source[source.index('    <div'):source.rindex('\n  );')].strip()
body = re.sub(r'style=\{\{(.*?)\}\}', style, body)
body = re.sub(r'\{`(.*?)`\}', lambda m: html.escape(m.group(1)), body, flags=re.S)
body = re.sub(r'src=\{(\w+)\}', lambda m: f'src="{assets[m.group(1)]["file"]}"', body)
body = body.replace('className=', 'class=').replace('aria-hidden ', 'aria-hidden="true" ')
body = re.sub(r'<img\b([^>]*?)(?<!/)>', r'<img\1 />', body)
body = re.sub(r'&(?!#x[0-9a-fA-F]+;|#\d+;|amp;|quot;|lt;|gt;)', '&amp;', body)
tree = ET.fromstring(body)
meta = ET.fromstring((ROOT / 'figma-metadata.xml').read_text())
metadata = {n.get('id'): n.attrib for n in meta.iter()}
def encode(n):
    attrs = dict(n.attrib)
    if 'data-style' in attrs:
        attrs['figmaStyle'] = styles[int(attrs.pop('data-style'))]
    return {'tag':n.tag,'attrs':attrs,'text':n.text or '', 'tail':n.tail or '', 'children':[encode(c) for c in n], 'measurement':metadata.get(n.get('data-node-id'),{})}
data = encode(tree)
(ROOT / 'layers.json').write_text(json.dumps(data,ensure_ascii=False,indent=2), encoding='utf-8')
def flatten(n):
    if 'contents' in n['attrs'].get('class','').split():
        return [v for c in n['children'] for v in flatten(c)]
    return [n]
layers = [v for c in data['children'] for v in flatten(c)]
(ROOT / 'flat-layers.json').write_text(json.dumps(layers,ensure_ascii=False,indent=2), encoding='utf-8')
for n in layers:
    if n['tag'] in ['p','a'] or (n['tag']=='div' and any(c['tag']=='p' for c in n['children'])):
        text = ''.join(ET.fromstring(ET.tostring(tree)).itertext()) if False else ''
        def get_text(n): return n['text'] + ''.join(get_text(c)+c['tail'] for c in n['children'])
        text = re.sub(r'\s+',' ',get_text(n)).strip()
        m=n['measurement']
        print(n['attrs'].get('data-node-id'),m.get('x'),m.get('y'),text)
print(f'{len(layers)} positioned layers, {len(assets)} original assets')
