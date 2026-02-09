import type { UrlState } from './url-handler.tsx';
import type { State } from './ts.ts';
import { HomeUsage } from './usage';
import { SystemDesign } from './system';
import { ConsumptionDesign } from './consumption';

export function App({ uss }: { uss: State<UrlState> }) {
  return (
    <>
      <HomeUsage uss={uss} />
      <SystemDesign uss={uss} />
      <ConsumptionDesign uss={uss} />
    </>
  );
}
