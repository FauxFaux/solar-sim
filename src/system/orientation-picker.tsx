import { findZone } from './mcs.ts';
import { OrientationInfo } from './orientation-info.tsx';
import type { UrlState } from '../url-handler.tsx';
import type { State } from '../ts.ts';
import { useMemo } from 'preact/hooks';
import { compassName } from '../granite/directions.ts';

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
