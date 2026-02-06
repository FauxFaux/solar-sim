import { VscFlame } from 'react-icons/vsc';
import type { UrlState } from '../url-handler.tsx';
import { type State, entriesOf } from '../ts.ts';
import { TbAirConditioning } from 'react-icons/tb';
import { LuHeater } from 'react-icons/lu';
import type { ComponentChildren } from 'preact';
import { EpcPicker } from './epc-picker.tsx';

export function heatCalculation(us: UrlState) {
  const gasUsage = us.heg || Math.round((4.11 * us.hub + 210) / 100) * 100;
  const floorEstimate = us.hef || Math.round(0.02867 * us.hub + 22.9);
  const hotWater = us.hub / 4 + 1500;
  const gasFromEpc = (-3.55 * us.hee + 343) * floorEstimate + hotWater;
  const heatEstimate = Math.round(
    (us.heg ? gasUsage : gasFromEpc) * 0.85 * mul[us.hht],
  );
  return { gasUsage, floorEstimate, heatEstimate };
}

const mul = {
  g: 0,
  p: 1 / 3.5,
  e: 1,
} as const;

export function HeatingUsage({ uss: [us, setUs] }: { uss: State<UrlState> }) {
  const { gasUsage, floorEstimate, heatEstimate } = heatCalculation(us);

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
      <div className={'strike'} style={'margin-top: 0.4em'}>
        <span>estimate with</span>
      </div>
      <p style={'margin: 0.4em 0'}>
        <input
          type={'number'}
          min={0}
          step={100}
          style={'width: 10ch'}
          value={us.heg}
          onChange={(e) =>
            setUs((us) => ({ ...us, heg: e.currentTarget.valueAsNumber }))
          }
          onFocus={() => {
            if (us.heg) return;
            setUs((us) => ({ ...us, heg: gasUsage }));
          }}
          placeholder={gasUsage.toFixed()}
        />{' '}
        kWh/yr gas usage
      </p>
      <div className={'strike ' + (us.heg ? 'disabled' : '')}>
        <span>or</span>
      </div>
      <p class={us.heg ? 'disabled' : ''} style={'margin: 0.4em 0'}>
        <EpcPicker uss={[us, setUs]} />
        <input
          type={'number'}
          min={0}
          step={5}
          style={'width: 10ch'}
          value={us.hef}
          onFocus={() => {
            if (us.hef) return;
            setUs((us) => ({ ...us, hef: floorEstimate }));
          }}
          onChange={(e) =>
            setUs((us) => ({ ...us, hef: e.currentTarget.valueAsNumber }))
          }
          placeholder={floorEstimate.toFixed()}
        />{' '}
        m² floor area
      </p>
      <hr />
      <p style={'margin: 0.4em 0'}>
        {Math.round(heatEstimate).toLocaleString()} kWh/yr used for heating
      </p>
    </div>
  );
}
