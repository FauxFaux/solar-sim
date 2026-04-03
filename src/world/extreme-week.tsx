import type { State } from '../ts.ts';
import type { UrlState } from '../url-handler.tsx';
import { useContext, useMemo } from 'preact/hooks';
import { MeteoContext } from '../meteo-provider.ts';
import { findZone } from '../system/mcs.ts';
import { findMeteo } from '../granite/meteo/meteo-lookup.ts';
import { simulate } from '../granite/simulate.ts';
import {
  legendaryDates,
  legendaryDayNames,
  pointsFor,
} from './scrubby-sim.tsx';
import { allDatesInYear, DAY_NAMES_LONG } from '../granite/dates.ts';
import { chunks } from '../system/mcs-meta.ts';
import { sum } from '../granite/numbers.ts';
import { unitCost } from './magic.ts';

export function ExtremeWeek({ uss: [us] }: { uss: State<UrlState> }) {
  const [meteos] = useContext(MeteoContext);
  const zone = useMemo(() => findZone(us.loc), [us.loc]);
  const meteo = useMemo(
    () => findMeteo(meteos, us.loc, us.ori),
    [meteos, us.loc, us.ori],
  );

  const sim = simulate(us, meteo, zone);
  const rad = chunks(meteo.rad, 24);
  const daily = rad.map((v) => sum(v));

  const [ws, we] = dudd(daily);

  const allDates = allDatesInYear(2025);
  const shownDates = allDates.slice(Math.floor(ws), Math.ceil(we));

  const w = 350;
  const h = 160;
  const gh = h - 40;
  const simBatt = sim.map((v) => v.map((v) => v[0]));

  const simImp = sim.map((v) => v.map((v) => v[1]));

  const battGraph = pointsFor(simBatt, ws, we, w, gh);
  const impGraph = pointsFor(simImp, ws, we, w, gh);
  const radGraph = pointsFor(rad, ws, we, w, gh);

  const battReachesKwh = Math.max(...simBatt[ws + 1]);
  const batteryLastsUntil = batteryLasts(simBatt, ws + 1);

  const imp = sum(simImp[ws + 1]);
  const impAfter = sum(simImp[ws + 2]) + sum(simImp[ws + 3]);

  const sunnyDayName = DAY_NAMES_LONG[shownDates[1].dayOfWeek - 1];
  const waffle = (
    <>
      <p>
        Here we have some quintessential British {season(ws)} weather. A{' '}
        <span style={{ color: 'orange' }}>
          brief sunny {sunnyDayName} gives us hope
        </span>
        , but the clouds are to return.
      </p>
      {us.bat > 0 && (
        <p>
          In the sun,{' '}
          <span style={{ color: '#4ca' }}>
            the battery fills to {((battReachesKwh / us.bat) * 100).toFixed()}%
          </span>
          , but this {battReachesKwh.toFixed(1)} kWh is only enough to last us{' '}
          <b>{batteryLastsUntil}</b>.
        </p>
      )}
      <p>
        These particular clouds{' '}
        <span style={{ color: '#faa' }}>
          {' '}
          will cost us £{(impAfter * unitCost).toFixed(2)}
        </span>
        , compared to the £{(imp * unitCost).toFixed(2)} we spent on our lovely
        sunny {sunnyDayName}.
      </p>
    </>
  );

  return (
    <div>
      <h3>Extreme week</h3>
      <svg width={w} height={h}>
        <polyline points={radGraph.join(' ')} fill="orange" stroke={'orange'} />
        <polyline
          points={battGraph.slice(1, -1).join(' ')}
          fill="none"
          stroke={'#4ca'}
        />
        <polyline
          points={impGraph.join(' ')}
          fill="rgba(255,0,0,0.2)"
          stroke={'red'}
        />
        <g transform={`translate(${0},${h - 15})`}>
          {legendaryDayNames(shownDates, w)}
        </g>
        <g transform={`translate(${0},${h - 5})`}>
          {legendaryDates(shownDates, w)}
        </g>
        <line x1={-4} x2={w} y1={gh} y2={gh} stroke="#cccccc88" />
        <line x1={-4} x2={w} y1={gh / 2} y2={gh / 2} stroke="#cccccc88" />
        <line x1={-4} x2={w} y1={0} y2={0} stroke="#cccccc88" />
      </svg>
      {waffle}
    </div>
  );
}

function batteryLasts(simBatt: number[][], d0: number) {
  const hour = (v: number) => v.toString().padStart(2, '0');
  const emptyD0 = simBatt[d0].slice(12).indexOf(0);
  if (-1 !== emptyD0) return `until ${hour(emptyD0 + 12)}:00`;
  const emptyD1 = simBatt[d0 + 1].indexOf(0);
  if (-1 !== emptyD1) return `until ${hour(emptyD1)}:00 tomorrow`;
  const emptyD2 = simBatt[d0 + 2].indexOf(0);
  if (-1 !== emptyD2) return `until ${hour(emptyD2)}:00 the following day`;
  return 'for a while';
}

function season(doy: number) {
  if (doy < 60) return 'winter'; // Feb
  if (doy < 150) return 'spring'; // May
  if (doy < 244) return 'summer'; // Sept
  if (doy < 335) return 'autumn';
  return 'winter';
}

function dudd(ns: number[]) {
  let best = 42;
  let bestScore = -Infinity;

  for (let i = 0; i < ns.length - 4; i++) {
    const score = ns[i + 1] * 1.6 - ns[i] - ns[i + 2] - ns[i + 3] * 0.8;
    if (score < bestScore) continue;
    bestScore = score;
    best = i;
  }

  return [best, best + 4] as const;
}
