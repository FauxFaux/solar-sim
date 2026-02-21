import pvLive from '../assets/pv-live.json';
import { type State } from '../ts.ts';
import {
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'preact/hooks';
import { findMeteo } from './meteo.ts';
import type { UrlState } from '../url-handler.tsx';
import { Scrub } from './scrub.tsx';
import { allDatesInYear, DAY_NAMES, MONTH_NAMES } from '../granite/dates.ts';
import { ordinal, range, sum } from '../granite/numbers.ts';
import type { Temporal } from 'temporal-polyfill';
import { chunks } from '../system/mcs-meta.ts';
import { defaultMeteo, MeteoContext } from '../meteo-provider.ts';
import { FaSpinner } from 'react-icons/fa6';
import { type SimHour, simulateYear } from '../granite/simulate.ts';
import { unpackBwd } from '../consumption/bill.ts';
import { findZone } from '../system/mcs.ts';

// data file has 16 hours of data, from 06:00 to 21:59.999; 0: 06:00, 1: 07:00, ..., 6: 12:00, ..., 15: 21:00

const globalWindow = window;

export function PvLive({ uss: [us] }: { uss: State<UrlState> }) {
  const [w, setW] = useState(350);
  const frameRef = useRef<HTMLDivElement>(null);
  const windows = useState([278, 285] as [number, number]);
  const [meteos] = useContext(MeteoContext);
  const zone = useMemo(() => findZone(us.loc), [us.loc]);
  const [meteoData] = useContext(MeteoContext);
  const meteo = useMemo(
    () => findMeteo(meteoData, us.loc, us.ori),
    [meteoData, us.loc, us.ori],
  );

  const [window] = windows;
  const [slope, ori] = us.ori;

  useLayoutEffect(() => {
    const measure = () => {
      setW(Math.floor(frameRef.current?.getBoundingClientRect().width ?? 350));
    };
    measure();
    globalWindow.addEventListener('resize', measure);
    return () => globalWindow.removeEventListener('resize', measure);
  }, []);

  const mcsGen = zone.data[slope]?.[Math.round(Math.abs(ori) / 5)];

  const radScale = (mcsGen / sum(meteo.rad)) * us.kwp;

  const bwd = unpackBwd(us.bwd!);

  const bwdScale = us.hub / (sum(bwd.flat()) * (365 / 7));

  const simulationResult = simulateYear(
    // TODO: DST?
    chunks(
      meteo.rad.map((x) => x * radScale),
      24,
    ),
    // TODO: DST?
    range(54)
      .map(() => bwd.map((v) => v.map((v) => v * bwdScale)))
      .flat()
      // 1st jan: wednesday
      .slice(3),
    us.bat,
  );

  return (
    <div style={'max-width: 780px'} ref={frameRef}>
      <h3>
        Simulation{' '}
        {meteos.length === defaultMeteo.length ? (
          <FaSpinner style={{ animation: 'rotation 1s linear infinite' }} />
        ) : null}
      </h3>
      <Scrub windows={windows} w={w} />
      <Zoomed
        us={us}
        window={window}
        w={w}
        sim={simulationResult}
        meteo={meteo}
      />
      <Summary sim={simulationResult} us={us} />
    </div>
  );
}

function Summary({ sim, us }: { sim: SimHour[][]; us: UrlState }) {
  const simf = sim.flat();
  const batteryEmptyDays = sim.filter((day) =>
    day.some((hour) => hour[0] < 0.05),
  ).length;
  const batteryFillDays = sim.filter((day) =>
    day.some((hour) => hour[0] > us.bat * 0.99),
  ).length;
  const totalImport = sum(simf.map((v) => v[1])) / 0.99;
  const totalExported = sum(simf.map((v) => v[2]));
  const batteryCost = (us.bat / 0.9) * 220;
  const panelCost = us.kwp * 700;
  const flatCost = 3000;
  const systemCost = flatCost + batteryCost + panelCost;
  const unitCost = 0.2735;
  const unitValue = 0.12;

  const originalCost = us.hub * unitCost;
  const remainingImportCost = totalImport * unitCost;
  const exportProfit = totalExported * unitValue;
  const importSavings = originalCost - remainingImportCost;
  const kay = (n: number) => `£${(n / 1000).toFixed(1)}k`;

  const paybackYears = systemCost / (importSavings + exportProfit);
  return (
    <div class={'summary'}>
      <p>
        Annual import: {totalImport.toFixed()} kWh, a{' '}
        {(100 * (1 - totalImport / us.hub)).toFixed()}% reduction, saving £
        {importSavings.toFixed()}, costs £{remainingImportCost.toFixed()}.
      </p>
      <p>
        Annual export: {totalExported.toFixed()} kWh, £
        {(totalExported * unitValue).toFixed()} return.
      </p>
      <p>
        Estimated install cost: {kay(flatCost)} + {kay(panelCost)} panels +{' '}
        {kay(batteryCost)} batteries = {kay(systemCost)}.
      </p>
      <p>
        Payback = install / (import savings + export profit) ={' '}
        {paybackYears < 0 || paybackYears > 25
          ? 'never'
          : paybackYears.toFixed(1) + ' years'}
        .
      </p>
      <p>
        Battery fills {batteryFillDays} days/year, battery empties{' '}
        {batteryEmptyDays} days/year.
      </p>
    </div>
  );
}

function pointsFor(
  toGraph: number[][],
  ws: number,
  we: number,
  tw: number,
  th: number,
) {
  const windowRange = we - ws;
  const pointsPerDay = Math.min(toGraph[0].length, Math.ceil(tw / windowRange));

  const allPoints = toGraph.flatMap((d) => downsample(d, pointsPerDay));

  const ds = Math.floor(ws) * pointsPerDay;
  const de = Math.ceil(we) * pointsPerDay;
  const maxOfAll = Math.max(...allPoints);
  const shownPoints = allPoints.slice(ds, de);

  const points = shownPoints.map(
    (p, i, arr) => `${(i / arr.length) * tw},${(1 - p / maxOfAll) * th}`,
  );

  // close the loop
  points.unshift(`0,${th}`);
  points.push(`${tw},${th}`);

  return points;
}

function Zoomed({
  window: [ws, we],
  w,
  sim,
  meteo,
}: {
  us: UrlState;
  window: [number, number];
  w: number;
  sim: SimHour[][];
  meteo: ReturnType<typeof findMeteo>;
}) {
  const h = 200;
  const pt = 10;
  const pb = 30;
  const px = 10;
  const th = h - pt - pb;
  const tw = w - 2 * px;
  // positive
  const thp = 0.8 * th;

  const allDates = allDatesInYear(2025);

  const solarGraph = pvLive.map((v) => [
    0,
    0,
    0,
    0,
    0,
    0,
    ...v.map((v) => v / 1000),
    0,
    0,
    0,
  ]);

  const [meteoAppPoints, meteoRadPoints] = useMemo(() => {
    return [
      pointsFor(chunks(meteo.app, 24), ws, we, tw, thp),
      pointsFor(chunks(meteo.rad, 24), ws, we, tw, thp),
    ];
  }, [meteo, ws, we, tw]);

  // const solarPoints = pointsFor(solarGraph, ws, we, tw, thp);

  const shownDates = allDates.slice(Math.floor(ws), Math.ceil(we));

  const solarPoints = pointsFor(
    sim.map((day) => day.map((res) => res[0])),
    ws,
    we,
    tw,
    thp,
  );

  return (
    <svg width={w} height={h /*+ 120*/} style={{ 'user-select': 'none' }}>
      <g transform={`translate(${px},${pt})`}>
        {legendarySegmentLines(shownDates, tw, th)}
      </g>

      <g transform={`translate(${px},${pt})`}>
        <polyline
          points={meteoRadPoints.join(' ')}
          fill={'#cb4'}
          stroke="none"
        />
      </g>

      <g transform={`translate(${px},${pt + th})`}>
        <polyline
          points={meteoAppPoints.join(' ')}
          fill={'#84cb'}
          stroke="none"
        />
      </g>

      <g transform={`translate(${px},${pt})`}>
        <polyline
          points={solarPoints.slice(1, -1).join(' ')}
          fill="none"
          stroke={'#4ca'}
          // stroke-dasharray="5, 5"
        />

        <line x1={-4} x2={w} y1={thp} y2={thp} stroke="#cccccc88" />
        <line x1={-4} x2={w} y1={thp / 2} y2={thp / 2} stroke="#cccccc88" />
        <line x1={-4} x2={w} y1={0} y2={0} stroke="#cccccc88" />
      </g>

      <g transform={`translate(${px},${h - 15})`}>
        {legendaryDayNames(shownDates, tw)}
      </g>
      <g transform={`translate(${px},${h - 5})`}>
        {legendaryDates(shownDates, tw)}
      </g>
    </svg>
  );
}

function legendaryDayNames(shownDates: Temporal.PlainDate[], tw: number) {
  const dw = tw / shownDates.length;
  return shownDates.map((d, i) => {
    if (dw < 12 && d.dayOfWeek !== 1) return;
    if (dw < 6 && d.day > 7) return;
    const dayName = DAY_NAMES[d.dayOfWeek - 1];
    return (
      <text
        x={((i + 0.5) / shownDates.length) * tw}
        y={0}
        text-anchor={'middle'}
        font-size={12}
        fill={'#ccc'}
      >
        {dw > 35 ? dayName : dayName[0]}
      </text>
    );
  });
}

function legendaryDates(shownDates: Temporal.PlainDate[], tw: number) {
  const dw = tw / shownDates.length;
  if (dw < 1.5) return;

  const withDay = (d: Temporal.PlainDate, i: number) => (
    <text
      x={((i + 0.5) / shownDates.length) * tw}
      y={0}
      text-anchor={'middle'}
      font-size={10}
      fill={'#ccc'}
    >
      {ordinal(d.day)} {MONTH_NAMES[d.month - 1]}
    </text>
  );

  const show = (d: Temporal.PlainDate) => {
    if (dw > 55) return true;
    if (dw > 15) return d.dayOfWeek === 1 || d.dayOfWeek === 4;
    if (dw > 6) return d.dayOfWeek === 1;
    return d.dayOfWeek === 1 && d.day <= 7;
  };

  return shownDates.map((d, i) => (show(d) ? withDay(d, i) : null));
}

function legendarySegmentLines(
  shownDates: Temporal.PlainDate[],
  tw: number,
  th: number,
) {
  const dw = tw / shownDates.length;
  if (dw < 30) return [];
  return shownDates.map((_, i) => {
    // the start of the hour?
    const hToX = (h: number) => (((h - 6) / 16) * tw) / shownDates.length;
    return (
      <g transform={`translate (${(i / shownDates.length) * tw},0)`}>
        <line x1={hToX(7)} x2={hToX(7)} y1={0} y2={th + 2} stroke="#cd32ff44" />
        <line
          x1={hToX(10)}
          x2={hToX(10)}
          y1={0}
          y2={th + 2}
          stroke="#d4bc0e44"
        />
        <line
          x1={hToX(16)}
          x2={hToX(16)}
          y1={0}
          y2={th + 2}
          stroke="#d4bc0e44"
        />
        <line
          x1={hToX(19)}
          x2={hToX(19)}
          y1={0}
          y2={th + 2}
          stroke="#f0461744"
        />
      </g>
    );
  });
}

function downsample(arr: number[], targetPoints: number) {
  const factor = arr.length / targetPoints;
  const out = [];
  for (let i = 0; i < targetPoints; i++) {
    const start = Math.floor(i * factor);
    const end = Math.floor((i + 1) * factor);
    const segment = arr.slice(start, end);
    const avg = sum(segment) / segment.length;
    out.push(avg);
  }
  return out;
}
