import { range, sum } from '../granite/numbers.ts';
import { chunks } from './mcs-meta.ts';

export function ByHourRad({
  rad,
  kwp,
  eff,
}: {
  rad: number[];
  kwp: number;
  eff: number;
}) {
  const displayHours = 14;

  const rads = chunks(rad, 24);
  const wholeWinter = [...rads.slice(335), ...rads.slice(0, 60)].sort(
    (a, b) => sum(b) - sum(a),
  );
  const wholeSummer = rads.slice(150, 244).sort((a, b) => sum(b) - sum(a));
  const summer = median(wholeSummer.slice(5, 15)).map((v) => (v / 1000) * eff);
  const winter = median(wholeWinter.slice(5, 15)).map((v) => (v / 1000) * eff);
  winter.shift(); // dst lol

  const startHour = 6;
  const w = 350;
  const h = 200;

  const ox = 60;
  const oy = 12;

  const th = h - 40 - oy;
  const tw = w - ox;

  function prods(datums: number[], fill: string) {
    return range(displayHours)
      .map((hr) => hr + startHour)
      .map((hr) => {
        const hFrac = datums[hr];
        const x = ox + (hr - startHour) * (tw / displayHours);
        const y = hFrac * th;
        return (
          <g key={hr}>
            <rect
              x={x}
              y={oy + th - y}
              width={(w / displayHours) * 0.8}
              height={y}
              fill={fill}
            >
              <title>
                {hr}:00: {(hFrac * kwp).toFixed(1)} kWh
              </title>
            </rect>
            {hr % 2 === 0 && (
              <text x={x} y={h - 10} text-anchor={'middle'} fill={'#ddd'}>
                {hr}
              </text>
            )}
          </g>
        );
      });
  }

  return (
    <svg width={w} height={h}>
      {prods(summer, '#cb4')}
      {prods(winter, '#44a5cc66')}
      <text
        x={ox + 70}
        y={oy + th - summer[9] * th - 8}
        fill={'#44a5cc'}
        text-anchor={'end'}
      >
        winter
      </text>
      <text
        x={ox + 212}
        y={oy + th - Math.ceil(summer[16] * 6) * (th / 5) - 8}
        fill={'#cb4'}
        text-anchor={'start'}
      >
        summer
      </text>
      {range(5 + 1)
        .map((i) => i / 5)
        .map((v) => {
          const y = v * th;
          return (
            <g key={v}>
              <line
                x1={ox}
                y1={oy + th - y}
                x2={w}
                y2={oy + th - y}
                stroke={'#ccc'}
              />
              <text
                x={ox - 10}
                y={oy + th - y + 4}
                text-anchor={'end'}
                fill={'#ddd'}
              >
                {(v * kwp).toFixed(1)}
              </text>
            </g>
          );
        })}
    </svg>
  );
}

function median(arr: number[][]): number[] {
  const result = range(24).map(() => [] as number[]);
  for (const v of arr) {
    for (let i = 0; i < 24; ++i) {
      result[i].push(v[i]);
    }
  }

  return result.map((v) => v.sort((a, b) => b - a)[arr.length / 2]);
}
