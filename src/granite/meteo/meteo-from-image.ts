import avifUrl from './assets/meteo-q40.avif';
import { imageToArray } from '../image.ts';

export async function loadMeteosImg() {
  const rgb = await imageToArray(avifUrl);
  throw new Error('Not implemented' + rgb.length);
}
