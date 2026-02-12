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
