import { loadMeteosRaw } from '../src/meteo-provider.ts';
import { METEO_HOURS } from '../src/world/meteo-meta.ts';
import { encode } from 'fast-png';
import { writeFileSync } from 'node:fs';
import { range } from '../src/granite/numbers.ts';

async function main() {
  const dpr = 73;
  const w = 24 * dpr;

  const meteos = await loadMeteosRaw();
  const totalMeteos = meteos.length;

  const temps = 2;
  const rads = 8;
  const datums = temps + rads;

  const img = new Uint8Array(totalMeteos * datums * 365 * 24);
  let idx = 0;
  const push = (val: number) => {
    if (val < 0 || val > 1) {
      throw new Error(`Invalid value: ${val} at (${idx})`);
    }
    img[idx++] = Math.floor(val * 255);
  };

  const tempMin = Math.min(
    ...meteos.map(({ temp, app }) => Math.min(...temp, ...app)),
  );
  const tempMax = Math.max(
    ...meteos.map(({ temp, app }) => Math.max(...temp, ...app)),
  );

  const radMax = Math.max(
    ...meteos.map((m) => Math.max(...m.rads.map((v) => Math.max(...v)))),
  );

  const interleavedHours = [
    12, 13, 11, 14, 10, 15, 9, 16, 8, 17, 7, 18, 6, 19, 5, 20, 4, 21, 3, 22, 2,
    23, 1, 0,
  ] as const;

  const ntemp = (temp: number) => (temp - tempMin) / (tempMax - tempMin);

  for (let m = 0; m < totalMeteos; ++m) {
    for (let h = 0; h < METEO_HOURS; ++h) {
      push(ntemp(meteos[m].temp[h]));
    }

    for (let h = 0; h < METEO_HOURS; ++h) {
      push(ntemp(meteos[m].app[h]));
    }
  }

  for (const h of interleavedHours) {
    for (let d = 0; d < 365; ++d) {
      for (let m = 0; m < totalMeteos; ++m) {
        for (let r = 0; r < rads; ++r) {
          push(meteos[m].rads[r][d * 24 + h] / radMax);
        }
      }
    }
  }

  writeFileSync(
    'a.png',
    encode({
      width: 1752,
      height: 1250,
      data: img,
      depth: 8,
      channels: 1,
    }),
  );
}

await main();
