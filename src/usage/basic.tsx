import type { UrlState } from '../url-handler.tsx';
import type { State } from '../ts.ts';
import { FaBuilding, FaHotTubPerson, FaHouseChimney } from 'react-icons/fa6';
import type { ComponentChildren } from 'preact';
import { Hint } from '../hint.tsx';
import { NumberInput } from '../widgets/number-input.tsx';

export function BasicUsage({ uss: [us, setUs] }: { uss: State<UrlState> }) {
  const form: [ComponentChildren, ComponentChildren, number][] = [
    ['1 bedroom, 1-2 people', <FaBuilding />, 1800],
    ['2-3 bedrooms, 2-3 people', <FaHouseChimney />, 2700],
    ['4+ bedrooms, 4-5 people', <FaHotTubPerson />, 4100],
  ];

  const ofcomTableHint = (
    <Hint>
      Based on the{' '}
      <a
        href={
          'https://www.ofgem.gov.uk/information-consumers/energy-advice-households/average-gas-and-electricity-use-explained#:~:text=in%20a%20year.-,Typical%20Domestic%20Consumption,-Caps%20on%20energy'
        }
        target={'_blank'}
      >
        ofcom typical bill numbers for a standard meter
      </a>
      .
    </Hint>
  );

  return (
    <div>
      <h3>
        Basic electricity usage
        {ofcomTableHint}
      </h3>
      <form class={'home-usage'}>
        {form.map(([label, icon, setTo]) => (
          <label>
            <input
              type={'radio'}
              name={'home-usage'}
              checked={Math.abs(us.hub - setTo) < 400}
              onChange={() =>
                setUs((us) => ({
                  ...us,
                  ...(setTo ? { hub: setTo } : {}),
                }))
              }
            />
            {icon} {label}
          </label>
        ))}
      </form>
      <NumberInput
        values={[us.hub, (hub: number) => setUs((us) => ({ ...us, hub }))]}
        unit={'kWh/year'}
        scrollMax={10000}
        step={50}
      >
        {(us.hub / 365).toFixed(1)} kWh/day
      </NumberInput>
    </div>
  );
}
