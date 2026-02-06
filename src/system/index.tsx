import type { UrlState } from '../url-handler.tsx';
import { type State } from '../ts.ts';
import { LocationPicker } from './location-picker.tsx';
import { OrientationPicker } from './orientation-picker.tsx';

export function SystemDesign({ uss }: { uss: State<UrlState> }) {
  return (
    <>
      <LocationPicker uss={uss} />
      <OrientationPicker uss={uss} />
    </>
  );
}
