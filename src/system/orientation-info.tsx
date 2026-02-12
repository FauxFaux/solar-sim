import { type State } from '../ts.ts';
import type { UrlState } from '../url-handler.tsx';
import { oris, slopes } from './mcs.ts';
import { range } from '../granite/numbers.ts';

export function OrientationInfo({
  mcs,
  uss: [us, setUs],
}: {
  mcs: number[][];
  uss: State<UrlState>;
}) {
  const w = 350;
  const h = 380;
  const tw = 330;
  const th = 350;

  const min = 204;
  const max = 1132;
  const norm = (n: number) => (n - min) / (max - min);

  const oticks = 6;
  const sticks = 4;

  const [slope, ori] = us.ori;

  const setFromEvent = (x: number, y: number) => {
    const slope = Math.min(Math.round((y / th) * slopes), slopes - 1);
    const ori = Math.max(
      0,
      Math.min(Math.round(((x - (w - tw)) / tw) * oris) * (180 / oris), 175),
    );

    setUs((us) => ({ ...us, ori: [slope, ori] }));
  };

  return (
    <svg
      width={w}
      height={h}
      onClick={(e) => {
        setFromEvent(e.offsetX, e.offsetY);
        e.preventDefault();
      }}
      onMouseMove={(e) => {
        if (e.buttons !== 1) return;
        setFromEvent(e.offsetX, e.offsetY);
        e.preventDefault();
      }}
      onMouseDown={(e) => {
        if (e.buttons !== 1) return;
        e.preventDefault();
      }}
    >
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
        const xoff = 1;
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
      <circle
        cx={(ori / 180) * tw + w - tw}
        cy={(slope / slopes) * th}
        r={10}
        fill={'#6464f4'}
      />
    </svg>
  );
}
