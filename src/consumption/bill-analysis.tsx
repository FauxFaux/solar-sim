import type { UrlState } from '../url-handler.tsx';
import {
  andThen,
  entriesOf,
  fromEntries,
  keysOf,
  range,
  type Result,
  type State,
} from '../ts.ts';
import { useEffect, useState } from 'preact/hooks';
import { BillView } from './bill-view.tsx';
import {
  isSetAndFinite,
  type LocalDate,
  parseBill,
  type ParsedBill,
  timeWindows,
} from './bill.ts';
import { DayView } from './day-view.tsx';
import { Hint } from '../hint.tsx';
import exampleBill from './example-bill.json';
import type { ComponentChildren } from 'preact';

export function BillAnalysis({ uss }: { uss: State<UrlState> }) {
  const [file, setFile] = useState<File | undefined>(undefined);
  // (real default set as an effect; typing hack)
  const cursors = useState('1980-01-01' as LocalDate);
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
    cursors[1](keysOf(parsed.value).sort()[0]);
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
        <p>
          <BillView bill={bill} cursors={cursors} />
        </p>
        <p>
          <DayView day={bill[cursors[0]]} stats={stats} />
        </p>
        <table style={'width: 100%'}>
          <tbody>
            {entriesOf(stats.byWindow).map(([window, nums]) => (
              <WindowRow
                key={window}
                window={window}
                nums={nums}
                peak={stats.peak}
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
}: {
  window: keyof typeof timeWindows;
  nums: number[];
  peak: number;
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
