import pvLive from '../assets/pv-live.json';
import { range, type State, sum } from '../ts.ts';
import { CAL } from '../system/by-month.tsx';
import { useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Temporal } from 'temporal-polyfill';
import { dayNames } from '../consumption/bill-view.tsx';
import { findMeteo } from './meteo.ts';
import type { UrlState } from '../url-handler.tsx';

// data file has 16 hours of data, from 06:00 to 21:59.999; 0: 06:00, 1: 07:00, ..., 6: 12:00, ..., 15: 21:00

const globalWindow = window;

export function PvLive({ uss: [us] }: { uss: State<UrlState> }) {
  const [w, setW] = useState(350);
  const frameRef = useRef<HTMLDivElement>(null);
  const windows = useState([278, 285] as [number, number]);
  const [window] = windows;

  useLayoutEffect(() => {
    const measure = () => {
      setW(Math.floor(frameRef.current?.getBoundingClientRect().width ?? 350));
    };
    measure();
    globalWindow.addEventListener('resize', measure);
    return () => globalWindow.removeEventListener('resize', measure);
  }, []);

  return (
    <div style={'max-width: 780px'} ref={frameRef}>
      <h3>PV Live: {w}</h3>
      <Scrub windows={windows} w={w} />
      <Zoomed us={us} window={window} w={w} />
    </div>
  );
}

function makeAllDates() {
  let currentDate = Temporal.PlainDate.from({ year: 2025, month: 1, day: 1 });
  const ret = [];
  for (let i = 0; i < 365; i++) {
    ret.push(currentDate);
    currentDate = currentDate.add({ days: 1 });
  }
  return ret;
}

function ordinal(n: number): string {
  switch (n % 10) {
    case 1:
      return n + 'st';
    case 2:
      return n + 'nd';
    case 3:
      return n + 'rd';
    default:
      return n + 'th';
  }
}

function Zoomed({
  us,
  window: [ws, we],
  w,
}: {
  us: UrlState;
  window: [number, number];
  w: number;
}) {
  const h = 100;
  const pt = 10;
  const pb = 30;
  const px = 10;
  const th = h - pt - pb;
  const tw = w - 2 * px;

  const meteo = useMemo(() => findMeteo(us.loc), [us.loc]);

  const allDates = makeAllDates();

  const windowRange = we - ws;
  const pointsPerDay = Math.min(pvLive[0].length, Math.ceil(w / windowRange));

  const allPoints = pvLive
    .map((v) => v.map((v) => v / 1000))
    .flatMap((d) => downsample(d, pointsPerDay));

  const ds = Math.floor(ws) * pointsPerDay;
  const de = Math.ceil(we) * pointsPerDay;
  const shownPoints = allPoints.slice(ds, de);
  const shownDates = allDates.slice(Math.floor(ws), Math.ceil(we));

  const points = shownPoints.map(
    (p, i, arr) =>
      `${px + (i / arr.length) * tw},${pt + (1 - p / Math.max(...allPoints)) * th}`,
  );

  // close the loop
  points.unshift(`${px},${pt + th}`);
  points.push(`${px + tw},${pt + th}`);

  return (
    <svg width={w} height={h}>
      <polyline points={points.join(' ')} fill="#cb4" stroke="none" />
      {shownDates.map((d, i) => {
        if (shownDates.length >= 30 && d.dayOfWeek !== 1) return;
        if (shownDates.length >= 90 && d.day > 7) return;
        return (
          <text
            x={px + ((i + 0.5) / shownDates.length) * tw}
            y={h - 15}
            text-anchor={'middle'}
            font-size={12}
            fill={'#ccc'}
          >
            {dayNames[d.dayOfWeek - 1][0]}
          </text>
        );
      })}
      {shownDates.map((d, i) => {
        return (
          <text
            x={px + (i / shownDates.length) * tw}
            y={pt + 8}
            text-anchor={'start'}
            font-size={10}
            fill={'#ccc'}
          >
            {meteo.app[d.dayOfYear * 24 + 12]?.toFixed()}C
          </text>
        );
      })}
      {shownDates.map((d, i) => {
        if (d.day !== 1) return null;
        if (shownDates.length <= 14) return null;
        return (
          <text
            x={px + (i / shownDates.length) * tw}
            y={h - 5}
            text-anchor={'start'}
            font-size={10}
            fill={'#ccc'}
          >
            {shownDates.length <= 365 / 2 ? '1st' : ''}{' '}
            {monthNames[d.month - 1]}
          </text>
        );
      })}
      {shownDates.map((d, i) => {
        if (d.day !== 15) return null;
        if (shownDates.length >= 90) return null;
        if (shownDates.length <= 14) return null;
        return (
          <text
            x={px + (i / shownDates.length) * tw}
            y={h - 5}
            text-anchor={'start'}
            font-size={10}
            fill={'#ccc'}
          >
            15th {monthNames[d.month - 1]}
          </text>
        );
      })}
      {shownDates.length <= 14 && (
        <text x={px} y={h - 5} fill={'#ccc'} font-size={10}>
          {ordinal(shownDates[0]?.day)} {monthNames[shownDates[0]?.month - 1]}
        </text>
      )}
      {shownDates.length <= 14 && shownDates.length > 8 && (
        <text
          x={px + (7.5 / shownDates.length) * tw}
          y={h - 5}
          fill={'#ccc'}
          font-size={10}
          text-anchor={'middle'}
        >
          {ordinal(shownDates[7]?.day)} {monthNames[shownDates[7]?.month - 1]}
        </text>
      )}
      {shownDates.length <= 14 &&
        shownDates.map((_, i) => {
          // the start of the hour?
          const hToX = (h: number) => (((h - 6) / 16) * tw) / shownDates.length;
          return (
            <g
              transform={`translate (${px + (i / shownDates.length) * tw},${pt})`}
            >
              <line
                x1={hToX(7)}
                x2={hToX(7)}
                y1={0}
                y2={th + 2}
                stroke="#cd32ff44"
              />
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
        })}
      <line x1={px - 4} x2={w} y1={pt + th} y2={pt + th} stroke="#cccccc88" />
      <line
        x1={px - 4}
        x2={w}
        y1={pt + th / 2}
        y2={pt + th / 2}
        stroke="#cccccc88"
      />
      <line x1={px - 4} x2={w} y1={pt} y2={pt} stroke="#cccccc88" />
    </svg>
  );
}

function Scrub({
  windows: [window, setWindow],
  w,
}: {
  windows: State<[number, number]>;
  w: number;
}) {
  const [holding, setHolding] = useState<
    ['s' | 'e' | 'm', initialOff: number] | null
  >(null);

  const byDay = pvLive.map((v) => sum(v.map((v) => v / 1000)));
  const days = byDay.length;

  const max = Math.max(...byDay);

  const h = 100;
  const py = 20;
  const px = 10;
  const th = h - 2 * py;
  const tw = w - 2 * px;

  const markerRadius = 8;

  const points = byDay.map(
    (p, day) => `${px + (day / days) * tw},${py + (1 - p / max) * th}`,
  );

  // close the loop
  points.unshift(`${px},${py + th}`);
  points.push(`${px + tw},${py + th}`);

  const [ws, we] = window;

  return (
    <svg
      width={w}
      height={h}
      onWheel={(e) => {
        const delta = Math.sign(e.deltaY) || Math.sign(e.deltaX);
        if (delta === 0) return;
        if (ws > we) return;
        const width = Math.round(we - ws);
        let ns = ws;
        let ne = we;
        if (e.altKey) {
          ne += delta;
        } else {
          const nudge = Math.round(delta * (e.shiftKey ? 1 : width));
          ns = Math.round(ws + nudge * (e.altKey ? -1 : 1));
          ne = Math.round(we + nudge);
        }
        if (ns < 0 || ne > days) return;
        setWindow([ns, ne]);
        e.preventDefault();
        return false;
      }}
      onMouseDown={(e) => {
        if (e.buttons !== 1) return;
        const mx = e.offsetX;
        // if (mx < px || mx > px + tw) return;
        const day = ((mx - px) / tw) * days;
        const ds = Math.abs(day - ws);
        const de = Math.abs(day - we);
        if (ds < markerRadius) {
          setHolding(['s', day - ws]);
        } else if (de < markerRadius) {
          setHolding(['e', day - we]);
        } else if (ws < we && day > ws && day < we) {
          setHolding(['m', day - (ws + we) / 2]);
        }
      }}
      onMouseUp={() => setHolding(null)}
      // onMouseLeave={() => setHolding(null)}
      onMouseMove={(e) => {
        if (!holding) return;
        if (e.buttons !== 1) {
          setHolding(null);
          return;
        }
        const mx = e.offsetX;
        if (mx < px || mx > px + tw) return;
        const day = Math.round(((mx - px) / tw) * days);
        setWindow(([ws, we]) => {
          if (!holding) return [ws, we];
          const [char, initialOff] = holding;
          const nd = day - initialOff;
          switch (char) {
            case 's':
              return Math.abs(nd - we) < 2 ? [ws, we] : [nd, we];
            case 'e':
              return Math.abs(nd - ws) < 2 ? [ws, we] : [ws, nd];
            case 'm': {
              // couldn't be bothered to get this to work, lol
              // const wrap = (v: number) => (v + days) % days;
              // const l = ws < we ? ws : we;
              // const r = ws < we ? we : ws;
              // const ns = nd - (r - l) / 2;
              // const ne = nd + (r - l) / 2;
              // return [wrap(ns), wrap(ne)];

              const ns = Math.round(nd - (we - ws) / 2);
              const ne = Math.round(nd + (we - ws) / 2);
              if (ns < 0) {
                return [0, we - ws];
              } else if (ne > days) {
                return [ws + (days - we), days];
              }
              return [ns, ne];
            }
          }
        });
        e.preventDefault();
        return false;
      }}
    >
      {/*<rect x={px} y={py} width={tw} height={th} fill="#444" />*/}
      <polyline points={points.join(' ')} fill="#cb4" stroke="none" />
      <g style={'pointer-events: none; user-select: none'}>
        {range(12).map((i) => (
          <text
            x={px + ((i + 0.5) / 12) * tw}
            y={h - 5}
            text-anchor={'middle'}
            font-size={12}
            fill={'#ccc'}
          >
            {CAL[i]}
          </text>
        ))}
      </g>
      {ws < we ? (
        <>
          <rect
            x={px}
            y={4}
            width={(ws / days) * tw}
            height={h - 4}
            fill={'hsla(0, 0%, 100%, 0.4)'}
          />
          <rect
            x={px + (we / days) * tw}
            y={4}
            width={(1 - we / days) * tw}
            height={h - 4}
            fill={'hsla(0, 0%, 100%, 0.4)'}
          />
        </>
      ) : (
        <>
          <rect
            x={px + (we / days) * tw}
            y={4}
            width={(ws / days - we / days) * tw}
            height={h - 4}
            fill={'hsla(0, 0%, 100%, 0.4)'}
          />
        </>
      )}
      <circle
        cx={px + (ws / days) * tw}
        cy={markerRadius}
        r={markerRadius}
        fill={'#ccc'}
      />
      <circle
        cx={px + (we / days) * tw}
        cy={markerRadius}
        r={markerRadius}
        fill={'#ccc'}
      />
    </svg>
  );
}

// p-shape: <path stroke="#333333" stroke-width="1" fill="none" opacity="1" stroke-linecap="round" stroke-linejoin="round" d="M95,234 C 96,187 113,150 150,151 C 178,151 203,129 202,101 C 201,72 183,54 149,54 C 128,53 96,55 96,151" />

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

const monthNames = [
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
];
