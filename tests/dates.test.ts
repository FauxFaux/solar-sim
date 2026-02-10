import { expect, it } from 'vitest';
import { parseDateHour } from '../src/consumption/bill-analysis.tsx';

it('parses octopus (winter)', () => {
  expect(parseDateHour('2025-03-05T00:00:00+00:00')).toMatchInlineSnapshot(`
    [
      "2025-03-05",
      0,
    ]
  `);

  expect(parseDateHour('2025-03-05T00:30:00+00:00')).toMatchInlineSnapshot(`
    [
      "2025-03-05",
      0,
    ]
  `);
});

it('parses octopus (spring)', () => {
  expect(parseDateHour('2025-03-30T02:00:00+01:00')).toMatchInlineSnapshot(`
    [
      "2025-03-30",
      2,
    ]
  `);

  expect(parseDateHour('2025-03-30T02:30:00+01:00')).toMatchInlineSnapshot(`
    [
      "2025-03-30",
      2,
    ]
  `);
});

it('parses octopus (summer)', () => {
  expect(parseDateHour('2025-03-30T23:30:00+01:00')).toMatchInlineSnapshot(`
    [
      "2025-03-30",
      23,
    ]
  `);

  expect(parseDateHour('2025-03-31T00:00:00+01:00')).toMatchInlineSnapshot(`
    [
      "2025-03-31",
      0,
    ]
  `);

  expect(parseDateHour('2025-03-31T01:00:00+01:00')).toMatchInlineSnapshot(`
    [
      "2025-03-31",
      1,
    ]
  `);
});

it('parses utc', () => {
  expect(parseDateHour('2025-03-29T05:00:00Z')).toMatchInlineSnapshot(`
    [
      "2025-03-29",
      5,
    ]
  `);
  expect(parseDateHour('2025-03-29T22:00:00Z')).toMatchInlineSnapshot(`
    [
      "2025-03-29",
      22,
    ]
  `);
  expect(parseDateHour('2025-03-29T23:00:00Z')).toMatchInlineSnapshot(`
    [
      "2025-03-29",
      23,
    ]
  `);
  expect(parseDateHour('2025-03-30T00:00:00Z')).toMatchInlineSnapshot(`
    [
      "2025-03-30",
      0,
    ]
  `);
  expect(parseDateHour('2025-03-30T01:00:00Z')).toMatchInlineSnapshot(`
    [
      "2025-03-30",
      2,
    ]
  `);
  expect(parseDateHour('2025-03-30T02:00:00Z')).toMatchInlineSnapshot(`
    [
      "2025-03-30",
      3,
    ]
  `);
  expect(parseDateHour('2025-03-30T03:00:00Z')).toMatchInlineSnapshot(`
    [
      "2025-03-30",
      4,
    ]
  `);
});
