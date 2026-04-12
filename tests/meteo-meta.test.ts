import { describe, expect, it } from 'vitest';
import { interpOri, METEO_ORIS } from '../src/granite/meteo/meteo-meta.ts';

const withNames = (ori: number) => {
  const real = interpOri(ori);

  console.log(ori, real);
  return {
    low: METEO_ORIS[real.low],
    high: METEO_ORIS[real.high],
    weight: real.weight,
  };
};

describe('interpOri', () => {
  it.each([
    [0, { low: 0, high: 0, weight: 0 }],
    [45, { low: 45, high: 45, weight: 0 }],
    [22.5, { low: 0, high: 45, weight: 0.5 }],
    [-22.5, { low: -45, high: 0, weight: 0.5 }],
    [135, { low: 135, high: 135, weight: 0 }],
    [-135, { low: -135, high: -135, weight: 0 }],
    [180, { low: 180, high: 180, weight: 0 }],
    [-180, { low: 180, high: 180, weight: 0 }],
    [135 + 45 / 2, { low: 135, high: 180, weight: 0.5 }],
    [135 + 45 * 0.75, { low: 135, high: 180, weight: 0.75 }],
    [-135 - 45 / 2, { low: 180, high: -135, weight: 0.5 }],
    [-135 - 45 / 4, { low: 180, high: -135, weight: 0.75 }],
    [-135 - 45 * 0.75, { low: 180, high: -135, weight: 0.25 }],
  ])('interpOri(%i) = %o', (ori, expected) => {
    expect(withNames(ori)).toEqual(expected);
  });
});
