import { type State } from '../ts.ts';
import type { UrlState } from '../url-handler.tsx';
import { useState } from 'preact/hooks';
import { FaBrush } from 'react-icons/fa6';
import type { TargetedMouseEvent } from 'preact';
import { range } from '../granite/numbers.ts';

export function LoadProfile({ uss: [us] }: { uss: State<UrlState> }) {
  const [grid, setGrid] = useState(familyHome.map((s) => s.split('')));
  const [brush, setBrush] = useState(1);

  const cw = 14;

  const th = 170;
  // const tw = cw * 24; // 24h, 336

  const cells = 12; // arbitrary
  const ch = Math.floor(th / cells);
  const hours = 24;

  const cellsInUse = grid.flat().filter((v) => v !== '0').length;
  const countByCell = range(palette.length).map(
    (v) => grid.flat().filter((c) => c === v.toString()).length,
  );

  function setCell(pl: number, hr: number, val: number) {
    const newGrid = [...grid];
    newGrid[pl][hr] = val.toString();
    setGrid(newGrid);
  }

  function buttonSetCell(
    pl: number,
    hr: number,
    e: TargetedMouseEvent<SVGElement>,
  ) {
    if (e.buttons === 1) {
      setCell(pl, hr, brush);
      e.preventDefault();
      return false;
    }
    if (e.buttons === 2) {
      setCell(pl, hr, 0);
      e.preventDefault();
      return false;
    }
  }

  return (
    <div>
      <h3>Load profile</h3>
      <svg width={350} height={200} onContextMenu={(e) => e.preventDefault()}>
        <g
          transform={'translate(7 0)'}
          onWheel={(e) => {
            if (e.deltaY < 0 && brush > 1) {
              setBrush((b) => Math.max(1, b - 1));
              e.preventDefault();
            } else if (e.deltaY > 0 && brush < palette.length - 1) {
              setBrush((b) => Math.min(palette.length - 1, b + 1));
              e.preventDefault();
            }
          }}
        >
          {range(12).map((pl) =>
            range(hours).map((hr) => (
              <rect
                x={hr * cw}
                y={pl * 14}
                width={cw - 1}
                height={ch - 1}
                fill={palette[parseInt(grid[pl][hr])]}
                onClick={() => setCell(pl, hr, brush)}
                onMouseDown={(e) => buttonSetCell(pl, hr, e)}
                onMouseMove={(e) => buttonSetCell(pl, hr, e)}
              />
            )),
          )}
        </g>
        <g transform={'translate(7 180)'}>
          {range(hours)
            .filter((hr) => hr % 2 === 0)
            .map((hr) => (
              <text
                x={hr * cw}
                y={5}
                fontSize={14}
                textAnchor={'middle'}
                fill={'#ccc'}
              >
                {hr}
              </text>
            ))}
        </g>
      </svg>
      <table class={'load-profile-table'}>
        <tbody>
          {range(6)
            .filter((i) => i > 0)
            .map((i) => (
              <tr
                onClick={() => setBrush(i)}
                class={brush === i ? 'selected' : ''}
              >
                <td>
                  <input type={'radio'} checked={brush === i} />
                  <div
                    key={i}
                    style={{
                      display: 'inline-block',
                      width: 20,
                      height: 20,
                      backgroundColor: palette[i],
                      marginRight: 5,
                    }}
                  >
                    {brush === i ? (
                      <FaBrush color={'#242424'} size={16} />
                    ) : null}
                  </div>{' '}
                  <input type={'text'} size={8} placeholder={defaultNames[i]} />
                </td>
                <td style={'text-align: right'}>
                  {((countByCell[i] / cellsInUse) * 100).toFixed(1)}%
                </td>
                <td>
                  {(((countByCell[i] / cellsInUse) * us.hub) / 365.24).toFixed(
                    2,
                  )}{' '}
                  kWh/d
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

const palette = [
  '#242424', // background (transparent)
  '#60a5fa', // sky blue
  '#fbbf24', // warm amber
  '#f87171', // coral red
  '#6ee7b7', // mint green
  '#c084fc', // lavender purple
];

const defaultNames = [undefined, 'baseline', 'adults', 'cooking', 'kids'];

const familyHome: string[] = [
  '000000000000000000000000',
  '000000000000000000000000',
  '000000000000000000300000',
  '000000000000000000330000',
  '000000044000000003330000',
  '000000044003330004440000',
  '000000022222222224440000',
  '000000022222222222222220',
  '000000022222222222222222',
  '111111111111111111111111',
  '111111111111111111111111',
  '111111111111111111111111',
];
