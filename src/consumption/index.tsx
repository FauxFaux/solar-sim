import type { State } from '../ts.ts';
import type { UrlState } from '../url-handler.tsx';
import { BillAnalysis } from './bill-analysis.tsx';

export function ConsumptionDesign({ uss }: { uss: State<UrlState> }) {
  return (
    <>
      <BillAnalysis uss={uss} />
    </>
  );
}
