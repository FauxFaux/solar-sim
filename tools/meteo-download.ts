import { writeFileSync } from 'node:fs';
import { deltaEncode, MCS_ZONE_CENTRES } from '../src/system/mcs-meta.ts';
import { readFileSync } from 'fs';
import { setTimeout } from 'node:timers/promises';
import {
  METEO_ORIS,
  METEO_SLOPES,
  METEOS_TOTAL,
} from '../src/granite/meteo/meteo-meta.ts';

const mode: 'pack' | 'download' = 'pack';

async function pack() {
  const dat: {
    rads: number[][];
  }[] = [];

  for (let zone = 0; zone < METEOS_TOTAL; ++zone) {
    const rads: number[][] = [];
    for (const tilt of METEO_SLOPES) {
      for (const azimuth of METEO_ORIS) {
        const docGti = JSON.parse(
          readFileSync(
            `meteo-raw/gti-${zone}-${tilt}-${azimuth}.json`,
            'utf-8',
          ),
        ) as {
          hourly: {
            global_tilted_irradiance: number[];
          };
        };
        rads.push(
          deltaEncode(
            docGti.hourly.global_tilted_irradiance.map((v) => Math.round(v)),
          ),
        );
      }
    }

    dat.push({
      rads,
    });
  }

  for (let i = 0; i < dat.length; i++) {
    writeFileSync(`../src/assets/meteo-${i}.json`, JSON.stringify(dat[i]));
  }

  return 0;
}

async function downloadRaw() {
  for (const tilt of METEO_SLOPES) {
    for (const azimuth of METEO_ORIS) {
      for (let i = 0; i < MCS_ZONE_CENTRES.length; i++) {
        const [lat, lon] = MCS_ZONE_CENTRES[i];
        const url =
          // hourly=global_tilted_irradiance&tilt=45&azimuth=-90
          `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}` +
          '&start_date=2025-01-01&end_date=2025-12-31' +
          '&hourly=global_tilted_irradiance' +
          `&timezone=Europe%2FLondon&tilt=${tilt}&azimuth=${azimuth}`;
        const resp = await fetch(url);
        if (!resp.ok) {
          console.error(
            `Error fetching data for zone ${i}, ${tilt}, ${azimuth}: ${resp.status} ${resp.statusText}`,
          );
          return 1;
        }
        const doc = await resp.text();
        writeFileSync(
          `meteo-raw/gti-${i}-${tilt}-${azimuth}.json`,
          doc,
          'utf-8',
        );
        console.log(
          `Fetched data for zone ${i}, tilt ${tilt}, azimuth ${azimuth}`,
        );
        await setTimeout(1000);
      }
    }
  }

  return 0;
}

process.exit(mode === 'pack' ? await pack() : await downloadRaw());
