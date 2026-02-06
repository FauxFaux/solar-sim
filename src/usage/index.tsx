import type { UrlState } from '../url-handler.tsx';
import { type State } from '../ts.ts';
import { BasicUsage } from './basic.tsx';
import { HeatingUsage } from './heating.tsx';

export function HomeUsage({ uss }: { uss: State<UrlState> }) {
  return (
    <>
      <BasicUsage uss={uss} />
      {false && <HeatingUsage uss={uss} />}
    </>
  );
}
