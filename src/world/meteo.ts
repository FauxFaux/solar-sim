import { interpLoc } from '../system/mcs-meta.ts';
import { range, sum } from '../granite/numbers.ts';
import { METEO_HOURS, METEO_ORIS } from './meteo-meta.ts';
import type { Meteo } from '../meteo-provider.ts';

export function findMeteo(
  meteos: Meteo[],
  loc: [number, number],
  [slope, ori]: [number, number],
) {
  const weights = meteos.length > 1 ? interpLoc(loc) : [[0, 1]];

  const slopeWeight = slope / 90;

  const oriFac = (180 + ori) / 45;
  const lowOri = Math.floor(oriFac);
  const highOri = lowOri + 1;
  const oriWeight = oriFac - lowOri;

  const rads: Record<number, number[]> = {};
  for (const [idx] of weights) {
    const r = meteos[idx].rads;
    if (lowOri === 0) {
      rads[idx] = range(METEO_HOURS).map(
        (i) =>
          r[0][i] * (1 - slopeWeight) + r[METEO_ORIS.length][i] * slopeWeight,
      );
      continue;
    }
    if (highOri === METEO_ORIS.length + 1) {
      rads[idx] = range(METEO_HOURS).map(
        (i) =>
          r[METEO_ORIS.length - 1][i] * (1 - slopeWeight) +
          r[METEO_ORIS.length * 2 - 1][i] * slopeWeight,
      );
      continue;
    }

    rads[idx] = [];

    for (let i = 0; i < METEO_HOURS; ++i) {
      const slope0 =
        r[lowOri - 1][i] * (1 - oriWeight) + r[highOri - 1][i] * oriWeight;
      const slope1 =
        r[lowOri - 1 + METEO_ORIS.length][i] * (1 - oriWeight) +
        r[highOri - 1 + METEO_ORIS.length][i] * oriWeight;
      const slope = slope0 * (1 - slopeWeight) + slope1 * slopeWeight;
      rads[idx].push(slope);
    }
  }

  return {
    temp: range(METEO_HOURS).map((i) =>
      sum(weights.map(([idx, weight]) => weight * meteos[idx].temp[i])),
    ),
    app: range(METEO_HOURS).map((i) =>
      sum(weights.map(([idx, weight]) => weight * meteos[idx].app[i])),
    ),
    rad: range(METEO_HOURS).map((i) =>
      sum(weights.map(([idx, weight]) => weight * rads[idx][i])),
    ),
  };
}
