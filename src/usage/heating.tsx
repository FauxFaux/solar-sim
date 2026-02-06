import { VscFlame } from 'react-icons/vsc';
import type { UrlState } from '../url-handler.tsx';
import { type State } from '../ts.ts';
import { TbAirConditioning } from 'react-icons/tb';
import { LuHeater } from 'react-icons/lu';

export function HeatingUsage({ uss: [us, setUs] }: { uss: State<UrlState> }) {
  const gasUsage = 4.11 * us.hub + 210;

  return (
    <div>
      <h3>Heating</h3>
      <form class={'heating-usage'}>
        <label>
          <VscFlame /> gas
        </label>
        <label>
          <TbAirConditioning /> heat pump
        </label>
        <label>
          <LuHeater /> electric
        </label>
      </form>
      <p>
        <input
          type={'number'}
          min={0}
          step={100}
          style={'width: 10ch'}
          value={Math.round(gasUsage / 100) * 100}
        />{' '}
        kWh/yr gas usage
      </p>
      <p>
        <input
          type={'number'}
          min={0}
          step={0.1}
          style={'width: 10ch'}
          value={(gasUsage / 2185).toFixed(1)}
        />{' '}
        kW design heat loss
      </p>
    </div>
  );
}
