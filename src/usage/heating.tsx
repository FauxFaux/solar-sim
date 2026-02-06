import { VscFlame } from 'react-icons/vsc';
import type { UrlState } from '../url-handler.tsx';
import { type State, entriesOf } from '../ts.ts';
import { TbAirConditioning } from 'react-icons/tb';
import { LuHeater } from 'react-icons/lu';
import type { ComponentChildren } from 'preact';
import { useState } from 'preact/hooks';

export function HeatingUsage({ uss: [us, setUs] }: { uss: State<UrlState> }) {
  const [epc, setEpc] = useState(68);

  const gasUsage = Math.round(4.11 * us.hub + 210);
  const floorEstimate = Math.round(0.02867 * us.hub + 22.9);
  const hotWater = us.hub / 4 + 1500;
  const epcEstimate = Math.round(
    ((-3.55 * epc + 343) * floorEstimate + hotWater) * 0.85,
  );
  // const heatLossEstimate = gasUsage / 2185;

  const heatings: Record<UrlState['hht'], [string, ComponentChildren]> = {
    g: ['gas', <VscFlame />],
    p: ['heat pump', <TbAirConditioning />],
    e: ['electric', <LuHeater />],
  };

  return (
    <div>
      <h3>Heating</h3>
      <form class={'heating-usage'}>
        {entriesOf(heatings).map(([k, [label, icon]]) => (
          <label key={k}>
            <input
              type={'radio'}
              name={'hht'}
              value={k}
              checked={us.hht === k}
              onChange={(e) =>
                setUs((us) => ({
                  ...us,
                  hht: e.currentTarget.value as UrlState['hht'],
                }))
              }
            />{' '}
            {icon} {label}
          </label>
        ))}
      </form>
      <div className={'strike'} style={'margin-top: 1em'}>
        <span>estimate with</span>
      </div>
      <p>
        <input
          type={'number'}
          min={0}
          step={100}
          style={'width: 10ch'}
          placeholder={(Math.round(gasUsage / 100) * 100).toFixed()}
        />{' '}
        kWh/yr gas usage
      </p>
      <div className={'strike'}>
        <span>or</span>
      </div>
      <p>
        <svg
          width={350}
          height={100}
          onClick={(e) => {
            setEpc(
              Math.max(
                0,
                Math.min(100, Math.round((300 - (e.offsetX - 25)) / 3)),
              ),
            );
            e.preventDefault();
          }}
        >
          <g transform={'translate(10 27) rotate(-90 0 0)'}>
            <text
              text-anchor={'middle'}
              x={0}
              y={10}
              font-size={19}
              fill={'#ddd'}
            >
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
          <g
            transform={`translate(${(100 - epc) * 3 - 40}, 22) rotate(-90 65 15)`}
          >
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
      </p>
      <p>
        <input
          type={'number'}
          min={0}
          step={5}
          style={'width: 10ch'}
          placeholder={floorEstimate.toFixed()}
        />{' '}
        m² floor area
      </p>
      <hr />
      <p>
        {Math.round(epcEstimate * mul[us.hht]).toLocaleString()} kWh/yr used for
        heating
      </p>
    </div>
  );
}

const mul = {
  g: 0,
  p: 1 / 3.5,
  e: 1,
} as const;

const EPCs = 'ABCDEF'.split('');
