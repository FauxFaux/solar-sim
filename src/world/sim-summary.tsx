import type { UrlState } from '../url-handler.tsx';
import { simulate } from '../granite/simulate.ts';
import { sum } from '../granite/numbers.ts';
import { useContext, useMemo, useState } from 'preact/hooks';
import { MeteoContext } from '../meteo-provider.ts';
import { findZone } from '../system/mcs.ts';
import { findMeteo } from './meteo.ts';
import { arc } from '../granite/arc.ts';
import { mcsGen } from '../system/sys-stats.tsx';
import type { ComponentChildren } from 'preact';
import { FaRegFaceSadCry } from 'react-icons/fa6';

export function SimSummary({ us }: { us: UrlState }) {
  const [active, setActive] = useState('import');
  const [meteos] = useContext(MeteoContext);
  const zone = useMemo(() => findZone(us.loc), [us.loc]);
  const meteo = useMemo(
    () => findMeteo(meteos, us.loc, us.ori),
    [meteos, us.loc, us.ori],
  );

  const gen = us.kwp * mcsGen(us.ori, zone.data);

  const sim = simulate(us, meteo, zone);

  const simf = sim.flat();
  const batteryEmptyDays = sim.filter((day) =>
    day.some((hour) => hour[0] < 0.05),
  ).length;
  const batteryFillDays = sim.filter((day) =>
    day.some((hour) => hour[0] > us.bat * 0.99),
  ).length;
  const totalImport = sum(simf.map((v) => v[1])) / 0.99;
  const totalExported = sum(simf.map((v) => v[2]));
  const batteryCost = (us.bat / 0.9) * 220;
  const panelCost = us.kwp * 700;
  const flatCost = 3000;
  const systemCost = flatCost + batteryCost + panelCost;
  const unitCost = 0.2735;
  const unitValue = 0.12;

  const originalCost = us.hub * unitCost;
  const remainingImportCost = totalImport * unitCost;
  const exportRevenue = totalExported * unitValue;
  const exportProfit = exportRevenue;
  const importSavings = originalCost - remainingImportCost;
  const kay = (n: number) => `£${(n / 1000).toFixed(1)}k`;

  const paybackYears = systemCost / (importSavings + exportProfit);
  const importSavedPerc = 1 - totalImport / us.hub;
  const exportColour = '#8353d1';

  function Explain({
    children,
    id,
  }: {
    children: ComponentChildren;
    id: string;
  }) {
    return (
      <div
        class={'pie-explain ' + (active === id ? 'selected' : '')}
        onMouseEnter={() => setActive(id)}
      >
        {children}
      </div>
    );
  }

  const explanation = () => {
    switch (active) {
      case 'import':
        return (
          <>
            <p>
              Of usage,{' '}
              <span style={{ color: 'orange' }}>
                {(us.hub - totalImport).toFixed()} kWh is covered by generation
              </span>
              , leaving{' '}
              <span style={{ color: 'red' }}>
                {totalImport.toFixed()} kWh to be imported from the grid
              </span>
              .
            </p>
            <p>
              This import costs of <b>£{remainingImportCost.toFixed()}/year</b>,
              where originally you would have paid £{originalCost.toFixed()}
              /year @ {unitCost * 100}
              p/kWh.
            </p>
          </>
        );
      case 'savings':
        return (
          <>
            <p>
              Total annual savings from the system are{' '}
              <span style={{ color: 'orange' }}>
                £{importSavings.toFixed()} from reduced imports
              </span>{' '}
              +{' '}
              <span style={{ color: exportColour }}>
                £{exportRevenue.toFixed()} from exported energy sales
              </span>
              , giving a total annual saving of{' '}
              <b>£{(importSavings + exportRevenue).toFixed()}</b>.
            </p>
            <p>
              {(
                (importSavings / (importSavings + exportRevenue)) *
                100
              ).toFixed()}
              % of this saving is reduced imports.
            </p>
          </>
        );
      case 'export':
        return (
          <p>
            Of{' '}
            <span style={{ color: 'orange' }}>
              total solar generation, {gen.toFixed()} kWh
            </span>
            ,
            <span style={{ color: exportColour }}>
              {totalExported.toFixed()} kWh is exported
            </span>{' '}
            as it cannot be used or stored, giving a revenue of{' '}
            <b>£{exportRevenue.toFixed()}</b> @ {unitValue * 100}p/kWh.
          </p>
        );

      case 'payback':
        return (
          <>
            <p>
              Roughly estimated install cost: {kay(flatCost)} + {kay(panelCost)}{' '}
              panels + {kay(batteryCost)} batteries = <b>{kay(systemCost)}</b>.
            </p>
            <p>
              Savings:{' '}
              <span style={{ color: 'orange' }}>
                £{importSavings.toFixed()} from reduced imports
              </span>{' '}
              +{' '}
              <span style={{ color: exportColour }}>
                £{exportRevenue.toFixed()} from exports
              </span>{' '}
              = <b>£{(importSavings + exportRevenue).toFixed()}/year</b>.
            </p>
            {paybackYears > 0 && paybackYears < 25 ? (
              <p>
                Payback = cost / savings ={' '}
                <b>{paybackYears.toFixed(1)} years</b>.
              </p>
            ) : (
              <p>
                It's unlikely a system with this design will payback within its
                useful lifetime.
              </p>
            )}
          </>
        );

      case 'battery':
        return (
          <>
            <p>
              Battery fills {batteryFillDays} days/year, spilling excess energy
              into the grid.
            </p>
            <p>
              Battery empties {batteryEmptyDays} days/year, requiring you to
              import.
            </p>
          </>
        );
    }
  };

  return (
    <div class={'summary'}>
      <h3>Summary</h3>
      <div class={'miniflex'}>
        <Explain id={'import'}>
          <MiniPie
            title={'import'}
            perc={importSavedPerc}
            line1={totalImport.toFixed()}
            line2={'kWh'}
            startColour={'orange'}
            endColour={'red'}
            textColour={'red'}
          />
        </Explain>
        <Explain id={'export'}>
          <MiniPie
            title="export"
            perc={totalExported / gen}
            line1={totalExported.toFixed()}
            line2={'kWh'}
            startColour={exportColour}
            endColour={'orange'}
          />
        </Explain>
        <Explain id={'savings'}>
          <MiniPie
            title="savings"
            perc={importSavings / (importSavings + exportProfit)}
            line1={'£' + importSavings.toFixed()}
            line2={'£' + exportRevenue.toFixed()}
            startColour={'orange'}
            endColour={exportColour}
            textColour2={exportColour}
          />
        </Explain>
      </div>
      <div class={'miniflex'} style={'margin-top: 1em'}>
        <Explain id={'payback'}>
          {paybackYears > 0 && paybackYears < 25 ? (
            <MiniPie
              title={'payback'}
              perc={paybackYears / 25}
              line1={paybackYears.toFixed(1)}
              line2={'years'}
              startColour={'#020'}
              endColour={'green'}
              textColour={'green'}
            />
          ) : (
            <div style={{ textAlign: 'center', width: '80px' }}>
              payback unlikely <FaRegFaceSadCry />
            </div>
          )}
        </Explain>
        <Explain id={'battery'}>
          <MiniPie
            title={'battery'}
            perc={batteryFillDays / 365}
            line1={batteryFillDays.toFixed()}
            line2={'fills'}
            startColour={'var(--energy-battery-in-color)'}
            endColour={'rgba(240,98,146,0.15)'}
          />
        </Explain>
        <Explain id={'battery'}>
          <MiniPie
            title={'battery'}
            perc={1 - batteryEmptyDays / 365}
            line1={batteryEmptyDays.toFixed()}
            line2={'empties'}
            startColour={'var(--energy-battery-out-color)'}
            endColour={'rgba(77,182,172,0.15)'}
          />
        </Explain>
      </div>
      {explanation()}
    </div>
  );
}

function MiniPie({
  perc,
  line1,
  line2,
  title,
  startColour,
  endColour,
  textColour,
  textColour2,
}: {
  perc: number;
  line1: string;
  line2: string;
  title: string;
  startColour: string;
  endColour: string;
  textColour?: string;
  textColour2?: string;
}) {
  const w = 80;
  const h = 100;
  const cx = w / 2;
  const cy = h / 2 + 10;
  const thick = 10;
  return (
    <svg width={w} height={h}>
      <text
        font-size={16}
        text-anchor={'middle'}
        dominant-baseline={'central'}
        fill={'white'}
        x={cx}
        y={8}
      >
        {title}
      </text>
      <circle cx={cx} cy={cy} r={cx - thick} />
      <path
        d={arc({
          x: cx,
          y: cy,
          r: cx - thick,
          R: cx,
          start: 0,
          end: 360 * perc,
        })}
        fillRule={'evenodd'}
        fill={startColour}
      />
      <path
        d={arc({
          x: cx,
          y: cy,
          r: cx - thick,
          R: cx,
          start: Math.max(1, 360 * perc),
          end: 360,
        })}
        fillRule={'evenodd'}
        fill={endColour}
      />
      <text
        font-size={16}
        text-anchor={'middle'}
        dominant-baseline={'central'}
        fill={textColour ?? startColour}
        x={cx}
        y={cy - 10}
      >
        {line1}
      </text>
      <text
        font-size={12}
        text-anchor={'middle'}
        dominant-baseline={'central'}
        fill={textColour2 ?? textColour ?? startColour}
        x={cx}
        y={cy + 10}
      >
        {line2}
      </text>
    </svg>
  );
}
