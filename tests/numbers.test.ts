import { expect, it } from 'vitest';
import { interleave } from '../src/granite/numbers.ts';

it('interleaves', () => {
  expect(interleave(6)).toEqual([3, 4, 2, 5, 1, 0]);
  expect(interleave(12)).toEqual([6, 7, 5, 8, 4, 9, 3, 10, 2, 11, 1, 0]);
  expect(interleave(3)).toEqual([2, 1, 0]);
  expect(interleave(5)).toEqual([3, 4, 2, 1, 0]);
  expect(interleave(7)).toEqual([4, 5, 3, 6, 2, 1, 0]);
});
