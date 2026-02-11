import type { UrlState } from './url-handler.tsx';
import type { State } from './ts.ts';
import { HomeUsage } from './usage';
import { SystemDesign } from './system';
import { ConsumptionDesign } from './consumption';
import { Temporal } from 'temporal-polyfill';
import { useState } from 'preact/hooks';
import { createContext } from 'preact';
import { WorldDisplay } from './world';

interface TransState {
  billPointy?: [Temporal.PlainDate, number];
}

export const TransContext = createContext<State<TransState>>(
  undefined as unknown as State<TransState>,
);

export function App({ uss }: { uss: State<UrlState> }) {
  const tss: State<TransState> = useState({});

  return (
    <TransContext.Provider value={tss}>
      <HomeUsage uss={uss} />
      <SystemDesign uss={uss} />
      <ConsumptionDesign uss={uss} />
      <WorldDisplay uss={uss} />
    </TransContext.Provider>
  );
}
