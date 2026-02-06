import { range } from '../ts.ts';

export function OrientationInfo({ mcs }: { mcs: number[][] }) {
  const w = 350;
  const h = 350;
  const tw = 320;
  const th = 320;

  // size of the real array
  const slopes = 91;
  const oris = 36;

  // const min = Math.min(...mcs.flat());
  // const max = Math.max(...mcs.flat());
  const min = 204;
  const max = 1132;
  const norm = (n: number) => ((n - min) / (max - min));

  return (
    <svg width={350} height={350}>
      <g transform={`translate(${w - tw} ${h - th})`}>
        {range(slopes).map((slope) =>
          range(oris).map((ori) => {
            const n = mcs[slope][ori];
            return (
              <rect
                key={`${slope}-${ori}`}
                x={(ori * tw) / oris}
                y={(slope * th) / slopes}
                width={350 / 36}
                height={424 / 91}
                fill={`hsl(${norm(n)*100},50%,50%)`}
              />
            );
          }),
        )}
      </g>
    </svg>
  );
}
