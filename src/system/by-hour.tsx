import { range } from '../ts.ts';

export function ByHour({ kwp }: { kwp: number }) {
  const displayHours = 14;

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
              <text x={x + 9} y={h - 10} text-anchor={'middle'} fill={'#ddd'}>
                {hr}
              </text>
            )}
          </g>
        );
      });
  }

  return (
    <svg width={350} height={200}>
      {prods(prodAug, '#cb4')}
      {prods(prodJan, '#44a5cc66')}
      <text x={ox + 70} y={62} fill={'#44a5cc'} text-anchor={'end'}>
        winter
      </text>
      <text x={ox + 212} y={62} fill={'#cb4'} text-anchor={'start'}>
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

const prodAug = [
  0, 0, 0, 0, 0, 0, 0.02, 0.08, 0.19, 0.52, 0.71, 0.85, 1, 1, 0.94, 0.76, 0.56,
  0.29, 0.1, 0.03, 0, 0, 0, 0,
];

const prodJan = [
  0, 0, 0, 0, 0, 0, 0, 0.02, 0.21, 0.61, 0.81, 0.9, 0.85, 0.71, 0.42, 0.1, 0, 0,
  0, 0, 0, 0, 0, 0,
];
