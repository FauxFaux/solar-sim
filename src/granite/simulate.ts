// 365 days of 24 hours
import { isSetAndFinite } from '../consumption/bill.ts';

export type YearOfKwH = number[][];

type SimHour = [batt: number, imp: number, exp: number];

export function simulate(
  solarHour: YearOfKwH,
  usageHour: YearOfKwH,
  cap: number,
) {
  const ret: SimHour[][] = [];

  let batt = 0;
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

      const net = gen - use;

      let imp = 0;
      let exp = 0;

      batt += net;
      if (batt > cap) {
        exp = batt - cap;
        batt = cap;
      } else if (batt < 0) {
        imp = -batt;
        batt = 0;
      }

      // console.log(hour, gen, use, net, batt, imp, exp);

      dayRet.push([batt, imp, exp]);
    }
    ret.push(dayRet);
  }

  return ret;
}
