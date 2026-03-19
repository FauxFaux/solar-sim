import { entriesOf, type Result, type State } from '../ts.ts';
import type { UrlState } from '../url-handler.tsx';
import exampleBill from './example-bill.json';
import { isSetAndFinite, type ParsedBill } from './bill.ts';
import { ld2pd } from '../granite/dates.ts';
import { range, type Range } from '../granite/numbers.ts';

export function InferLoadProfile({
  uss: [us, setUs],
}: {
  uss: State<UrlState>;
}) {
  const bill = exampleBill as Result<ParsedBill>;
  if (!bill.success) {
    return (
      <div>
        <h3>Inferred load profile</h3>
        <p>Unavailable without ze beel.</p>
      </div>
    );
  }

  const byDh = byDayHour(bill.value);

  const allValues = Object.values(byDh)
    .flat()
    .sort((a, b) => a - b);
  const baseline = allValues[Math.floor(allValues.length * 0.02)] ?? 0;

  return (
    <div>
      <h3>Inferred load profile</h3>
      <pre>
        {JSON.stringify(
          [
            ...allValues.slice(0, 10),
            'butts' + baseline,
            ...allValues.slice(-10),
          ],
          null,
          1,
        )}
      </pre>
    </div>
  );
}

type Day = Range<0, 7>;
type Hour = Range<0, 24>;
type DayHour = `${Day}-${Hour}`;

function byDayHour(bill: ParsedBill) {
  const dh: Partial<Record<DayHour, number[]>> = {};
  for (const [dateS, hours] of entriesOf(bill)) {
    const date = ld2pd(dateS);
    const day = (date.dayOfWeek - 1) as Day;
    for (const h of range(24)) {
      const v = hours[h];
      if (!isSetAndFinite(v)) continue;
      const key: DayHour = `${day}-${h}`;
      dh[key] ??= [];
      dh[key].push(v);
    }
  }
  return dh;
}
