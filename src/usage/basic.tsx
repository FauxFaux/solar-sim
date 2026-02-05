import type { UrlState } from '../url-handler.tsx';
import { entriesOf, type State } from '../ts.ts';
import { FaBuilding, FaHotTubPerson, FaHouseChimney } from 'react-icons/fa6';
import { FaCog } from 'react-icons/fa';
import type { ComponentChildren } from 'preact';
import { Hint } from '../hint.tsx';

export function BasicUsage({ uss: [us, setUs] }: { uss: State<UrlState> }) {
  const form: Record<
    UrlState['huc'],
    [ComponentChildren, ComponentChildren, number?]
  > = {
    '1': ['1 bedroom, 1-2 people', <FaBuilding />, 1800],
    '2': ['2-3 bedrooms, 2-3 people', <FaHouseChimney />, 2700],
    '4': ['4+ bedrooms, 4-5 people', <FaHotTubPerson />, 4100],
    c: [
      <>
        I know:{' '}
        <input
          type={'number'}
          min={0}
          step={50}
          style={'width: 8ch'}
          value={us.hub}
          onChange={(e) =>
            setUs((us) => ({
              ...us,
              huc: 'c',
              hub: e.currentTarget.valueAsNumber,
            }))
          }
        />{' '}
        <abbr title={'kilo-watt hours per year'}>kWh/yr</abbr>
      </>,
      <FaCog />,
    ],
  };

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
        {entriesOf(form).map(([k, [label, icon, setTo]]) => (
          <label key={k} class={us.huc === k ? 'selected' : ''}>
            <input
              type={'radio'}
              name={'home-usage'}
              value={k}
              checked={us.huc === k}
              onChange={() =>
                setUs((us) => ({
                  ...us,
                  huc: k,
                  ...(setTo ? { hub: setTo } : {}),
                }))
              }
            />
            {icon} {label}
          </label>
        ))}
      </form>
    </div>
  );
}
