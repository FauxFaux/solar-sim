import { isSetAndFinite, unpackBwd } from '../consumption/bill.ts';
import type { UrlState } from '../url-handler.tsx';
import type { Meteo } from '../meteo-provider.ts';
import { range, sum } from './numbers.ts';
import { chunks } from '../system/mcs-meta.ts';
import type { Zone } from '../system/mcs.ts';

// 365 days of 24 hours
export type YearOfKwH = number[][];

export type SimHour = [batt: number, imp: number, exp: number];

interface HouseState {
  cap: number;
  batt: number;
}

export function simulate(us: UrlState, meteo: Meteo, zone: Zone) {
  const [slope, ori] = us.ori;

  const mcsGen = zone.data[slope]?.[Math.round(Math.abs(ori) / 5)];

  const radScale = (mcsGen / sum(meteo.rad)) * us.kwp;

  const bwd = unpackBwd(us.bwd!);

  const bwdScale = us.hub / (sum(bwd.flat()) * (365 / 7));

  return simulateYear(
    // TODO: DST?
    chunks(
      meteo.rad.map((x) => x * radScale),
      24,
    ),
    // TODO: DST?
    range(54)
      .map(() => bwd.map((v) => v.map((v) => v * bwdScale)))
      .flat()
      // 1st jan: wednesday
      .slice(3),
    us.bat,
  );
}

function simulateHour(gen: number, use: number, state: HouseState): SimHour {
  const net = gen - use;

  let imp = 0;
  let exp = 0;

  if (net > 0) {
    const maxCharge = maxChargeRate(state);
    const charge = Math.min(net, Math.min(state.cap - state.batt, maxCharge));
    state.batt += charge;
    exp = net - charge;
  } else {
    const maxDischarge = maxDischargeRate(state);
    const discharge = Math.min(-net, Math.min(state.batt, maxDischarge));
    state.batt -= discharge;
    imp = -net - discharge;
  }

  return [state.batt, imp, exp];
}

export function simulateYear(
  solarHour: YearOfKwH,
  usageHour: YearOfKwH,
  cap: number,
) {
  const ret: SimHour[][] = [];

  const state: HouseState = {
    batt: cap / 2,
    cap,
  };

  for (let day = 0; day < 365; day++) {
    const dayRet: SimHour[] = [];
    for (let hour = 0; hour < 24; hour++) {
      const gen = solarHour[day]?.[hour];
      const use = usageHour[day]?.[hour];
      if (!isSetAndFinite(gen) || !isSetAndFinite(use)) {
        throw new Error(
          `Invalid data at day ${day}, hour ${hour}: gen=${gen}, use=${use}`,
        );
      }

      dayRet.push(simulateHour(gen, use, state));
    }
    ret.push(dayRet);
  }

  return ret;
}

function maxChargeRate(state: HouseState): number {
  const perc = state.batt / state.cap;
  // i.e. 3kW in 10-80%, 1kW otherwise for 10kWh
  return (perc < 0.1 || perc > 0.8 ? 0.1 : 0.3) * state.cap;
}

function maxDischargeRate(state: HouseState): number {
  const perc = state.batt / state.cap;
  // i.e. 3kW over 10%, 1kW otherwise for 10kWh
  return (perc < 0.1 ? 0.1 : 0.3) * state.cap;
}
