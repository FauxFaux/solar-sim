import type { UrlState } from '../url-handler.tsx';
import { type State } from '../ts.ts';
import { BasicUsage } from './basic.tsx';
import { HeatingUsage } from './heating.tsx';
import { LocationPicker } from './location-picker.tsx';
import { OrientationPicker } from './orientation-picker.tsx';

export function HomeUsage({ uss }: { uss: State<UrlState> }) {
  return (
    <>
      <BasicUsage uss={uss} />
      <HeatingUsage uss={uss} />
      <LocationPicker uss={uss} />
      <OrientationPicker uss={uss} />
    </>
  );
}
