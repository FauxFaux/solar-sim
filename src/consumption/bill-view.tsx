import { Temporal } from 'temporal-polyfill';
import { keysOf } from '../ts.ts';
import {
  pickDateRangeForBill,
  isSetAndFinite,
  type ParsedBill,
} from './bill.ts';
import { useState } from 'preact/hooks';
import { DAY_NAMES, ld2pd, type LocalDate } from '../granite/dates.ts';
import { range } from '../granite/numbers.ts';

export function BillView({
  bill,
  cursors: [cursor, setCursor],
}: {
  bill: ParsedBill;
  cursors: [LocalDate, (date: LocalDate) => void];
}) {
  const tileWidth = 48;
  const tileHeight = 30;
  const daysPerRow = 7;
  const rowsToShow = 6;
  const oy = 10;
  // (48+1)*7=343 (of our 350)

  const [picked, setPicked] = useState(false);

  const allDates = pickDateRangeForBill(keysOf(bill), rowsToShow * daysPerRow);

  const peak = Math.max(
    ...allDates
      .flatMap((date) => bill[date] ?? [])
      .filter((v) => isSetAndFinite(v)),
  );

  return (
    <svg width={350} height={rowsToShow * (tileHeight + 1) + oy + 1}>
      {allDates.map((date, i) => {
        const data = bill[date];
        const tileX = (i % daysPerRow) * (tileWidth + 1);
        const tileY = oy + Math.floor(i / daysPerRow) * (tileHeight + 1);
        return (
          <g key={date} transform={`translate(${tileX}, ${tileY})`}>
            {date === cursor && (
              <rect
                width={tileWidth}
                height={tileHeight}
                fill={'rgba(255,255,255,0.5)'}
                pointer-events={'none'}
              />
            )}
            <rect
              width={tileWidth}
              height={tileHeight}
              fill={'rgba(52,52,52,0.38)'}
              onMouseEnter={() => {
                if (!picked) setCursor(date);
              }}
              onClick={(e) => {
                if (picked && cursor === date) {
                  setPicked(false);
                } else {
                  setCursor(date);
                  setPicked(true);
                }
                e.preventDefault();
                return false;
              }}
            >
              <title>
                {date} ({DAY_NAMES[ld2pd(date).dayOfWeek - 1]}
                ):{' '}
                {data?.every((v) => isSetAndFinite(v))
                  ? data.reduce((a, b) => a + b, 0).toFixed(2)
                  : '???'}{' '}
                kWh
              </title>
            </rect>
            {range(24).map((hr) => {
              const val = data?.[hr];
              const height = isSetAndFinite(val)
                ? tileHeight * (val / peak)
                : 5;
              const hue = isSetAndFinite(val)
                ? 100 - (val / peak) * 100
                : 220; /* blue */
              return (
                <rect
                  key={hr}
                  x={(hr / 24) * tileWidth}
                  y={tileHeight - height}
                  width={tileWidth / 24}
                  height={height}
                  fill={`hsl(${hue}, 70%, 70%)`}
                />
              );
            })}
          </g>
        );
      })}
      {range(daysPerRow).map((d) => (
        <text
          x={((d % 7) + 0.5) * (tileWidth + 1)}
          y={8}
          text-anchor={'middle'}
          font-size={8}
          fill={'#ccc'}
        >
          {DAY_NAMES[d][0]}
        </text>
      ))}
    </svg>
  );
}
