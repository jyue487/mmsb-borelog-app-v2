"""Builds paragraph test cases from every description, project name and remark the parsers read,
plus a few synthetic ones (over-long words, markup), at the widths and heights the borelog uses.

    python paragraph_cases.py <parsed.json> <cases.json>
"""
import json
import sys

parsed = json.load(open(sys.argv[1]))
texts = {'', '   ',
         'Supercalifragilisticexpialidociousandthensomemoretextthatgoesonforeverwithoutanybreaks short',
         'a b ' + 'X' * 80 + ' c',
         'Firm <i>SPT</i> sandy <b>bold</b> silt with gravel and more words here to wrap',
         'G &amp; P soft clay',
         "<para align='center'>Hole Type<br/>Rotary<br/></para>"}
for f in parsed.values():
    texts |= {f['project']['name'], f['project']['location'], f['borehole']['general_remarks']}
    texts |= {g['stratum_description'] for g in f['geology']}
cases = []
for t in sorted(texts):
    for w in [40, 83.1, 145.72, 200, 352.4]:
        for h in [5, 13.5, 20, 60, 400]:
            cases.append({'text': t, 'w': w, 'h': h, 'size': 6.5, 'leading': 6.5})
    cases.append({'text': t, 'w': 300, 'h': 28.3, 'size': 9, 'leading': 9, 'kif': True})
    cases.append({'text': t, 'w': 150, 'h': 20, 'size': 8, 'leading': 8, 'kif': True})
json.dump(cases, open(sys.argv[2], 'w'))
