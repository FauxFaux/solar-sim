import { findZone } from './mcs.ts';
import { OrientationInfo } from './orientation-info.tsx';
import type { UrlState } from '../url-handler.tsx';
import type { State } from '../ts.ts';
import { useMemo } from 'preact/hooks';
import { compassName } from '../granite/directions.ts';
import { NumberInput } from '../widgets/number-input.tsx';

export function OrientationPicker({ uss }: { uss: State<UrlState> }) {
  const [us, setUs] = uss;
  const zone = useMemo(() => findZone(us.loc), [us.loc]);
  const [slope, ori] = us.ori;
  const gen = zone.data[slope][Math.round(Math.abs(ori) / 5)];
  return (
    <div>
      <h3>Solar system</h3>
      <NumberInput
        values={[us.kwp, (kwp: number) => setUs((us) => ({ ...us, kwp }))]}
        unit={'kWp'}
      >
        <abbr
          title={
            'assuming 430W panels, typical for a 2025, 1.8mx1.1m domestic panel'
          }
        >
          about {(us.kwp / 0.43).toFixed()} panels
        </abbr>
      </NumberInput>
      <NumberInput
        values={[us.bat, (bat: number) => setUs((us) => ({ ...us, bat }))]}
        unit={'kWh'}
      >
        <abbr
          title={
            'assuming 2.56kWh Growatt ARK LV batteries at 90% usable, (65cm x 25cm x 17cm W/D/H each);' +
            ' a stack of four being about the size of a car tyre'
          }
        >
          about {Math.ceil(us.bat / (2.56 * 0.9)).toFixed()} batteries
        </abbr>
      </NumberInput>
      <OrientationInfo mcs={zone.data} uss={uss} />
      <div class={'miniflex'}>
        <div style={{ 'min-width': '10ch', 'text-align': 'right' }}>
          facing <abbr title={`${ori}° from S`}>{compassName(ori)}</abbr>
        </div>
        <div>+</div>
        <div>
          {slope}° <abbr title={'from horizontal'}>tilt</abbr>
        </div>
        <div>=</div>
        <div>{((us.kwp * gen) / 1000).toFixed(1)} MWh/year</div>
      </div>
    </div>
  );
}
