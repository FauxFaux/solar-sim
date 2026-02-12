import { deltaDecode, interpLoc } from '../system/mcs-meta.ts';
import { range, sum } from '../ts.ts';

const meteos = (
  [
    ...(await import('../assets/meteo-0.json')).default,
    ...(await import('../assets/meteo-1.json')).default,
    ...(await import('../assets/meteo-2.json')).default,
    ...(await import('../assets/meteo-3.json')).default,
    ...(await import('../assets/meteo-4.json')).default,
  ] as { temp: number[]; app: number[]; rad: number[] }[]
).map(({ temp, app, rad }) => {
  const detemp = deltaDecode(temp);
  return {
    temp: detemp,
    app: deltaDecode(app).map((a, i) => a + detemp[i]),
    rad: deltaDecode(rad),
  };
});

export const METEO_HOURS = 24 * 365;

export function findMeteo(loc: [number, number]) {
  const weights = interpLoc(loc);

  return {
    temp: range(METEO_HOURS).map((i) =>
      sum(weights.map(([idx, weight]) => weight * meteos[idx].temp[i])),
    ),
    app: range(METEO_HOURS).map((i) =>
      sum(weights.map(([idx, weight]) => weight * meteos[idx].app[i])),
    ),
    rad: range(METEO_HOURS).map((i) =>
      sum(weights.map(([idx, weight]) => weight * meteos[idx].rad[i])),
    ),
  };
}
