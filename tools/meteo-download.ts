import { existsSync, writeFileSync } from 'node:fs';
import { MCS_ZONE_CENTRES } from '../src/system/mcs-meta.ts';
import { setTimeout } from 'node:timers/promises';
import { METEO_ORIS, METEO_SLOPES } from '../src/granite/meteo/meteo-meta.ts';
import { join } from 'node:path';

async function downloadRaw() {
  for (const tilt of METEO_SLOPES) {
    for (const azimuth of METEO_ORIS) {
      for (let i = 0; i < MCS_ZONE_CENTRES.length; i++) {
        const target = join(
          import.meta.dirname,
          `meteo-raw/gti-${i}-${tilt}-${azimuth}.json`,
        );
        if (existsSync(target)) continue;

        const [lat, lon] = MCS_ZONE_CENTRES[i];
        const url =
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
        writeFileSync(target, doc, 'utf-8');
        console.log(
          `Fetched data for zone ${i}, tilt ${tilt}, azimuth ${azimuth}`,
        );
        await setTimeout(1000);
      }
    }
  }

  return 0;
}

process.exit(await downloadRaw());
