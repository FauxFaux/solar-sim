import { interleave, range } from '../src/granite/numbers.ts';
import {
  METEO_HOURS,
  METEOS_TOTAL,
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
  const rads = 14;
  const datums = temps + rads;

  const img = new Uint8Array(totalMeteos * rads * 365 * 24);
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

  if (
    tempMin !== TEMP_MIN ||
    tempMax !== TEMP_MAX ||
    totalMeteos !== METEOS_TOTAL
  ) {
    throw new Error(
      'constants mismatch, please update meta.ts, ' +
        JSON.stringify({ tempMin, tempMax, totalMeteos }),
    );
  }

  const radMax = Math.max(
    ...meteos.map((m) => Math.max(...m.rads.map((v) => Math.max(...v)))),
  );

  const ntemp = (temp: number) => (temp - tempMin) / (tempMax - tempMin);

  for (let m = 0; m < METEOS_TOTAL * 0; ++m) {
    if (meteos[m].rads.length !== rads) {
      throw new Error(`rads length mismatch: ${meteos[m].rads.length}`);
    }

    for (let h = 0; h < METEO_HOURS; ++h) {
      push(ntemp(meteos[m].temp[h]));
    }

    for (let h = 0; h < METEO_HOURS; ++h) {
      push(ntemp(meteos[m].app[h]));
    }
  }

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
