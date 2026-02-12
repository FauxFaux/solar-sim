import { entriesOf, type Result } from '../ts.ts';
import { Temporal } from 'temporal-polyfill';
import * as Papa from 'papaparse';
import { type LocalDate, parseDateHour } from '../granite/dates.ts';
import { twoDp } from '../granite/numbers.ts';

export type MaybeNumber = number | undefined | null;

export type ParsedBill = Record<LocalDate, MaybeNumber[]>;

export function parseBill(text: string): Result<ParsedBill> {
  const res = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
  });
  if (res.errors.length) {
    return {
      success: false,
      error: new Error(res.errors.map((e) => e.message).join('; ')),
    };
  }

  const fields = res.meta.fields ?? [];
  const consCol = fields.find((f) => /consumption/i.test(f) || /kwh/i.test(f));
  const dateCol = fields.find((f) => /start/i.test(f) || /date/i.test(f));

  if (!consCol || !dateCol) {
    return {
      success: false,
      error: new Error(
        'Could not find consumption/kWh or date/start fields in ' +
          JSON.stringify(fields),
      ),
    };
  }

  const byDateHour: Record<LocalDate, Record<number, number>> = {};
  for (const row of res.data as Record<string, string>[]) {
    // what a ballache
    const dateStr = row[dateCol].trim();
    const dateVal = parseDateHour(dateStr);
    if (!dateVal) {
      return {
        success: false,
        error: new Error(
          'Could not parse date `' + dateStr + '` in column ' + dateCol,
        ),
      };
    }

    const floatStr = row[consCol];
    const floatVal = parseFloat(floatStr);
    if (isNaN(floatVal)) {
      return {
        success: false,
        error: new Error(
          'Could not parse consumption `' + floatStr + '` in column ' + consCol,
        ),
      };
    }

    const [dateWithoutHour, hour] = dateVal;
    byDateHour[dateWithoutHour] ??= {};
    byDateHour[dateWithoutHour][hour] ??= 0;
    byDateHour[dateWithoutHour][hour] += floatVal;
  }

  const value: ParsedBill = {};
  for (const [date, hourMap] of entriesOf(byDateHour)) {
    const hourList: MaybeNumber[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const hm = hourMap[hour];
      hourList.push(hm ? twoDp(hm) : null);
    }
    value[date] = hourList;
  }

  return { success: true, value };
}

export function dateRange(
  availableDates: LocalDate[],
  maxEntries: number,
): LocalDate[] {
  const sortedDates = availableDates.sort();
  const startDate = Temporal.PlainDate.from(sortedDates[0]);
  const endDate = Temporal.PlainDate.from(sortedDates[sortedDates.length - 1]);
  const range: Temporal.PlainDate[] = [];
  let currentDate = startDate;
  while (currentDate.dayOfWeek !== 1) {
    currentDate = currentDate.subtract({ days: 1 });
  }

  while (currentDate.until(endDate).sign === 1 && range.length < maxEntries) {
    range.push(currentDate);
    currentDate = currentDate.add({ days: 1 });
  }

  return range.map((v) => v.toString() as LocalDate);
}

export function isSetAndFinite(v: MaybeNumber): v is number {
  return v !== undefined && v !== null && isFinite(v);
}

export const timeWindows = {
  rise: [7, 8, 9],
  day: [10, 11, 12, 13, 14, 15],
  peak: [16, 17, 18],
  evening: [19, 20, 21, 22, 23],
  night: [0, 1, 2, 3, 4, 5],
} as const;
