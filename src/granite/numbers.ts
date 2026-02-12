export const oneDp = (n: number) => Math.round(n * 10) / 10;
export const twoDp = (n: number) => Math.round(n * 100) / 100;
export const range = (n: number) => Array.from({ length: n }, (_, i) => i);
export const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0);

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
