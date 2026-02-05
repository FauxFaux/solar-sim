import type { UrlState } from './url-handler.tsx';
import type { State } from './ts.ts';
import { HomeUsage } from './home-usage.tsx';

export function App({ uss }: { uss: State<UrlState> }) {
  return (
    <>
      <HomeUsage uss={uss} />
    </>
  );
}
