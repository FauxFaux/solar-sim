import { interleave, range } from '../src/granite/numbers.ts';
import {
  METEO_HOURS,
  METEO_ORIS,
  METEO_SLOPES,
  METEOS_TOTAL,
  RAD_MAX,
  type Rads,
} from '../src/granite/meteo/meteo-meta.ts';
import { encode } from 'fast-png';
import { writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { readFile, rename } from 'node:fs/promises';
import { join } from 'node:path';
import { readAvifNode } from './read-avif.ts';
import { loadRadsFromArr } from '../src/granite/meteo/rads-from-img.ts';

async function main() {
  const rads = await readAll();

  const datums = METEO_SLOPES.length * METEO_ORIS.length;

  const img = new Uint8Array(METEOS_TOTAL * datums * METEO_HOURS);

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
        for (const slope of range(METEO_SLOPES.length)) {
          for (const ori of range(METEO_ORIS.length)) {
            push(rads[m][slope][ori][d * 24 + h] / RAD_MAX);
          }
        }
      }
    }
  }

  // 73
  const width = METEO_SLOPES.length * 24 * METEOS_TOTAL;
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

  await validateRecoveredImage(rads);

  await rename('.rads.avif', 'src/assets/rads.avif');
}

async function readAll(): Promise<Rads> {
  return Promise.all(
    range(METEOS_TOTAL).map(async (zone) => {
      const rads: number[][][] = [];
      for (const tilt of METEO_SLOPES) {
        const oris: number[][] = [];
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
          oris.push(docGti.hourly.global_tilted_irradiance);
        }
        rads.push(oris);
      }
      return rads;
    }),
  );
}

async function validateRecoveredImage(original: Rads) {
  const recovered = await readAvifNode('.rads.avif');
  const rec = await loadRadsFromArr(recovered);
  for (let mcs = 0; mcs < METEOS_TOTAL; ++mcs) {
    for (let slo = 0; slo < METEO_SLOPES.length; ++slo) {
      for (let ori = 0; ori < METEO_ORIS.length; ++ori) {
        for (let h = 0; h < METEO_HOURS; ++h) {
          const orig = original[mcs][slo][ori][h];
          const recd = rec[mcs][slo][ori][h];
          if (Math.abs(orig - recd) > 50) {
            console.log(
              `Mismatch at zone ${mcs}, slope ${slo}, ori ${ori}, hr ${h}: ${orig} != ${recd}`,
            );
          }
        }
      }
    }
  }
}

await main();
