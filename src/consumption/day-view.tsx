import { range } from '../ts.ts';
import { isSetAndFinite, type MaybeNumber } from './bill.ts';
import type { Stats } from './bill-analysis.tsx';

export function DayView({ day, stats }: { day: MaybeNumber[]; stats: Stats }) {
  const w = 350;
  const h = 120;
  const ox = 30;
  const oy = 20;
  const tw = w - ox;
  const th = h - oy;
  const ticks = 6;

  const { peak, baseline } = stats;

  const tickEvery = Math.round((peak / (ticks - 1)) * 10) / 10;

  return (
    <>
      <svg width={w} height={h}>
        <rect
          x={ox + (7 / 24) * tw}
          y={0}
          width={(3 / 24) * tw}
          height={th}
          fill={'#cd32ff44'}
        />
        <rect
          x={ox + (10 / 24) * tw}
          y={0}
          width={(6 / 24) * tw}
          height={th}
          fill={'#d4bc0e44'}
        />
        <rect
          x={ox + (16 / 24) * tw}
          y={0}
          width={(3 / 24) * tw}
          height={th}
          fill={'#f0461744'}
        />
        {range(24).map((hr) => {
          const val = day?.[hr];
          const height = isSetAndFinite(val) ? th * (val / peak) : 5;
          const hue = isSetAndFinite(val)
            ? 100 - (val / peak) * 100
            : 220; /* blue */
          return (
            <rect
              key={hr}
              x={ox + hr * (tw / 24) + 1}
              y={th - height}
              width={tw / 24 - 2}
              height={height}
              fill={`hsl(${hue}, 70%, 40%)`}
            >
              <title>
                {hr}:00: {isSetAndFinite(val) ? val.toFixed(2) : '???'} kWh
              </title>
            </rect>
          );
        })}
        {range(24)
          .filter((hr) => hr % 2 === 0)
          .map((hr) => (
            <text
              key={hr}
              x={ox + hr * (tw / 24)}
              y={th + 12}
              font-size={10}
              text-anchor={'middle'}
              fill={'#ddd'}
            >
              {hr}
            </text>
          ))}
        <rect
          x={ox}
          y={th - (baseline / peak) * th - 1}
          width={tw}
          height={2}
          fill={'#2b2b'}
        />
        {range(ticks).map((i) => {
          const v = i * tickEvery;
          return (
            <>
              <text
                x={ox - 2}
                y={th - (v / peak) * th + 4}
                font-size={10}
                fill={'#ccc'}
                text-anchor={'end'}
              >
                {v.toFixed(1)}kW
              </text>
              <line
                x1={ox}
                y1={th - (v / peak) * th}
                x2={w}
                y2={th - (v / peak) * th}
                stroke={'#ccc'}
              />
            </>
          );
        })}
      </svg>
    </>
  );
}
