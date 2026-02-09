import { Temporal } from 'temporal-polyfill';
import type { LocalDate, ParsedBill } from './bill-analysis.tsx';
import { keysOf } from '../ts.ts';

export function BillView({ bill }: { bill: ParsedBill }) {
  const tileWidth = 48;
  const tileHeight = 30;
  const daysPerRow = 7;
  const rowsToShow = 6;

  const allDates = keysOf(bill)
    .sort()
    .slice(0, rowsToShow * daysPerRow);
  while (new Date(allDates[0]).getDay() !== 1) {
    allDates.unshift(
      Temporal.PlainDate.from(allDates[0])
        .subtract({ days: 1 })
        .toString() as LocalDate,
    );
  }

  const max = Math.max(...allDates.flatMap((date) => bill[date] ?? []));
  console.log('max', max);

  return (
    <svg width={350} height={rowsToShow * (tileHeight + 1)}>
      {allDates.map((date, i) => {
        const data = bill[date];
        const tileX = (i % daysPerRow) * (tileWidth + 1);
        const tileY = Math.floor(i / daysPerRow) * (tileHeight + 1);
        return (
          <g key={date} transform={`translate(${tileX}, ${tileY})`}>
            {data && (
              <rect
                width={tileWidth}
                height={tileHeight}
                fill={'rgba(52,52,52,0.38)'}
              >
                <title>
                  {date} (
                  {dayNames[Temporal.PlainDate.from(date).dayOfWeek - 1]}):{' '}
                  {data.reduce((a, b) => a + b, 0).toFixed(2)} kWh
                </title>
              </rect>
            )}
            {data?.map((val, hr) => {
              const height = tileHeight * (val / max);
              return (
                <rect
                  key={hr}
                  x={(hr / 24) * tileWidth}
                  y={tileHeight - height}
                  width={tileWidth / 24}
                  height={height}
                  fill={`hsl(${100 - (val / max) * 100}, 70%, 70%)`}
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
