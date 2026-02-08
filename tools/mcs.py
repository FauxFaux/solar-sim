import pandas as pd
import json
import pathlib

assets = pathlib.Path(__file__).parent.parent.resolve() / 'src' / 'assets'

def main():
    out = []

    f = pd.ExcelFile('mcs.xlsx')
    for i, sheet in enumerate(f.sheet_names):
        print(sheet)
        data = f.parse(sheet)
        this_out = []
        for i, row in enumerate(data[1:].itertuples()):
            rounded = [round(x) for x in list(row)[3:]]
            if i % 2 == 0:
                rounded.reverse()
            this_out.extend(rounded)
        out.append(delta_encode(delta_encode(this_out)))

    with open(assets / 'mcs.json', 'w') as f:
        json.dump(out, f, separators=(',', ':'))


def delta_encode(lst):
    nl = []
    prev = 0
    for x in lst:
        nl.append(x - prev)
        prev = x
    return nl

def chunks(xs, n):
    n = max(1, n)
    return [xs[i:i+n] for i in range(0, len(xs), n)]

if __name__ == '__main__':
    main()
