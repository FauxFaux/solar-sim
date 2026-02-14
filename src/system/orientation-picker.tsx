import { findZone } from './mcs.ts';
import { OrientationInfo } from './orientation-info.tsx';
import type { UrlState } from '../url-handler.tsx';
import type { State } from '../ts.ts';
import { useMemo } from 'preact/hooks';

export function OrientationPicker({ uss }: { uss: State<UrlState> }) {
  const [us, setUs] = uss;
  const zone = useMemo(() => findZone(us.loc), [us.loc]);
  const [slope, ori] = us.ori;
  return (
    <div>
      <h3>Solar system</h3>
      <p>
        <input
          type={'number'}
          min={0}
          step={0.1}
          style={'width: 10ch'}
          value={us.kwp}
          onChange={(e) =>
            setUs((us) => ({ ...us, kwp: parseFloat(e.currentTarget.value) }))
          }
        />{' '}
        kWp installed panels
      </p>
      <OrientationInfo mcs={zone.data} uss={uss} />
      <div>
        {slope}° <abbr title={'from horizontal'}>tilt</abbr>, facing{' '}
        {compassName(ori)} ({ori}° from S)
      </div>
      <div>MCS zone: {zone.name}</div>
    </div>
  );
}

export function compassName(ori: number) {
  const dirs = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  const idx = Math.round(((ori + 180) % 360) / 22.5) % 16;
  return dirs[idx];
}
