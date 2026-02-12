import { readFileSync } from 'fs';
import { writeFileSync } from 'node:fs';

async function main() {
  const datums = readFileSync('./2025-01-01-pv-live.csv', 'utf-8')
    .split('\n')
    .slice(1)
    .map((line) => {
      const [_id, date, gen] = line.split(',');
      return [date, parseFloat(gen)] as const;
    })
    .filter(([_, gen]) => isFinite(gen));
  const doc = [];
  const row = [];
  let nought = 0;
  let cd = '';
  for (let [date, gen] of datums.reverse()) {
    const [day, hourS, min] = date.split(/[T:]/);
    const hour = parseInt(hourS);
    if (hour < 5 || hour > 20) continue;
    if (min === '00') {
      nought = gen;
      continue;
    }
    gen += nought;

    if (cd !== day) {
      if (row.length) doc.push([...row]);
      row.length = 0;
      cd = day;
    }
    row.push(gen);
  }
  const max = Math.max(...doc.flat());
  for (const row of doc) {
    for (let i = 0; i < row.length; i++) {
      row[i] = Math.round((row[i] / max) * 1000);
    }
  }
  writeFileSync('../src/assets/pv-live.json', JSON.stringify(doc));
}

await main();
