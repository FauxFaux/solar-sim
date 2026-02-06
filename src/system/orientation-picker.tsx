import { findZone } from './mcs.ts';
import { OrientationInfo } from './orientation-info.tsx';
import type { UrlState } from '../url-handler.tsx';
import type { State } from '../ts.ts';

export function OrientationPicker({ uss }: { uss: State<UrlState> }) {
  const [us, setUs] = uss;
  const zone = findZone(us.loc);
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
      <p>
        {slope}° from horizontal, {ori}° from south
      </p>
      <p>MCS zone: {zone.name}</p>
    </div>
  );
}
