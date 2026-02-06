import { useEffect, useState } from 'preact/hooks';
import { debounce } from './ts.ts';
import { deflateSync, inflateSync, strFromU8, strToU8 } from 'fflate';
import { App } from './app.tsx';
import { CrashHandler } from './crash-handler.tsx';

export interface UrlState {
  v: 1;
  huc: '1' | '2' | '4' | 'c';
  hub: number;
  hht: 'g' | 'e' | 'p';
  loc: [lat: number, lon: number];
  ori: [slope: number, ori: number];
  kwp: number;
}

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
          loc: [52.3, -1.4],
          ori: [40, 25],
          kwp: 4.4,
        },
  );

  useEffect(() => {
    window.onhashchange = () => setUs(unpackUs(window.location.hash));
  }, []);

  useEffect(() => setHash(us), [us]);

  return (
    <CrashHandler>
      <App uss={[us, setUs]} />
    </CrashHandler>
  );
}

function packUs(us: UrlState) {
  const data = deflateSync(strToU8(JSON.stringify(us)));
  return data.toBase64({ alphabet: 'base64url' });
}

function unpackUs(hash: string): UrlState {
  const data = Uint8Array.fromBase64(hash.slice(1), { alphabet: 'base64url' });
  const str = strFromU8(inflateSync(data));
  return JSON.parse(str);
}
