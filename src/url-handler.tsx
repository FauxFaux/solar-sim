import { useEffect, useState } from 'preact/hooks';
import { debounce } from './ts.ts';
import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate';
import { App } from './app.tsx';
import { CrashHandler } from './crash-handler.tsx';
import type { MaybeNumber } from './consumption/bill.ts';

export interface UrlState {
  v: 1;

  // home usage class
  huc: '1' | '2' | '4' | 'c';
  // home usage basic
  hub: number;

  // home heating type
  hht: 'g' | 'e' | 'p';
  // home estimate by gas
  heg: MaybeNumber;
  // home estimate by epc
  hee: number;
  // home estimate by floor area
  hef: MaybeNumber;

  // house location
  loc: [lat: number, lon: number];

  // installation details
  ori: [slope: number, ori: number];
  kwp: number;
  bat: number;

  // extracted data from bills, whole week(s?), packed
  bwd?: number[];
}

// exampleBill, run through the pack code in bill.ts
const defaultBwd = [
  24, 1, -1, 0, 0, 0, -1, -6, 14, 9, 21, -18, 54, -42, -11, -6, -2, 43, 144,
  -156, 79, -59, -28, -32, -2, 1, -1, 3, 0, -1, -1, 7, -12, 21, -23, 0, 3, -2,
  0, 0, 61, 62, -60, 8, -20, -9, -3, -8, -20, -4, -2, 0, 0, 0, 0, -5, -1, 16, 0,
  1, 0, -1, 8, -6, 0, 17, 8, 30, -18, 58, -94, -12, 0, -2, 4, 2, -3, 0, -2, -4,
  4, -9, 0, 1, 1, 1, -1, 0, 1, 35, 9, 4, -10, -3, -13, -13, -3, -1, 0, 5, -2,
  -1, -2, 4, 3, 5, 4, -1, -2, 52, 27, -60, 6, 62, -6, -30, 111, -107, -21, -31,
  -12, -1, 2, 1, -1, 1, -2, -4, 7, 27, 48, -77, 49, 6, -45, -6, -8, 36, 42, 68,
  -102, -2, 13, -50, -1, -2, 2, 0, 0, -2, -2, -1, -1, -4, 1, 42, 47, -57, 51,
  -58, -5, 4, 94, -19, -54, -14, -12, -12,
];

const setHash = debounce((v: UrlState) => {
  window.location.hash = packUs(v);
}, 50);

export function UrlHandler() {
  const [us, setUs] = useState<UrlState>(
    window.location.hash.length > 5
      ? unpackUs(window.location.hash)
      : {
          v: 1,
          huc: '2',
          hub: 2700,
          hht: 'p',
          heg: null,
          hee: 68,
          hef: null,
          loc: [52.3, -1.4],
          ori: [40, 25],
          kwp: 4.4,
          bat: 2.3,
          bwd: defaultBwd,
        },
  );

  useEffect(() => {
    window.onhashchange = () => setUs(unpackUs(window.location.hash));
  }, []);

  useEffect(() => setHash(us), [us]);

  return (
    <CrashHandler us={us}>
      <App uss={[us, setUs]} />
    </CrashHandler>
  );
}

// duplicated for stability reasons
const urlDictionary = strToU8(
  JSON.stringify(defaultBwd) +
    JSON.stringify(
      shallowSortKeys({
        v: 1,
        huc: '2',
        hub: 2700,
        hht: 'p',
        heg: null,
        hee: 68,
        hef: null,
        loc: [52.3, -1.4],
        ori: [40, 25],
        kwp: 4.4,
        bat: 2.3,
        bwd: [],
      }),
    ),
);

function packUs(us: UrlState) {
  const json = JSON.stringify(shallowSortKeys(us));
  const data = deflateSync(strToU8(json), {
    level: 9,
    dictionary: urlDictionary,
  });
  // @ts-expect-error (toBase64 is missing from Uint8Array typings)
  return data.toBase64({ alphabet: 'base64url' });
}

function unpackUs(hash: string): UrlState {
  // @ts-expect-error (fromBase64 is missing from Uint8Array typings)
  const data = Uint8Array.fromBase64(hash.slice(1), { alphabet: 'base64url' });
  const str = strFromU8(inflateSync(data, { dictionary: urlDictionary }));
  return JSON.parse(str);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function shallowSortKeys<T extends Record<string, any>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).sort(([ka], [kb]) => ka.localeCompare(kb)),
  ) as T;
}
