// imported by scripts

import { sum } from '../ts.ts';

export const MCS_NAMES = [
  '1 - London',
  '2 - Brighton',
  '3 - Southampton',
  '4 - Plymouth',
  '5E - Bristol',
  '5W - Cardiff',
  '6 - Birmingham',
  '7E - Manchester',
  '7W - Chester',
  '8S - Dumfries',
  '8E - Carlisle',
  '9E - Newcastle',
  '9S - Edinburgh',
  '10 - Middlesborough',
  '11 - Sheffield',
  '12 - Norwich',
  '13 - Aberystwith',
  '14 - Glasgow',
  '15 - Dundee',
  '16 - Aberdeen',
  '17 - Inverness',
  '18 - Stornoway',
  '19 - Kirkwall',
  '20 - Lerwick',
  '21 - Belfast',
];
// I entirely made this up based on measuring my bad map
export const MCS_ZONE_CENTRES: [number, number][] = [
  [51.5, -0.03],
  [51.09, 0.59],
  [50.77, -1.48],
  [50.56, -4.25],
  [51.21, -2.45],
  [51.46, -3.21],
  [52.44, -1.62],
  [53.44, -2.24],
  [53.07, -2.76],
  [55.01, -4.07],
  [54.4, -2.93],
  [55.3, -2.1],
  [55.68, -2.79],
  [54.19, -1.2],
  [53.23, -0.62],
  [52.4, 0.87],
  [52.13, -3.42],
  [55.56, -4.56],
  [56.44, -3.35],
  [57.25, -2.73],
  [57.44, -5.01],
  [58.05, -6.39],
  [58.6, -3.42],
  [58.33, 1.56],
  [54.52, -6.6],
];

export function deltaEncode(arr: number[]): number[] {
  const out = [];
  let acc = 0;
  for (const v of arr) {
    out.push(v - acc);
    acc = v;
  }
  return out;
}

export function deltaDecode(arr: number[]): number[] {
  const out = [];
  let acc = 0;
  for (const v of arr) {
    acc += v;
    out.push(acc);
  }
  return out;
}

export function chunks<T>(arr: T[], size: number): T[][] {
  const out = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export function interpLoc(
  loc: [number, number],
): [idx: number, weight: number][] {
  const [lat, lon] = loc;

  const dists = MCS_ZONE_CENTRES.map(([lat2, lon2], i) => [
    (lat - lat2) ** 2 + (lon - lon2) ** 2,
    i,
  ]).sort(([d1], [d2]) => d1 - d2);

  const [bd, best] = dists[0];

  // arbitrary
  if (bd < 0.01) {
    return [[best, 1]];
  }

  const using = dists.slice(0, 3);

  const inversePowers = using.map(([d]) => 1 / d ** 2);
  const totalWeight = sum(inversePowers);
  const weights = inversePowers.map((w) => w / totalWeight);
  return using.map(([, j], i) => [j, weights[i]]);
}
