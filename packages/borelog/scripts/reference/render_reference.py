"""Renders each workbook with the Python program itself: the reference the port is diffed against.

    python render_reference.py <python-repo> <out-dir> <xlsx>...
"""
import os
import sys

import openpyxl

repo, out_dir, workbooks = sys.argv[1], sys.argv[2], sys.argv[3:]
sys.path.insert(0, repo)
os.chdir(repo)  # the program finds its assets relative to the working directory
from logics.generate_borelog_pdf import generate_borelog_pdf  # noqa: E402

for path in workbooks:
    name = os.path.splitext(os.path.basename(path))[0]
    generate_borelog_pdf(wb=openpyxl.load_workbook(path, data_only=True), output_file_name=os.path.join(out_dir, name))
