import { interleave, range } from '../src/granite/numbers.ts';
import { METEOS_TOTAL } from '../src/granite/meteo/meteo-meta.ts';
import { encode } from 'fast-png';
import { writeFileSync } from 'node:fs';
import { loadMeteosRaw } from '../src/granite/meteo/meteo-from-json.ts';

async function main() {
  const meteos = await loadMeteosRaw();
  const totalMeteos = meteos.length;

  const rads = 14;

  const img = new Uint8Array(totalMeteos * rads * 365 * 24);
  let idx = 0;
  const push = (val: number) => {
    if (val < 0 || val > 1) {
      throw new Error(`Invalid value: ${val} at (${idx})`);
    }
    img[idx++] = Math.floor(val * 255);
  };

  if (totalMeteos !== METEOS_TOTAL) {
    throw new Error(
      'constants mismatch, please update meta.ts, ' +
        JSON.stringify({ totalMeteos }),
    );
  }

  const radMax = Math.max(
    ...meteos.map((m) => Math.max(...m.rads.map((v) => Math.max(...v)))),
  );

  for (const h of interleave(24)) {
    for (const d of range(365)) {
      for (const m of range(METEOS_TOTAL)) {
        for (const rad of range(rads)) {
          push(meteos[m].rads[rad][d * 24 + h] / radMax);
        }
      }
    }
  }

  // 73
  const width = rads * METEOS_TOTAL * 4;
  const height = Math.ceil(img.length / width);
  // const img2 = new Uint8Array(width * height);
  // img2.set(img);
  writeFileSync(
    'a.png',
    encode({
      width,
      height,
      data: img,
      depth: 8,
      channels: 1,
    }),
  );
}

await main();
