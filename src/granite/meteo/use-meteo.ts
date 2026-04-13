import type { UrlState } from '../../url-handler.tsx';
import type { Meteo, MeteoTemp, Rads } from './meteo-meta.ts';
import { meteosPromise } from './meteo-database.ts';
import { useMemo, useState } from 'preact/hooks';
import type { Result } from '../../ts.ts';
import { findMeteo } from './meteo-lookup.ts';

export function useMeteo(us: Pick<UrlState, 'loc' | 'ori'>): Meteo | undefined {
  const [loaded, setLoaded] = useState<null | Result<[MeteoTemp[], Rads]>>(
    null,
  );
  meteosPromise.then((vals) => setLoaded(vals));
  if (!loaded || !loaded.success) return undefined;
  const [temps, rads] = loaded.value;
  return useMemo(
    () => findMeteo(temps, rads, us.loc, us.ori),
    [us.loc, us.ori, temps, rads],
  );
}
