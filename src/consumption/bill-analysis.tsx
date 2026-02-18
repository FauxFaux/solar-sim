import type { UrlState } from '../url-handler.tsx';
import {
  andThen,
  entriesOf,
  fromEntries,
  keysOf,
  type Result,
  type State,
} from '../ts.ts';
import { useContext, useEffect, useState } from 'preact/hooks';
import { BillView } from './bill-view.tsx';
import {
  isSetAndFinite,
  type MaybeNumber,
  parseBill,
  type ParsedBill,
  timeWindows,
} from './bill.ts';
import { DayView } from './day-view.tsx';
import { Hint } from '../hint.tsx';
import exampleBill from './example-bill.json';
import type { ComponentChildren } from 'preact';
import {
  ld2pd,
  type LocalDate,
  makeDateRange,
  pd2ld,
} from '../granite/dates.ts';
import { range } from '../granite/numbers.ts';
import { TransContext } from '../trans-context.ts';
import { deltaEncode } from '../system/mcs-meta.ts';

export function BillAnalysis({ uss: [, setUs] }: { uss: State<UrlState> }) {
  const [file, setFile] = useState<File | undefined>(undefined);
  const [, setTs] = useContext(TransContext);

  // (real default set as an effect; typing hack)
  const [cursor, setCursorReal] = useState('1980-01-01' as LocalDate);
  const setCursor = (date: LocalDate) => {
    setCursorReal(date);
    setTs((ts) => ({
      ...ts,
      billPointy: [ld2pd(date), NaN],
    }));
  };
  const [parsed, setParsed] = useState<Result<ParsedBill>>(
    exampleBill as Result<ParsedBill>,
  );

  useEffect(() => {
    if (!file) return;
    andThen(
      async () => parseBill(await file.text()),
      (result) => setParsed(result),
    );
  }, [file]);

  useEffect(() => {
    if (!parsed?.success) return;
    const bill = parsed.value;
    setCursor(keysOf(bill).sort()[0]);
    const goodWeek = findGoodWeek(bill)[0];
    setUs((us) => ({
      ...us,
      bwd: deltaEncode(goodWeek.flat().map((v) => Math.round(v * 100))),
    }));
  }, [parsed]);

  const stats = countStats(parsed?.success ? parsed.value : {});

  const downloadHint = (
    <Hint>
      Export six weeks of data, starting on a Monday, from e.g. your{' '}
      <a
        href={'https://octopus.energy/dashboard/new/my-energy'}
        target={'_blank'}
      >
        Octopus &rarr; My energy &rarr; download your usage
      </a>
      .
    </Hint>
  );

  let content: ComponentChildren;
  if (!parsed) {
    content = 'Loading...';
  } else if (parsed.success) {
    const bill = parsed.value;
    content = (
      <>
        <BillView bill={bill} cursors={[cursor, setCursor]} />
        <DayView day={bill[cursor]} stats={stats} />
        <table style={'width: 100%'}>
          <tbody>
            {entriesOf(stats.byWindow).map(([window, nums]) => (
              <WindowRow
                key={window}
                window={window}
                nums={nums}
                peak={stats.peak}
                today={bill[cursor]}
              />
            ))}
          </tbody>
        </table>
      </>
    );
  } else {
    console.log(parsed.error);
    content = 'Failed to parse file: ' + parsed.error;
  }

  return (
    <div>
      <h3>Bill analysis {downloadHint}</h3>
      <p>
        <input
          type={'file'}
          accept={'text/csv'}
          onChange={(e) => setFile(e.currentTarget.files?.[0])}
        />
      </p>
      {content}
    </div>
  );
}

function WindowRow({
  window,
  nums,
  peak,
  today,
}: {
  window: keyof typeof timeWindows;
  nums: number[];
  peak: number;
  today: MaybeNumber[];
}) {
  const sumUnscaled = nums.reduce((a, b) => a + b, 0) || 0;
  const mean = sumUnscaled / nums.length / peak;
  const p75 = (nums[Math.floor(nums.length * 0.75)] ?? 0) / peak;
  const p25 = (nums[Math.floor(nums.length * 0.25)] ?? 0) / peak;
  const p98 = (nums[Math.floor(nums.length * 0.98)] ?? 0) / peak;
  const p02 = (nums[Math.floor(nums.length * 0.02)] ?? 0) / peak;

  const h = 26;
  const bh = 8;
  const w = 170;

  const by = (h - bh) / 2;
  const whiter = '#eee';
  const blacker = '#111';
  const timeWindow = timeWindows[window];
  return (
    <tr>
      <td>
        {[timeWindow[0], timeWindow[timeWindow.length - 1] + 1]
          .map((v) => v.toString().padStart(2, '0') + 'h')
          .join('-')}
      </td>
      <td>
        <svg width={w} height={h}>
          <rect x={0} y={0} width={w} height={h} fill={'#333'} />
          {nums.map((v, i) => {
            const perc = v / peak;
            return (
              <rect
                key={i}
                x={perc * w - 1}
                y={0}
                width={3}
                height={h}
                fill={`hsla(${100 - perc * 100}, 70%, 25%, 0.2)`}
              />
            );
          })}
          {today
            ?.filter((v) => isSetAndFinite(v))
            .filter((_, hr) => (timeWindow as readonly number[]).includes(hr))
            .map((v) => {
              const perc = v / peak;
              return (
                <rect
                  x={perc * w - 1}
                  y={0}
                  width={3}
                  height={h}
                  fill={`hsla(${100 - perc * 100}, 70%, 35%, 0.8)`}
                />
              );
            })}

          <line
            x1={p02 * w}
            y1={by}
            x2={p02 * w}
            y2={h - by}
            stroke-width={2}
            stroke={whiter}
          />
          <line
            x1={p98 * w}
            y1={by}
            x2={p98 * w}
            y2={h - by}
            stroke-width={2}
            stroke={whiter}
          />
          <line
            x1={p02 * w}
            y1={h / 2}
            x2={p98 * w}
            y2={h / 2}
            stroke-width={2}
            stroke={whiter}
          />
          <rect
            x={p25 * w}
            y={by}
            width={p75 * w}
            height={bh}
            fill={whiter}
            stroke={blacker}
          />
          <line
            x1={mean * w}
            y1={by}
            x2={mean * w}
            y2={h - by}
            stroke-width={2}
            stroke={blacker}
          />
        </svg>
      </td>
      <td>
        {((sumUnscaled / nums.length) * timeWindow.length).toFixed(1)}kWh/d
      </td>
    </tr>
  );
}

export type Stats = ReturnType<typeof countStats>;

function countStats(bill: ParsedBill) {
  const allNumbers = Object.values(bill)
    .flat()
    .filter((v) => isSetAndFinite(v))
    .sort((a, b) => a - b);
  const peak = Math.max(...allNumbers);

  const baseline = allNumbers[Math.floor(allNumbers.length * 0.05)] ?? 0;

  const byHour = range(24).map(() => [] as number[]);
  for (const day of Object.values(bill)) {
    for (let hr = 0; hr < 24; hr++) {
      const val = day?.[hr];
      if (isSetAndFinite(val)) byHour[hr].push(val);
    }
  }

  const byWindow: Record<keyof typeof timeWindows, number[]> = fromEntries(
    entriesOf(timeWindows).map(
      ([window, hours]) =>
        [
          window,
          hours.flatMap((hr) => byHour[hr]).sort((a, b) => a - b),
        ] as const,
    ),
  );

  return { peak, baseline, byWindow };
}

function findGoodWeek(bill: ParsedBill) {
  return keysOf(bill)
    .map((d) => ld2pd(d))
    .filter((d) => d.dayOfWeek === 1)
    .map((d) =>
      makeDateRange(d, 7)
        .map((day) => bill[pd2ld(day)])
        .filter((days) => days && days.every((v) => isSetAndFinite(v))),
    );
}
