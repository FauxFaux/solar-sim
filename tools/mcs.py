import pandas as pd
import json
import pathlib

assets = pathlib.Path(__file__).parent.parent.resolve() / 'src' / 'assets'

out = []

f = pd.ExcelFile('mcs.xlsx')
for i, sheet in enumerate(f.sheet_names):
    print(sheet)
    data = f.parse(sheet)
    this_out = []
    for row in data[1:].itertuples():
        this_out.append(list(row)[3:])
    out.append(this_out)

with open(assets / 'mcs.json', 'w') as f:
    json.dump(out, f, separators=(',', ':'))
