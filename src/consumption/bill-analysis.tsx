import type { UrlState } from '../url-handler.tsx';
import { andThen, entriesOf, type Result, type State } from '../ts.ts';
import { useEffect, useState } from 'preact/hooks';
import * as Papa from 'papaparse';
import { BillView } from './bill-view.tsx';
import { Temporal } from 'temporal-polyfill';

export type LocalDate = `${number}-${number}-${number}`;

export type ParsedBill = Record<LocalDate, (number | undefined)[]>;

export function BillAnalysis({ uss }: { uss: State<UrlState> }) {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [parsed, setParsed] = useState<Result<ParsedBill> | undefined>(
    undefined,
  );

  useEffect(() => {
    if (!file) return;
    andThen(async () => parse(await file.text()), setParsed);
  }, [file]);

  return (
    <div>
      <h3>Bill analysis</h3>
      <p>
        <input
          type={'file'}
          accept={'text/csv'}
          onChange={(e) => setFile(e.currentTarget.files?.[0])}
        />
      </p>
      <p>
        {parsed?.success ? <BillView bill={parsed.value} /> : 'No file loaded'}
      </p>
    </div>
  );
}

function parse(text: string): Result<ParsedBill> {
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
    const hourList: (number | undefined)[] = [];
    for (let hour = 0; hour < 24; hour++) {
      hourList.push(hourMap[hour]);
    }
    value[date] = hourList;
  }

  console.log(value);

  return { success: true, value };
}

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
