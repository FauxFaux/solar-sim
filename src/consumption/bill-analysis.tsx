import type { UrlState } from '../url-handler.tsx';
import { andThen, entriesOf, type Result, type State, twoDp } from '../ts.ts';
import { useEffect, useState } from 'preact/hooks';
import * as Papa from 'papaparse';
import { BillView } from './bill-view.tsx';

export type LocalDate = `${number}-${number}-${number}`;

export type ParsedBill = Record<LocalDate, number[]>;

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
    const dateVal = new Date(dateStr);
    if (isNaN(dateVal.getTime())) {
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

    const dateWithoutHour = dateVal.toISOString().slice(0, 10) as LocalDate;
    const hour = dateVal.getHours();
    byDateHour[dateWithoutHour] ??= {};
    byDateHour[dateWithoutHour][hour] ??= 0;
    byDateHour[dateWithoutHour][hour] += floatVal;
  }

  const value: Record<LocalDate, number[]> = {};
  for (const [date, hourMap] of entriesOf(byDateHour)) {
    const hourList = [];
    for (let hour = 0; hour < 24; hour++) {
      hourList.push(twoDp(hourMap[hour] ?? 0));
    }
    value[date] = hourList;
  }

  console.log(value);

  return { success: true, value };
}
