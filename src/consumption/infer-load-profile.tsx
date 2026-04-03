import { entriesOf, type Result, type State } from '../ts.ts';
import type { UrlState } from '../url-handler.tsx';
import exampleBill from './example-bill.json';
import { isSetAndFinite, type ParsedBill } from './bill.ts';
import { DAY_NAMES, ld2pd } from '../granite/dates.ts';
import { bucketMean, range, type Range } from '../granite/numbers.ts';
import { percColourBright } from './bill-analysis.tsx';
import { numberToWords } from '../granite/words.ts';
import { unitCost } from '../world/magic.ts';

const BASELINE_PERC = 0.02;

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
    .flatMap((byH) => Object.values(byH))
    .flat()
    .sort((a, b) => a - b);
  const baselineKwh =
    allValues[Math.floor(allValues.length * BASELINE_PERC)] ?? 0;
  const maxKwh = Math.max(...allValues);

  const baselineW = Math.round(baselineKwh * 1000);
  return (
    <div>
      <h3>Inferred load profile</h3>
      <SummaryView byDh={byDh} baselineKwh={baselineKwh} maxKwh={maxKwh} />
      <p>
        When everyone's asleep, you're using {baselineW}W, the same as leaving{' '}
        {numberToWords(Math.round(baselineW / 9.5))}{' '}
        <abbr
          title={'9.5W IKEA Trådfri LED bulb, B22, 1055 lumen B22 LED bulb'}
        >
          smart bulbs
        </abbr>{' '}
        on all day, every day, at a cost of £
        {(unitCost * baselineKwh * 24).toFixed(2)}/day.
      </p>
    </div>
  );
}

function Flatogram({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const ns = values.map((v) => v / max);
  const w = 350;
  const tw = 350;
  const h = 100;
  const th = 80;

  const means = bucketMean(ns, tw);

  // const baseline = ns[Math.floor(ns.length * BASELINE_PERC)] ?? 0;
  const baseX = BASELINE_PERC * tw;

  return (
    <svg width={w} height={h}>
      {means.map((v, i) => (
        <line
          x1={i}
          x2={i}
          y1={th}
          y2={(1 - v) * th}
          stroke={percColourBright(v)}
        />
      ))}
      <line stroke={'grey'} x1={0} x2={w} y1={th} y2={th} />
      <line stroke={'green'} x1={baseX} x2={baseX} y1={0} y2={th} />
    </svg>
  );
}

type Day = Range<0, 7>;
type Hour = Range<0, 24>;
type ValuesByHour = Record<Hour, number[]>;

function byDayHour(bill: ParsedBill) {
  const dh = {} as Record<Day, ValuesByHour>;
  for (const day of range(7)) {
    dh[day] = {} as ValuesByHour;
    for (const hour of range(24)) {
      dh[day][hour] = [];
    }
  }

  for (const [dateS, hours] of entriesOf(bill)) {
    const date = ld2pd(dateS);
    const day = (date.dayOfWeek - 1) as Day;
    for (const h of range(24)) {
      const v = hours[h];
      if (!isSetAndFinite(v)) continue;
      dh[day][h].push(v);
    }
  }
  return dh;
}

function tile(bw: number, tlh: number, byH: ValuesByHour) {
  return range(24).map((h) => {
    const d = byH[h].sort((a, b) => a - b);
    const avg = d[Math.floor(d.length / 2)];
    const p95 = d[Math.floor(d.length * 0.95)];
    const p05 = d[Math.floor(d.length * 0.05)];
    const x = h * bw;
    return (
      <>
        <rect
          x={x}
          y={(1 - avg) * tlh}
          width={bw}
          height={avg * tlh}
          fill={percColourBright(avg)}
        />
        <line
          stroke={'#fff8'}
          x1={x}
          x2={x + 3}
          y1={(1 - p95) * tlh}
          y2={(1 - p95) * tlh}
        />{' '}
        <line
          stroke={'#fff8'}
          x1={x}
          x2={x + 3}
          y1={(1 - p05) * tlh}
          y2={(1 - p05) * tlh}
        />
        <line
          stroke={'#fff2'}
          x1={x + 1.5}
          x2={x + 1.5}
          y1={(1 - p95) * tlh}
          y2={(1 - p05) * tlh}
        />
      </>
    );
  });
}

function backer(tlw: number, tlh: number, text: string) {
  return (
    <text
      dominant-baseline={'middle'}
      text-anchor={'middle'}
      font-size={48}
      x={tlw / 2}
      y={tlh / 2}
      fill={'rgba(255,255,255,0.1)'}
    >
      {text}
    </text>
  );
}

function SummaryView({
  byDh: byDhKwh,
  baselineKwh,
  maxKwh,
}: {
  maxKwh: number;
  baselineKwh: number;
  byDh: Record<Day, ValuesByHour>;
}) {
  const w = 350;
  const h = 200;
  const tlh = h / 2;
  // const tth = tlh - 10;

  const bw = 3;
  const tlw = bw * 24; // 72
  const tlb = w / 4; // 87.5
  const tlg = tlb - tlw;

  const byDh = structuredClone(byDhKwh);
  const scale = 1 / (maxKwh - baselineKwh);
  for (const byH of Object.values(byDh)) {
    for (const hs of Object.values(byH)) {
      for (let i = 0; i < hs.length; ++i) {
        hs[i] = Math.max(0, (hs[i] - baselineKwh) * scale);
      }
    }
  }

  const combined = Object.fromEntries(
    range(24)
      .map((h) => range(7).flatMap((day) => byDh[day][h]))
      .map((v, k) => [k, v]),
  ) as ValuesByHour;
  return (
    <svg width={w} height={h}>
      {range(4).map((x) =>
        range(2).map((y) => {
          const day = (y * 4 + x) as Day;
          if ((day as number) === 7) return;
          return (
            <g transform={`translate(${tlb * x + tlg / 2}, ${tlh * y})`}>
              {backer(tlw, tlh, DAY_NAMES[day][0])}
              {tile(bw, tlh, byDh[day])}
            </g>
          );
        }),
      )}
      <g transform={`translate(${tlb * 3 + tlg / 2}, ${tlh})`}>
        {backer(tlw, tlh, 'A')}
        {tile(bw, tlh, combined)}
      </g>
    </svg>
  );
}
