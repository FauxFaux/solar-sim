import { range } from '../src/granite/numbers.ts';
import {
  METEO_HOURS,
  TEMP_MAX,
  TEMP_MIN,
} from '../src/granite/meteo/meteo-meta.ts';
import { encode } from 'fast-png';
import { writeFileSync } from 'node:fs';
import { loadMeteosRaw } from '../src/granite/meteo/meteo-from-json.ts';

async function main() {
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

  if (tempMin !== TEMP_MIN || tempMax !== TEMP_MAX) {
    throw new Error(
      `Invalid temp range: ${tempMin} - ${tempMax}, please update TEMP_MIN/TEMP_MAX`,
    );
  }

  const radMax = Math.max(
    ...meteos.map((m) => Math.max(...m.rads.map((v) => Math.max(...v)))),
  );

  const ntemp = (temp: number) => (temp - tempMin) / (tempMax - tempMin);

  for (let m = 0; m < totalMeteos; ++m) {
    for (let h = 0; h < METEO_HOURS; ++h) {
      push(ntemp(meteos[m].temp[h]));
    }

    for (let h = 0; h < METEO_HOURS; ++h) {
      push(ntemp(meteos[m].app[h]));
    }
  }

  for (const h of range(24)) {
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
