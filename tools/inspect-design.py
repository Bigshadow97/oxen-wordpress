"""Read the untouched Figma response and summarize text layers for implementation."""
from pathlib import Path
import re, html, json
from xml.etree import ElementTree as ET

root = Path(__file__).resolve().parent
code = (root / 'figma-reference.jsx').read_text(encoding='utf-8')
meta = ET.fromstring((root / 'figma-metadata.xml').read_text(encoding='utf-8'))
nodes = {n.get('id'): n.attrib for n in meta.iter()}
texts = []
for m in re.finditer(r'<(p|a|div)\b([^<>]*data-node-id="([^"]+)"[^<>]*)>(.*?)</\1>', code, re.S):
    body = m.group(4)
    if '<div' in body or '<img' in body:
        continue
    text = re.sub(r'<[^>]+>', '', body)
    text = re.sub(r'\{`(.*?)`\}', r'\1', text, flags=re.S)
    text = html.unescape(re.sub(r'\s+', ' ', text)).strip()
    if not text:
        continue
    node = nodes.get(m.group(3), {})
    texts.append({'id': m.group(3), 'x': round(float(node.get('x', 0)), 2), 'y': round(float(node.get('y', 0)), 2), 'w': round(float(node.get('width', 0)), 2), 'h': round(float(node.get('height', 0)), 2), 'text': text, 'class': re.search(r'className="([^"]+)"', m.group(2)).group(1)})
texts.sort(key=lambda n: (n['y'], n['x']))
(root / 'text-layers.json').write_text(json.dumps(texts, indent=2, ensure_ascii=False), encoding='utf-8')
for n in texts:
    print(f"{n['id']:6} x={n['x']:7} y={n['y']:8} w={n['w']:7} | {n['text']}")
