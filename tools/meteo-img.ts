import { loadMeteosRaw } from '../src/meteo-provider.ts';
import { METEO_HOURS } from '../src/world/meteo-meta.ts';
import { encode } from 'fast-png';
import { writeFileSync } from 'node:fs';

async function main() {
  const dpr = 73;
  const w = 24 * dpr;

  const meteos = await loadMeteosRaw();
  const totalMeteos = meteos.length;

  const temps = 2;
  const rads = 8;
  const datums = temps + rads;

  const img = new Uint8Array(totalMeteos * datums * 365 * 24);
  const set = (x: number, y: number, val: number) => {
    if (val < 0 || val > 1) {
      throw new Error(`Invalid value: ${val} at (${x}, ${y})`);
    }
    const idx = y * w + x;
    if (img[idx] !== 0) {
      throw new Error(`Pixel already set at (${idx}: ${x}, ${y})`);
    }
    img[idx] = Math.floor(val * 256);
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

  for (let m = 0; m < totalMeteos; ++m) {
    const meteo = meteos[m];
    const mRow = (m * 365) / dpr;
    for (let h = 0; h < METEO_HOURS; ++h) {
      const x = h % w;
      const hRow = Math.floor(h / w);
      const ybase = (mRow + hRow) * temps;
      set(x, ybase, (meteo.temp[h] - tempMin) / (tempMax - tempMin));
      set(x, ybase + 1, (meteo.app[h] - tempMin) / (tempMax - tempMin));
    }

    const toff = ((totalMeteos * 365) / dpr) * temps;

    for (let h = 0; h < METEO_HOURS; ++h) {
      const x = h % w;
      const hRow = Math.floor(h / w);
      const ybase = toff + (mRow + hRow) * rads;
      for (let r = 0; r < rads; ++r) {
        set(x, ybase + r, meteo.rads[r][h] / radMax);
      }
    }
  }
  writeFileSync(
    'a.png',
    encode({
      width: w,
      height: (totalMeteos * 365 * datums) / dpr,
      data: img,
      depth: 8,
      channels: 1,
    }),
  );
}

await main();
