import type { UrlState } from './url-handler.tsx';
import type { State } from './ts.ts';
import { HomeUsage } from './usage';
import { SystemDesign } from './system';
import { ConsumptionDesign } from './consumption';
import { WorldDisplay } from './world';
import { FaCreativeCommons, FaCreativeCommonsBy } from 'react-icons/fa6';
import { IconContext } from 'react-icons';
import { MagicalStates } from './magical-states.tsx';

export function App({ uss }: { uss: State<UrlState> }) {
  return (
    <MagicalStates>
      <div id={'tiles'}>
        <HomeUsage uss={uss} />
        <SystemDesign uss={uss} />
        {/*<ConsumptionDesign uss={uss} />*/}
        <WorldDisplay uss={uss} />
      </div>
      <Footer />
    </MagicalStates>
  );
}

function Footer() {
  const ccBy4 = (
    <a href={'https://creativecommons.org/licenses/by/4.0/'} target={'_blank'}>
      <abbr title={'Creative Commons Attribution 4.0 International License'}>
        <FaCreativeCommons />
        <FaCreativeCommonsBy />
      </abbr>
    </a>
  );
  return (
    <IconContext.Provider value={{ style: { verticalAlign: 'middle' } }}>
      <div id={'footer'}>
        <p>
          daily solar by{' '}
          <a
            href={'https://www.solar.sheffield.ac.uk/pvlive/'}
            target={'_blank'}
          >
            pv-live
          </a>{' '}
          ({ccBy4})
        </p>
        <p>
          weather data by{' '}
          <a href="https://open-meteo.com/" target={'_blank'}>
            open-meteo.com
          </a>{' '}
          ({ccBy4})
        </p>
        <p>
          irradiance calculations by{' '}
          <a href={'https://mcscertified.com/'} target={'_blank'}>
            MCS Certified
          </a>{' '}
          (
          <a
            href={
              'https://mcscertified.com/low-carbon-landscapes/mcs-data-dashboard/'
            }
            target={'_none'}
            title={
              '"It is free and open to the public so there are no restrictions on who can see this information."'
            }
          >
            "open"
          </a>
          )
        </p>
        <p>
          code on{' '}
          <a href={'https://github.com/FauxFaux/solar-sim'} target={'_blank'}>
            github
          </a>{' '}
          (MIT)
        </p>
      </div>
    </IconContext.Provider>
  );
}
