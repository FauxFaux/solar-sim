import { createContext } from 'preact';
import type { State } from './ts.ts';
import type { Temporal } from 'temporal-polyfill';

export interface TransState {
  billPointy?: [Temporal.PlainDate, number];
}

export const TransContext = createContext<State<TransState>>(
  undefined as unknown as State<TransState>,
);
