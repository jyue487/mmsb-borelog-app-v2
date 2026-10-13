"""reportlab's side of scripts/paragraphCheck.ts.

    python paragraph_check.py <cases.json> <out.json>
"""
import json
import sys
from reportlab.platypus import Paragraph, KeepInFrame
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfgen import canvas
c = canvas.Canvas('/dev/null')  # only measured against, never saved
out = []
def lines_of(p):
    bl = getattr(p, 'blPara', None)
    if bl is None: return None
    res = []
    for l in bl.lines:
        if bl.kind == 0: res.append([' '.join(l[1]), round(l[0], 4)])
        else: res.append([''.join(w.text for w in l.words).strip(), round(l.extraSpace, 4)])
    return res
for case in json.load(open(sys.argv[1])):
    st = ParagraphStyle(name='s', fontName='Helvetica', fontSize=case['size'], leading=case['leading'])
    r = {}
    if case.get('kif'):
        k = KeepInFrame(maxWidth=case['w'], maxHeight=case['h'], content=[Paragraph(case['text'], st)], mode='shrink')
        w, h = k.wrapOn(c, case['w'], case['h'])
        r = {'kif': [round(w, 3), round(h, 3), round(getattr(k, '_scale', 1.0), 6)]}
    else:
        p = Paragraph(case['text'], st)
        w, h = p.wrap(case['w'], case['h'])
        r['lines'] = lines_of(p); r['h'] = h
        p2 = Paragraph(case['text'], st)
        parts = p2.splitOn(c, case['w'], case['h'])
        r['split'] = len(parts) if not parts or parts[0] is not p2 else 'self'
        if parts and len(parts) > 1:
            r['p1'] = round(parts[0].wrap(case['w'], case['h'])[1], 4)
            r['p2'] = lines_of(parts[1]) if parts[1].wrap(case['w'], 1e6) else None
    out.append(r)
json.dump(out, open(sys.argv[2], 'w'), indent=0)
