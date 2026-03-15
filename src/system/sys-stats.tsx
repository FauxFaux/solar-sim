import { type State } from '../ts.ts';
import type { UrlState } from '../url-handler.tsx';
import { findZone } from './mcs.ts';
import { ByMonth } from './by-month.tsx';
import { ByHour } from './by-hour.tsx';

export function mcsGen(oris: [slope: number, ori: number], mcs: number[][]) {
  const [slope, ori] = oris;
  return mcs[slope]?.[Math.round(Math.abs(ori) / 5)];
}

export function SysStats({ uss: [us] }: { uss: State<UrlState> }) {
  const zone = findZone(us.loc);
  const mcsV = mcsGen(us.ori, zone.data);
  const gen = mcsV * us.kwp;

  // CITATION NEEDED
  const eff = mcsV / 1100;

  return (
    <div>
      <h3>Generation</h3>
      <p>Total generation: {Math.round(gen).toLocaleString()} kWh/yr</p>
      <h4>
        By month, with{' '}
        <span style={'color: #2b2; font-weight: normal'}>usage</span> and{' '}
        <span style={'color: #b22; font-weight: normal'}>heat</span>
      </h4>
      <ByMonth us={us} />
      <h4>By hour, sunny, south facing</h4>
      <ByHour kwp={us.kwp * eff} />
    </div>
  );
}
