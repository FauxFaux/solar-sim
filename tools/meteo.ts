import { writeFileSync } from 'node:fs';
import {
  chunks,
  deltaEncode,
  MCS_ZONE_CENTRES,
} from '../src/system/mcs-meta.ts';
import { readFileSync } from 'fs';

const mode: 'pack' | 'download' = 'pack';

async function pack() {
  const files = MCS_ZONE_CENTRES.map(
    (_, i) =>
      (
        JSON.parse(readFileSync(`meteo-raw/${i}.json`, 'utf-8')) as {
          hourly: {
            temperature_2m: number[];
            // cloud_cover: number[];
            // sunshine_duration: number[];
            apparent_temperature: number[];
            direct_radiation: number[];
            diffuse_radiation: number[];
          };
        }
      ).hourly,
  );

  const dat = files.map((file) => {
    const {
      temperature_2m,
      apparent_temperature,
      direct_radiation,
      diffuse_radiation,
    } = file;
    const temp = temperature_2m.map((t) => Math.round(t));
    const app = apparent_temperature.map((a, i) => Math.round(a - temp[i]));
    const rad = direct_radiation.map((d, i) =>
      Math.round(d + diffuse_radiation[i]),
    );
    return {
      temp: deltaEncode(temp),
      app: deltaEncode(app),
      rad: deltaEncode(rad),
    };
  });

  const chunked = chunks(dat, 5);
  for (let i = 0; i < chunked.length; i++) {
    writeFileSync(`../src/assets/meteo-${i}.json`, JSON.stringify(chunked[i]));
  }
}

async function downloadRaw() {
  for (let i = 0; i < MCS_ZONE_CENTRES.length; i++) {
    const [lat, lon] = MCS_ZONE_CENTRES[i];
    const url =
      `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}` +
      '&start_date=2025-01-01&end_date=2025-12-31' +
      '&hourly=temperature_2m,cloud_cover,sunshine_duration,apparent_temperature,direct_radiation,diffuse_radiation' +
      '&timezone=Europe%2FLondon&tilt=45';
    const resp = await fetch(url);
    if (!resp.ok) {
      console.error(
        `Error fetching data for zone ${i}: ${resp.status} ${resp.statusText}`,
      );
      return 1;
    }
    const doc = await resp.text();
    writeFileSync(`meteo-raw/${i}.json`, doc, 'utf-8');
  }

  return 0;
}

process.exit(mode === 'pack' ? await pack() : await downloadRaw());
