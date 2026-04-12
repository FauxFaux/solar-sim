import { range } from '../src/granite/numbers.ts';
import {
  METEO_HOURS,
  METEOS_TOTAL,
  type MeteoTemp,
  TEMP_MAX,
  TEMP_MIN,
} from '../src/granite/meteo/meteo-meta.ts';
import { encode, decode } from 'fast-png';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod/mini';
import { execFileSync } from 'node:child_process';
import { loadTempsFromArr } from '../src/granite/meteo/temps-from-img.ts';
import { renameSync } from 'node:fs';
import { readAvifNode } from './read-avif.ts';

async function main() {
  const temps = await readAll();

  // app and temp
  const datums = 2;

  const img = new Uint8Array(METEOS_TOTAL * datums * 365 * 24);
  let idx = 0;

  const ntemp = (temp: number) => (temp - TEMP_MIN) / (TEMP_MAX - TEMP_MIN);

  const push = (val: number) => {
    img[idx++] = Math.floor(Math.max(0, Math.min(1, ntemp(val))) * 255);
  };

  for (let m = 0; m < METEOS_TOTAL; ++m) {
    for (let h = 0; h < METEO_HOURS; ++h) {
      push(temps[m].temp[h]);
    }
    for (let h = 0; h < METEO_HOURS; ++h) {
      push(temps[m].app[h]);
    }
  }

  const width = 24 * 25;
  const height = Math.ceil(img.length / width);
  await writeFile(
    '.temps.png',
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
    // lowest value with zero 1.5 degree errors, entirely arbitrary
    '84',
    '.temps.png',
    '.temps.avif',
  ]);

  await validateRecoveredImage(temps);

  renameSync('.temps.avif', 'src/assets/temps.avif');
}

const schema = z.object({
  hourly: z.object({
    temperature_2m: z.array(z.number()),
    apparent_temperature: z.array(z.number()),
    // cloud_cover: number[];
    // sunshine_duration: number[];
    // direct_radiation: number[];
    // diffuse_radiation: number[];
  }),
});

async function readOne(fn: string) {
  const text = await readFile(join(import.meta.dirname, fn), 'utf-8');
  return schema.parse(JSON.parse(text)).hourly;
}

async function readAll() {
  return Promise.all(
    range(METEOS_TOTAL).map(async (zone) => {
      const json = await readOne(`meteo-raw/${zone}.json`);

      return {
        temp: json.temperature_2m,
        app: json.apparent_temperature,
      };
    }),
  );
}

async function validateRecoveredImage(temps: MeteoTemp[]) {
  const arr = await readAvifNode('.temps.avif');

  const recoveredData = await loadTempsFromArr(arr);

  for (let m = 0; m < METEOS_TOTAL; ++m) {
    for (let h = 0; h < METEO_HOURS; ++h) {
      const o = temps[m].temp[h];
      const r = recoveredData[m].temp[h];
      if (o > TEMP_MIN && o < TEMP_MAX && Math.abs(o - r) > 1.5) {
        console.log(`temp mismatch at ${m}, ${h}: ${o} vs ${r}`);
      }
    }

    for (let h = 0; h < METEO_HOURS; ++h) {
      const o = temps[m].app[h];
      const r = recoveredData[m].app[h];
      if (o > TEMP_MIN && o < TEMP_MAX && Math.abs(o - r) > 1.5) {
        console.log(`app mismatch at ${m}, ${h}: ${o} vs ${r}`);
      }
    }
  }
}

await main();
