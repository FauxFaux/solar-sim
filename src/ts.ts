import type { Dispatch, StateUpdater } from 'preact/hooks';
import ensureError from 'ensure-error';

export const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  waitFor: number,
) => {
  let timeoutKey: ReturnType<typeof setTimeout>;

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

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export type Result<T> =
  | { success: true; value: T }
  | { success: false; error: Error };

export async function tryTo<T>(fn: () => Promise<T>): Promise<Result<T>> {
  try {
    const value = await fn();
    return { success: true, value };
  } catch (error) {
    return { success: false, error: ensureError(error) };
  }
}

export function andThen<T>(
  fn: () => Promise<Result<T>>,
  set: (v: Result<T>) => void,
) {
  fn()
    .then((r) => set(r))
    .catch((error) => set({ success: false, error }));
}

export function rotate<T>(arr: T[], n: number) {
  return arr.slice(n).concat(arr.slice(0, n));
}
