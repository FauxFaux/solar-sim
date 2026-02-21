import { loadMeteosRaw } from '../src/meteo-provider.ts';
import { METEO_HOURS } from '../src/world/meteo-meta.ts';
import { encode } from 'fast-png';
import { writeFileSync } from 'node:fs';

async function main() {
  const dpr = 73;
  const w = 24 * dpr;

  const meteos = await loadMeteosRaw();
  const totalMeteos = meteos.length;

  const rads = 8;
  const datums = 2 + rads;

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

  for (let m = 0; m < totalMeteos; ++m) {
    const meteo = meteos[m];
    const radMax = meteo.rads.map((v) => Math.max(...v));
    for (let h = 0; h < METEO_HOURS; ++h) {
      const x = h % w;
      const ybase = ((m * 365) / dpr + Math.floor(h / w)) * datums;
      // console.log([m, h, x, ybase, ybase * w + x, (ybase + 1) * w + x]);
      set(x, ybase, (meteo.temp[h] - tempMin) / (tempMax - tempMin));
      set(x, ybase + 1, (meteo.app[h] - tempMin) / (tempMax - tempMin));
      for (let r = 0; r < rads; ++r) {
        set(x, ybase + 2 + r, meteo.rads[r][h] / radMax[r]);
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
