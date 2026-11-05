#!/usr/bin/env python3
"""Conservative static checks for the Bolgsvenia Global GitHub Pages website."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import unquote, urlsplit
import sys, re

root = Path(__file__).resolve().parent.parent
fail = []
warn = []

class Paths(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.resources = []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'link' and a.get('rel') == 'stylesheet' and a.get('href'):
            self.resources.append((tag, a['href']))
        if tag == 'script' and a.get('src'):
            self.resources.append((tag, a['src']))
        if tag in ('img', 'source') and a.get('src'):
            self.resources.append((tag, a['src']))

def local_path(href):
    p = urlsplit(href)
    if p.scheme or p.netloc or href.startswith(('#', '//', 'data:', 'blob:')):
        return None
    path = unquote(p.path.lstrip('/'))
    if not path or '..' in Path(path).parts:
        return None
    return root / path

for essential in ('index.html','es.html','ca.html','assets/css/site-core.css',
                  'robots.txt','sitemap.xml','CNAME'):
    if not (root / essential).is_file(): fail.append('Missing essential: '+essential)

for f in sorted(root.glob('*.html')):
    html = f.read_text(encoding='utf-8')
    parser = Paths()
    try: parser.feed(html)
    except Exception as e: fail.append(f'{f.name}: invalid HTML parser input: {e}')
    for kind, href in parser.resources:
        t = local_path(href)
        if t and not t.is_file():
            if kind in ('script', 'link'):
                fail.append(f'{f.name}: missing {kind} asset {href}')
            else:
                warn.append(f'{f.name}: missing image/media {href}')
    if f.name in ('index.html','es.html','ca.html') and 'site-core.css' not in html:
        fail.append(f'{f.name}: missing Phase 1 stylesheet')

print('Bolgsvenia Global static verification')
print('HTML pages:',len(list(root.glob('*.html'))))
print('Warnings:',len(warn))
for warning in warn[:30]: print('WARNING:',warning)
for error in fail: print('ERROR:',error)
if fail: sys.exit(1)
print('PASS: essential HTML and referenced styles/scripts are present.')
