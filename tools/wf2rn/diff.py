#!/usr/bin/env python3
"""Compare app screenshots with wireframe screenshots and report the share of pixels that differ.

  python3 tools/wf2rn/diff.py <app_png_dir> <wireframe_png_dir> <out.png> ID=Wireframe-Name ...

The tab bar zone (bottom 84 px) is ignored; the app draws its own. Writes a sheet: app | wireframe | overlay.
"""
import sys
from PIL import Image, ImageChops, ImageDraw

app_dir, wf_dir, out = sys.argv[1:4]
pairs = [a.split('=') for a in sys.argv[4:]]
W, H, SKIP = 390, 844, 84
sheet = Image.new('RGB', (len(pairs) * 1200, H + 40), 'white')
d = ImageDraw.Draw(sheet)
for i, (a, w) in enumerate(pairs):
    A = Image.open(f'{app_dir}/{a}.png').convert('RGB').resize((W, H))
    B = Image.open(f'{wf_dir}/{w}.png').convert('RGB').resize((W, H))
    D = ImageChops.difference(A, B).convert('L').point(lambda v: 255 if v > 48 else 0)
    crop = D.crop((0, 0, W, H - SKIP))
    pct = sum(1 for v in crop.get_flattened_data() if v) / (W * (H - SKIP)) * 100
    over = B.copy()
    over.paste(Image.new('RGB', B.size, (230, 40, 40)), mask=D)
    x = i * 1200
    sheet.paste(A, (x, 36)); sheet.paste(B, (x + 400, 36)); sheet.paste(over, (x + 800, 36))
    d.text((x + 4, 10), f'APP {a}   |   WIREFRAME {w}   |   {pct:.1f}% of pixels differ', fill='black')
    print(f'{a:8s} {w:28s} {pct:5.1f}%')
sheet.save(out)
