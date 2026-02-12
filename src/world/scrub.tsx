import { type State } from '../ts.ts';
import { useState } from 'preact/hooks';
import pvLive from '../assets/pv-live.json';
import { range, sum } from '../granite/numbers.ts';
import { CAL } from '../granite/dates.ts';

export function Scrub({
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
