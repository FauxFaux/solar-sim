import { type State } from '../ts.ts';
import type { UrlState } from '../url-handler.tsx';
import { ByMonth } from './by-month.tsx';
import { useContext, useMemo } from 'preact/hooks';
import { MeteoContext } from '../meteo-provider.ts';
import { findMeteo } from '../world/meteo.ts';
import { ByHourRad } from './by-hour-rad.tsx';
import { findZone } from './mcs.ts';

export function mcsGen(oris: [slope: number, ori: number], mcs: number[][]) {
  const [slope, ori] = oris;
  return mcs[slope]?.[Math.round(Math.abs(ori) / 5)];
}

export function SysStats({ uss: [us] }: { uss: State<UrlState> }) {
  const zone = useMemo(() => findZone(us.loc), [us.loc]);
  const mcsV = mcsGen(us.ori, zone.data);
  // CITATION NEEDED
  const eff = mcsV / 1100;

  const [meteos] = useContext(MeteoContext);
  const meteo = useMemo(
    () => findMeteo(meteos, us.loc, us.ori),
    [meteos, us.loc, us.ori],
  );

  return (
    <div>
      <h3>Generation</h3>
      <h4>
        By month, with{' '}
        <span style={'color: #2b2; font-weight: normal'}>usage</span> and{' '}
        <span style={'color: #b22; font-weight: normal'}>heat load</span>
      </h4>
      <ByMonth us={us} />
      <h4>Generation profile on a good day</h4>
      <ByHourRad kwp={us.kwp} rad={meteo.rad} eff={eff} />
    </div>
  );
}
