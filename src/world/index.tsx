import type { UrlState } from '../url-handler.tsx';
import type { State } from '../ts.ts';
import { PvLive } from './pv-live.tsx';

export function WorldDisplay({ uss }: { uss: State<UrlState> }) {
  return (
    <>
      <PvLive uss={uss} />
    </>
  );
}
