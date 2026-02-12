import { Temporal } from 'temporal-polyfill';

export type LocalDate = `${number}-${number}-${number}`;

export const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export const CAL = 'JFMAMJJASOND' as const;

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function parseLondon(str: string): Temporal.ZonedDateTime | undefined {
  // as the Temporal parsers don't accept anything fnu
  const instant = new Date(str).getTime();
  if (isNaN(instant)) {
    return undefined;
  }

  return Temporal.Instant.fromEpochMilliseconds(instant).toZonedDateTimeISO(
    'Europe/London',
  );
}

function toDateHour(zdt: Temporal.ZonedDateTime): [LocalDate, number] {
  return [zdt.toPlainDate().toString() as LocalDate, zdt.hour];
}

export function parseDateHour(str: string): [LocalDate, number] | undefined {
  const zdt = parseLondon(str);
  if (!zdt) {
    return undefined;
  }
  return toDateHour(zdt);
}

export function allDatesInYear(year: number) {
  let currentDate = Temporal.PlainDate.from({ year, month: 1, day: 1 });
  const ret = [];

  const days = currentDate.daysInYear;

  for (let i = 0; i < days; i++) {
    ret.push(currentDate);
    currentDate = currentDate.add({ days: 1 });
  }
  return ret;
}
