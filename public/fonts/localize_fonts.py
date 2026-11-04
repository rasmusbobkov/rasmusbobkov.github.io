# Localize Google Fonts subsets: download woff2 files, rewrite @font-face to local URLs
import re
import subprocess
from pathlib import Path

here = Path(__file__).parent
out_css = []

SUBSETS = ('latin', 'latin-ext', 'vietnamese')

for css_file in ('fraunces.css', 'fraunces-i.css', 'inter.css', 'jbm.css'):
    text = (here / css_file).read_text()
    for comment, block in re.findall(r'/\*\s*([a-z-]+)\s*\*/\s*(@font-face\s*\{[^}]+\})', text):
        if comment not in SUBSETS:
            continue
        m = re.search(r'url\((https://fonts\.gstatic\.com/[^)]+)\)', block)
        if not m:
            continue
        url = m.group(1)
        fam = re.search(r"font-family:\s*'([^']+)'", block).group(1).lower().replace(' ', '-')
        style = 'italic' if 'font-style: italic' in block else 'normal'
        fname = f'{fam}-{style}-{comment}.woff2'
        target = here / fname
        if not target.exists():
            subprocess.run(['curl', '-fsSL', '-o', str(target), url], check=True)
        out_css.append(block.replace(url, f'./{fname}'))

(here / 'fonts.css').write_text('\n'.join(out_css) + '\n')
print('fonts.css written,', len(out_css), 'faces')
