import { type State } from '../ts.ts';
import type { UrlState } from '../url-handler.tsx';
import { oris, slopes } from './mcs.ts';
import { range } from '../granite/numbers.ts';
import { compassName } from './orientation-picker.tsx';

export function OrientationInfo({
  mcs,
  uss: [us, setUs],
}: {
  mcs: number[][];
  uss: State<UrlState>;
}) {
  const w = 350;
  const h = 310;
  const tw = 330;
  const twh = tw / 2;
  const th = h - 30;
  const ox = w - tw;

  const min = 204;
  const max = 1132;
  const norm = (n: number) => (n - min) / (max - min);

  const oticks = 8;
  const sticks = 4;

  const [slope, ori] = us.ori;

  const setFromEvent = (x: number, y: number) => {
    const slope = Math.min(Math.round((y / th) * slopes), slopes - 1);
    let ori = -Math.round(((x - ox) / tw - 0.5) * oris * 2) * (180 / oris);
    ori = Math.max(-175, Math.min(175, ori));

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
      <g transform={`translate(${ox} 0)`}>
        {range(slopes).map((slope) =>
          range(oris * 2).map((oriX) => {
            const ori = oriX < oris ? oris - oriX - 1 : oriX - oris;
            const n = mcs[slope][ori];
            return (
              <rect
                key={`${slope}-${oriX}`}
                x={(oriX * twh) / oris}
                y={(slope * th) / slopes}
                width={w / oris}
                height={h / slopes}
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
          x={ox + (i * tw) / oticks}
          y={h - 10}
        >
          {compassName(-((i - oticks / 2) * 360) / oticks)}
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
        cx={ox + ((-ori / 180) * tw) / 2 + tw / 2}
        cy={(slope / slopes) * th}
        r={10}
        fill={'#6464f4'}
      />
    </svg>
  );
}
