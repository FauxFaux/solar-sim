import { range, sum } from '../ts.ts';
import {
  MCS_ZONE_CENTRES,
  MCS_NAMES,
  chunks,
  deltaDecode,
  interpLoc,
} from './mcs-meta.ts';

// code splitting
const tableRaw = (await import('../assets/mcs.json')).default;

// size of the real array
export const slopes = 91;
export const oris = 36;

const table = tableRaw.map((v) =>
  chunks(deltaDecode(deltaDecode(v)), oris).map((v, i) =>
    i % 2 === 0 ? v.reverse() : v,
  ),
);

interface Zone {
  name: string;
  loc: [number, number];
  data: number[][];
}

function interpTable(loc: [number, number]): [number, number[][]] {
  const weights = interpLoc(loc);

  const interp: number[][] = range(slopes).map(() => []);
  for (let x = 0; x < slopes; x++) {
    for (let y = 0; y < oris; y++) {
      interp[x].push(
        sum(weights.map(([idx, weight]) => weight * table[idx][x][y])),
      );
    }
  }

  return [weights[0][0], interp];
}

export function findZone(loc: [number, number]): Zone {
  const [best, data] = interpTable(loc);

  return {
    name: MCS_NAMES[best],
    loc: MCS_ZONE_CENTRES[best],
    data,
  };
}
