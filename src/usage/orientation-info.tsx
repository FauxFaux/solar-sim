import { range } from '../ts.ts';

export function OrientationInfo({ mcs }: { mcs: number[][] }) {
  const w = 350;
  const h = 350;
  const tw = 320;
  const th = 320;

  // size of the real array
  const slopes = 91;
  const oris = 36;

  const min = 204;
  const max = 1132;
  const norm = (n: number) => (n - min) / (max - min);

  const oticks = 6;
  const sticks = 4;

  return (
    <>
      <svg width={350} height={350}>
        <g transform={`translate(${w - tw} 0)`}>
          {range(slopes).map((slope) =>
            range(oris).map((ori) => {
              const n = mcs[slope][ori];
              return (
                <rect
                  key={`${slope}-${ori}`}
                  x={(ori * tw) / oris}
                  y={(slope * th) / slopes}
                  width={350 / oris}
                  height={424 / slopes}
                  fill={`hsl(${Math.pow(norm(n), 1.4) * 120},80%,40%)`}
                />
              );
            }),
          )}
        </g>
        {range(oticks).map((i) => (
          <text
            fill={'white'}
            text-anchor={'middle'}
            key={i}
            x={w - tw + (i * w) / oticks}
            y={h - 10}
          >
            {((i * 180) / oticks).toFixed(0)}°
          </text>
        ))}
        {range(sticks + 1).map((i) => {
          const v = (i / sticks) * slopes;
          const by = (i * th) / sticks + 2 - (i === sticks ? 10 : 0);
          const len = 15;
          const xoff = 12;
          const ang = (v / 180) * Math.PI;
          return (
            <>
              <line
                x1={xoff}
                x2={xoff + Math.cos(ang) * len}
                y1={by}
                y2={by - Math.sin(ang) * len}
                stroke={'white'}
                stroke-width={2}
              />
              <line
                x1={xoff}
                x2={xoff + len - 1}
                y1={by}
                y2={by}
                stroke={'white'}
                stroke-width={2}
              />
            </>
          );
        })}
      </svg>
    </>
  );
}
