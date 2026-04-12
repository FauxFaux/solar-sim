export const METEOS_TOTAL = 25;

export const METEO_HOURS = 24 * 365;

export const METEO_SLOPES = [30, 60] as const;
export const METEO_ORIS = [-135, -90, -45, 0, 45, 90, 135] as const;

export const TEMP_MIN = -8;
export const TEMP_MAX = 24;

export interface MeteoTemp {
  temp: number[];
  app: number[];
}
