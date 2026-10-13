"""Prints what the Python parsers read from each workbook, for scripts/dumpParsed.ts to be diffed against.

    python dump_parsed.py <python-repo> <xlsx>...
"""
import dataclasses
import json
import os
import sys

import openpyxl

sys.path.insert(0, sys.argv[1])
from parsers.parse_borehole_information import parse_borehole_information  # noqa: E402
from parsers.parse_core_information import parse_core_information  # noqa: E402
from parsers.parse_geology_information import parse_geology_information  # noqa: E402
from parsers.parse_progress_information import parse_progress_information  # noqa: E402
from parsers.parse_project_information import parse_project_information  # noqa: E402
from parsers.parse_sample_information import parse_sample_information  # noqa: E402
from parsers.parse_spt_information import parse_spt_information  # noqa: E402


def sheet(wb, name):
    found = [s for s in wb.sheetnames if s.strip() == name]
    return wb[found[-1]] if found else None


out = {}
for path in sys.argv[2:]:
    wb = openpyxl.load_workbook(path, data_only=True)
    spt = sheet(wb, 'SPT - AGS (2)') or sheet(wb, 'SPT - AGS')
    d = dataclasses.asdict
    out[os.path.basename(path)] = dict(
        project=d(parse_project_information(sheet(wb, 'Project - AGS'))),
        borehole=d(parse_borehole_information(sheet(wb, 'Holes - AGS'))),
        progress=[d(x) for x in parse_progress_information(sheet(wb, 'Progress - AGS'))],
        spt=[d(x) for x in parse_spt_information(spt)],
        geology=[{k: v for k, v in d(x).items() if k != 'strat_desc_overflow'}
                 for x in parse_geology_information(sheet(wb, 'Geology - AGS'))],
        samples=[d(x) for x in parse_sample_information(sheet(wb, 'Samples - AGS'))],
        cores=[d(x) for x in parse_core_information(sheet(wb, 'Core - AGS'))],
    )
print(json.dumps(out, sort_keys=True))
