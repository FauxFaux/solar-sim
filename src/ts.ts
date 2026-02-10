import type { Dispatch, StateUpdater } from 'preact/hooks';

export const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  waitFor: number,
) => {
  let timeoutKey: number;

  return (...args: Parameters<F>) => {
    clearTimeout(timeoutKey);
    timeoutKey = setTimeout(() => func(...args), waitFor);
  };
};

export type Setter<S> = Dispatch<StateUpdater<S>>;
export type State<T> = [T, Setter<T>];

export const keysOf = Object.keys as <T extends object>(
  obj: T,
) => Array<keyof T>;

export const entriesOf = Object.entries as <T extends object>(
  obj: T,
) => Array<[keyof T, T[keyof T]]>;

export const valuesOf = Object.values as <T extends object>(
  obj: T,
) => Array<T[keyof T]>;

export const fromEntries = Object.fromEntries as <T extends object>(
  entries: Array<[keyof T, T[keyof T]]>,
) => T;

export const oneDp = (n: number) => Math.round(n * 10) / 10;
export const twoDp = (n: number) => Math.round(n * 100) / 100;

export const range = (n: number) => Array.from({ length: n }, (_, i) => i);

export type Result<T> =
  | { success: true; value: T }
  | { success: false; error: Error };

export function andThen<T>(
  fn: () => Promise<Result<T>>,
  // do I understand why this union is here?
  set: (v: Result<T>) => void,
) {
  fn()
    .then((r) => set(r))
    .catch((error) => set({ success: false, error }));
}
