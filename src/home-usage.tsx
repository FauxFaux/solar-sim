import type { UrlState } from './url-handler.tsx';
import { type State } from './ts.ts';
import { BasicUsage } from './usage/basic.tsx';

export function HomeUsage({ uss }: { uss: State<UrlState> }) {
  return (
    <div>
      <BasicUsage uss={uss} />
    </div>
  );
}
