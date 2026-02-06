import type { UrlState } from '../url-handler.tsx';
import { type State, twoDp } from '../ts.ts';
import biMap from '../assets/bi-map.svg';
import { PiSolarRoof } from 'react-icons/pi';
import { findZone } from './mcs.ts';
import { OrientationInfo } from './orientation-info.tsx';

export function LocationPicker({ uss: [us, setUs] }: { uss: State<UrlState> }) {
  const vstart = 49.95;
  const vrange = 58.6 - vstart;
  const hstart = -10.4;
  const hrange = 1.7 - hstart;

  const encode = (y: number, x: number): [number, number] => {
    const lat = vstart + (1 - y / 424) * vrange;
    const lon = hstart + (x / 350) * hrange;
    return [lat, lon];
  };

  const setFromEvent = (x: number, y: number) => {
    const [lat, lon] = encode(y, x);
    setUs((us) => ({ ...us, loc: [twoDp(lat), twoDp(lon)] }));
  };

  const [lat, lon] = us.loc;
  const point = [
    ((lon - hstart) / hrange) * 350,
    (1 - (lat - vstart) / vrange) * 424,
  ];

  return (
    <div>
      <h3>Location</h3>
      <svg
        width={350}
        height={424}
        onClick={(e) => {
          setFromEvent(e.offsetX, e.offsetY);
          e.preventDefault();
        }}
        onMouseMove={(e) => {
          if (e.buttons !== 1) return;
          setFromEvent(e.offsetX, e.offsetY);
          e.preventDefault();
        }}
      >
        <image href={biMap} width={350} height={424} />
        <PiSolarRoof x={point[0] - 9} y={point[1] - 9} fill={'#6464f4'} />
      </svg>
    </div>
  );
}
