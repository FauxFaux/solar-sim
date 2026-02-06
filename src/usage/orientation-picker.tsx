import { findZone } from './mcs.ts';
import { OrientationInfo } from './orientation-info.tsx';
import type { UrlState } from '../url-handler.tsx';
import type { State } from '../ts.ts';

export function OrientationPicker({
  uss: [us, setUs],
}: {
  uss: State<UrlState>;
}) {
  const zone = findZone(us.loc);
  return (
    <div>
      <h3>Orientation</h3>
      <OrientationInfo mcs={zone.data} />
    </div>
  );
}
