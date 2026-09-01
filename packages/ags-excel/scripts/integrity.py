"""Proves the exporter changed only what it meant to change.

    python3 packages/ags-excel/scripts/integrity.py [workbook.xlsx]

The template's worksheet formulas are the program that turns typed input into the AGS
output the report reads, so the guarantee this package sells is "everything not explicitly
written is untouched". That is only worth anything if it is checked: this compares every
zip entry of the output against the template and fails if anything outside the expected
set differs.
"""
import hashlib
import sys
import zipfile

TEMPLATE = 'apps/web/public/ags/template.xlsx'
DEFAULT = 'packages/ags-excel/out/fixture.xlsx'

# workbook.xml gains fullCalcOnLoad; the rest are the sheets we fill.
EXPECTED_CHANGES = {
    'xl/workbook.xml',
    'xl/worksheets/sheet1.xml',   # Project - AGS
    'xl/worksheets/sheet2.xml',   # Holes - AGS
    'xl/worksheets/sheet3.xml',   # Progress - AGS
    'xl/worksheets/sheet4.xml',   # SPT - AGS
    'xl/worksheets/sheet5.xml',   # Geology - AGS
    'xl/worksheets/sheet6.xml',   # Samples - AGS
    'xl/worksheets/sheet7.xml',   # Core - AGS
    'xl/worksheets/sheet8.xml',   # Water Strike - AGS
}

output = sys.argv[1] if len(sys.argv) > 1 else DEFAULT
template_zip = zipfile.ZipFile(TEMPLATE)
output_zip = zipfile.ZipFile(output)

template_names = set(template_zip.namelist())
output_names = set(output_zip.namelist())

failures = []

missing = template_names - output_names
added = output_names - template_names
if missing:
    failures.append(f'entries dropped from the workbook: {sorted(missing)}')
if added:
    failures.append(f'entries added to the workbook: {sorted(added)}')


def digest(archive, name):
    return hashlib.sha256(archive.read(name)).hexdigest()


shared = sorted(template_names & output_names)
changed = {n for n in shared if digest(template_zip, n) != digest(output_zip, n)}

unexpected = changed - EXPECTED_CHANGES
if unexpected:
    failures.append(f'parts changed that should not have been: {sorted(unexpected)}')

print(f'{len(shared) - len(changed)}/{len(shared)} entries byte-identical to the template')
print(f'changed: {sorted(changed)}')

# The formulas are the point. Nothing may add or remove one.
for name in sorted(changed & {n for n in changed if n.startswith('xl/worksheets/')}):
    before = template_zip.read(name).decode('utf-8').count('<f')
    after = output_zip.read(name).decode('utf-8').count('<f')
    status = 'ok' if before == after else 'CHANGED'
    print(f'    {name}: {before} -> {after} formulas [{status}]')
    if before != after:
        failures.append(f'{name} formula count changed {before} -> {after}')

if failures:
    print('\nFAILED:')
    for failure in failures:
        print(f'  - {failure}')
    raise SystemExit(1)

print('\nOK: only the intended parts changed, and every formula survived.')
