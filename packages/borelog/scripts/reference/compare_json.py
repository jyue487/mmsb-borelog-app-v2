"""Diffs two JSON documents by value (so 0 == 0.0) and prints where they differ.

    python compare_json.py <reference.json> <port.json> [cases.json]

With cases.json the documents are parallel lists of results, one per case.
"""
import json
import sys

a = json.load(open(sys.argv[1]))
b = json.load(open(sys.argv[2]))
cases = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else None
n = 0


def report(path, x, y):
    global n
    n += 1
    if n <= 10:
        print(f'  {path}\n    reference: {json.dumps(x)[:300]}\n    port:      {json.dumps(y)[:300]}')


def cmp(x, y, path):
    if isinstance(x, dict) and isinstance(y, dict):
        for k in sorted(set(x) | set(y)):
            cmp(x.get(k), y.get(k), f'{path}.{k}')
    elif isinstance(x, list) and isinstance(y, list) and cases is None:
        if len(x) != len(y):
            report(f'{path} (length)', len(x), len(y))
        for i, (p, q) in enumerate(zip(x, y)):
            cmp(p, q, f'{path}[{i}]')
    elif x != y:
        report(path, x, y)


if cases is not None:
    for case, x, y in zip(cases, a, b):
        if x != y:
            report(json.dumps(case)[:120], x, y)
else:
    cmp(a, b, '')
print(f'{n} difference(s)')
