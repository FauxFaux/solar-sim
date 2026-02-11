import type { UrlState } from '../url-handler.tsx';
import { findZone } from './mcs.ts';
import { heatCalculation } from '../usage/heating.tsx';
import { useContext } from 'preact/hooks';
import { TransContext } from '../app.tsx';

export function ByMonth({ us }: { us: UrlState }) {
  const [ts] = useContext(TransContext);
  const pointMonth = (ts?.billPointy?.[0]?.month ?? 0) - 1;

  const zone = findZone(us.loc);
  const [slope, ori] = us.ori;
  const mcs = zone.data;
  const gen = mcs[slope]?.[Math.round(ori / 5)] * us.kwp;
  const flatUsagePerc = (us.hub / gen) * 12;

  const ox = 60;
  const w = 350;
  const h = 200;
  const tw = w - ox;
  const th = h - 30;

  const { heatEstimate } = heatCalculation(us);

  const vToY = (v: number) => (v * 12 * th) / h;

  const lineAt = (v: number, stroke: string = '#ccc') => {
    const y = th - vToY(v);
    return (
      <g>
        <line x1={ox} y1={y} x2={w} y2={y} stroke={stroke} />
        <text x={ox - 7} y={y + 4} text-anchor={'end'} fill={stroke}>
          {Math.round((v / 100) * gen)}
        </text>
      </g>
    );
  };

  const tickAt = (v: number) => {
    // if (Math.abs(flatUsagePerc - v) < 2) return null;
    return lineAt(
      v,
      `hsla(0, 0%, 80%, ${Math.min(1, Math.pow(Math.abs(flatUsagePerc - v) / 2, 2))})`,
    );
  };

  return (
    <svg width={w} height={h}>
      {byMo.map((v, i) => {
        const vi = (v * 12 * th) / h;
        const vx = ox + (i * tw) / 12;
        return (
          <g key={i}>
            <rect
              x={vx}
              y={th - vi}
              width={(tw / 12) * 0.8}
              height={vi}
              fill={i === pointMonth ? '#cb4' : '#a29436'}
            >
              <title>
                {CAL[i]}: {v.toFixed(1)}%: {((gen * v) / 100).toFixed()}kWh/mo
              </title>
            </rect>
            <text x={vx + 9} y={h - 8} text-anchor={'middle'} fill={'#ddd'}>
              {CAL[i]}
            </text>
            <circle
              cx={vx + 9}
              cy={th - (((heatByMo[i] / 100) * heatEstimate) / gen) * 12 * 100}
              r={4}
              fill={'#b22'}
            />
          </g>
        );
      })}
      {tickAt(byMo[0])}
      {tickAt(byMo[9])}
      {tickAt(byMo[7])}
      {tickAt(byMo[2])}
      {tickAt(byMo[6])}
      {lineAt(flatUsagePerc, '#2b2')}
      <rect
        x={ox - 3}
        y={0}
        width={tw + 4}
        height={th}
        fill={'none'}
        stroke={'#ccc'}
      />
    </svg>
  );
}

export const CAL = 'JFMAMJJASOND' as const;

const byMo = [3.0, 4.5, 8.8, 11.0, 12.0, 13.5, 14.0, 11.5, 9.0, 6.0, 4.2, 2.5];

const heatByMo = [
  14.5, 15.4, 13.9, 12.4, 8.7, 5.4, 3.0, 2.4, 2.3, 3.3, 7.3, 11.4,
];
