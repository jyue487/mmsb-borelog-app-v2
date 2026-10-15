"""Diffs two directories of page PNGs: pixels that differ at all, per page, and missing or extra pages.

    python pixel_diff.py <reference-dir> <port-dir>
"""
import glob
import os
import sys

from PIL import Image, ImageChops

ref_dir, port_dir = sys.argv[1:3]
ref_pages = {os.path.basename(p) for p in glob.glob(os.path.join(ref_dir, '*.png'))}
port_pages = {os.path.basename(p) for p in glob.glob(os.path.join(port_dir, '*.png'))}
total = 0
for name in sorted(ref_pages | port_pages):
    if name not in port_pages:
        print(f'  {name}: missing from the port'); total += 1; continue
    if name not in ref_pages:
        print(f'  {name}: extra page in the port'); total += 1; continue
    diff = ImageChops.difference(Image.open(os.path.join(ref_dir, name)).convert('L'),
                                 Image.open(os.path.join(port_dir, name)).convert('L'))
    px = diff.size[0] * diff.size[1] - diff.histogram()[0]
    total += px
    if px:
        print(f'  {name}: {px} px differ, within {diff.getbbox()}')
print(f'{len(ref_pages)} reference page(s), {total} differing pixel(s) or page(s) in all')
