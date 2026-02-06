import type { State } from '../ts.ts';
import type { UrlState } from '../url-handler.tsx';

export function EpcPicker({ uss: [us, setUs] }: { uss: State<UrlState> }) {
  const epc = us.hee;
  return (
    <svg
      width={350}
      height={100}
      onClick={(e) => {
        setUs((us) => ({
          ...us,
          hee: Math.max(
            0,
            Math.min(100, Math.round((300 - (e.offsetX - 25)) / 3)),
          ),
        }));
        e.preventDefault();
      }}
    >
      <g transform={'translate(10 27) rotate(-90 0 0)'}>
        <text text-anchor={'middle'} x={0} y={10} font-size={19} fill={'#ddd'}>
          EPC
        </text>
      </g>
      {EPCs.map((c, i) => {
        return (
          <g key={i} style={'cursor: pointer'}>
            <rect
              x={25 + i * 50}
              y={0}
              width={50}
              height={50}
              fill={`hsl(${(5 - i) * 20}, 70%, 40%)`}
            />
            <text
              text-anchor={'middle'}
              x={25 + i * 50 + 25}
              y={35}
              font-size={30}
              stroke={'#222'}
              font-weight={'bold'}
              fill={'#ddd'}
            >
              {c}
            </text>
          </g>
        );
      })}
      <g transform={`translate(${(100 - epc) * 3 - 40}, 22) rotate(-90 65 15)`}>
        <polygon
          points={'0,0 50,0 65,15 50,30 0,30'}
          fill={`hsl(${epc}, 70%, 40%)`}
          stroke={'#222'}
        />
        <text
          text-anchor={'middle'}
          x={25}
          y={23}
          font-size={25}
          stroke={'#222'}
          font-weight={'bold'}
          fill={'#ddd'}
        >
          {epc}
        </text>{' '}
      </g>
    </svg>
  );
}

const EPCs = 'ABCDEF'.split('');
