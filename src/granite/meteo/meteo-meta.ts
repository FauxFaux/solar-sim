export const METEOS_TOTAL = 25;

export const METEO_HOURS = 24 * 365;

export const METEO_SLOPES = [0, 22.5, 45, 67.5, 90] as const;
export const METEO_ORIS = [-135, -90, -45, 0, 45, 90, 135, 180] as const;

export const TEMP_MIN = -8;
export const TEMP_MAX = 24;

export const RAD_MAX = 1024;

export interface Meteo {
  temp: number[];
  app: number[];
  rad: number[];
}

export interface MeteoTemp {
  temp: number[];
  app: number[];
}

/** mcs, slop, ori, hour of year */
export type Rads = number[][][][];

export interface VirtualArray {
  /** 0-255 */
  data: (i: number) => number;
  length: number;
}
