import { VscFlame } from 'react-icons/vsc';
import type { UrlState } from '../url-handler.tsx';
import { type State, twoDp } from '../ts.ts';
import { TbAirConditioning } from 'react-icons/tb';
import { LuHeater } from 'react-icons/lu';
import biMap from '../assets/bi-map.svg';
import { PiSolarRoof } from 'react-icons/pi';
import { findZone } from './mcs.ts';
import { OrientationInfo } from './orientation-info.tsx';

export function HeatingUsage({ uss: [us, setUs] }: { uss: State<UrlState> }) {
  const gasUsage = 4.11 * us.hub + 210;
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

  const zone = findZone(us.loc);

  return (
    <div>
      <h3>Heating</h3>
      <form class={'heating-usage'}>
        <label>
          <VscFlame /> gas
        </label>
        <label>
          <TbAirConditioning /> heat pump
        </label>
        <label>
          <LuHeater /> electric
        </label>
      </form>
      <p>
        <input
          type={'number'}
          min={0}
          step={100}
          style={'width: 10ch'}
          value={Math.round(gasUsage / 100) * 100}
        />{' '}
        kWh/yr gas usage
      </p>
      <p>
        <input
          type={'number'}
          min={0}
          step={0.1}
          style={'width: 10ch'}
          value={(gasUsage / 2185).toFixed(1)}
        />{' '}
        kW design heat loss
      </p>
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
      <p>
        {lat.toFixed(2)}°N, {lon.toFixed(2)}°E
        <br />
        zone: {zone.name}
      </p>
      <OrientationInfo mcs={zone.data} />
    </div>
  );
}
