import { useState } from 'preact/hooks';
import type { State } from './ts.ts';
import { TransContext, type TransState } from './trans-context.ts';
import type { ComponentChildren } from 'preact';
import {
  defaultMeteo,
  type Meteo,
  MeteoContext,
  onceMeteosLoaded,
} from './meteo-provider.ts';

export function MagicalStates({ children }: { children: ComponentChildren }) {
  const tss: State<TransState> = useState({});
  const meteos: State<Meteo[]> = useState(defaultMeteo);

  onceMeteosLoaded(meteos[1]);

  return (
    <TransContext.Provider value={tss}>
      <MeteoContext.Provider value={meteos}>{children}</MeteoContext.Provider>
    </TransContext.Provider>
  );
}
