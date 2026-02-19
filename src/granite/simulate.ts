// 365 days of 24 hours
import { isSetAndFinite } from '../consumption/bill.ts';

export type YearOfKwH = number[][];

type SimHour = [batt: number, imp: number, exp: number];

interface HouseState {
  cap: number;
  batt: number;
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
    batt: 2,
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
