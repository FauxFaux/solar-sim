import { useState } from 'preact/hooks';
import type { State } from './ts.ts';
import { TransContext, type TransState } from './trans-context.ts';
import type { ComponentChildren } from 'preact';

export function MagicalStates({ children }: { children: ComponentChildren }) {
  const tss: State<TransState> = useState({});

  return <TransContext.Provider value={tss}>{children}</TransContext.Provider>;
}
