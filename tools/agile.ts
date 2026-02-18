// https://agile.octopushome.net/historical-data (SE)

import Papa from 'papaparse';
import { readFileSync } from 'fs';
import { range } from '../src/granite/numbers.ts';
import { writeFileSync } from 'node:fs';
import { deltaEncode } from '../src/system/mcs-meta.ts';

async function main() {
  const doc = Papa.parse(
    readFileSync(
      'agile-half-hour-actual-rates-01-01-2025_31-12-2025.csv',
      'utf-8',
    ),
  );
  const rates = doc.data as string[][];

  function col(colNo: number) {
    const halfHour = rates
      .slice(1)
      .map((v) => Math.round(parseFloat(v[colNo]) * 100));
    return range(halfHour.length / 2).map((i) =>
      Math.round((halfHour[i * 2] + halfHour[i * 2 + 1]) / 2),
    );
  }

  const imp = col(2);
  const exp = col(3);

  writeFileSync(
    '../src/assets/agile-2025.json',
    JSON.stringify({
      imp: deltaEncode(imp),
      exp: deltaEncode(exp),
    }),
  );
}

await main();
