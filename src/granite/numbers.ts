export const oneDp = (n: number) => Math.round(n * 10) / 10;
export const twoDp = (n: number) => Math.round(n * 100) / 100;
export type Enumerate<
  N extends number,
  Acc extends number[] = [],
> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;
export type Range<F extends number, T extends number> = Exclude<
  Enumerate<T>,
  Enumerate<F>
>;

export function range<N extends number>(n: N) {
  return Array.from({ length: n }, (_, i) => i as Range<0, N>);
}
export const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

export function mean(arr: number[]): number {
  return sum(arr) / arr.length;
}

export function ordinal(n: number): string {
  switch (n % 10) {
    case 1:
      return n + 'st';
    case 2:
      return n + 'nd';
    case 3:
      return n + 'rd';
    default:
      return n + 'th';
  }
}

export function bucketMean(arr: number[], buckets: number): number[] {
  if (arr.length < buckets) return arr;
  const result: number[] = [];
  for (let i = 0; i < buckets; i++) {
    const start = Math.floor((i * arr.length) / buckets);
    const end = Math.ceil(((i + 1) * arr.length) / buckets);
    const slice = arr.slice(start, end);
    result.push(mean(slice));
  }
  return result;
}
