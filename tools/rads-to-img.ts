import { interleave, range } from '../src/granite/numbers.ts';
import {
  METEO_HOURS,
  METEO_ORIS,
  METEO_SLOPES,
  METEOS_TOTAL,
  RAD_MAX,
} from '../src/granite/meteo/meteo-meta.ts';
import { encode } from 'fast-png';
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

async function main() {
  const meteos = await readAll();

  // 14
  const rads = METEO_SLOPES.length * METEO_ORIS.length;

  const img = new Uint8Array(METEOS_TOTAL * rads * METEO_HOURS);

  let idx = 0;
  const push = (val: number) => {
    img[idx++] = Math.floor(Math.max(0, Math.min(val, 1)) * 255);
  };

  // const radMax = Math.max(
  //   ...meteos.map((m) => Math.max(...m.map((v) => Math.max(...v)))),
  // );
  // console.log(radMax);

  for (const h of interleave(24)) {
    for (const d of range(365)) {
      for (const m of range(METEOS_TOTAL)) {
        for (const rad of range(rads)) {
          push(meteos[m][rad][d * 24 + h] / RAD_MAX);
        }
      }
    }
  }

  // 73
  const width = rads * METEOS_TOTAL * 4;
  const height = Math.ceil(img.length / width);

  writeFileSync(
    '.rads.png',
    encode({
      width,
      height,
      data: img,
      depth: 8,
      channels: 1,
    }),
  );

  execFileSync('avifenc', [
    '--speed',
    '0' /* maximum effort */,
    '-q',
    '80',
    '.rads.png',
    '.rads.avif',
  ]);
}

async function readAll() {
  return Promise.all(
    range(METEOS_TOTAL).map(async (zone) => {
      const rads: number[][] = [];
      for (const tilt of METEO_SLOPES) {
        for (const azimuth of METEO_ORIS) {
          const docGti = JSON.parse(
            await readFile(
              join(
                import.meta.dirname,
                `meteo-raw/gti-${zone}-${tilt}-${azimuth}.json`,
              ),
              'utf-8',
            ),
          ) as {
            hourly: {
              global_tilted_irradiance: number[];
            };
          };
          rads.push(docGti.hourly.global_tilted_irradiance);
        }
      }
      return rads;
    }),
  );
}

await main();
