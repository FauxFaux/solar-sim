import type { State } from '../ts.ts';
import type { UrlState } from '../url-handler.tsx';
import { LoadProfile } from './load-profile.tsx';

export function ConsumptionDesign({ uss }: { uss: State<UrlState> }) {
  return (
    <>
      <LoadProfile uss={uss} />
    </>
  );
}
