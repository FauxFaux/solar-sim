import tempsAvif from '../../assets/temps.avif';
import { imageToArray } from '../image.ts';
import { loadTempsFromArr } from './temps-from-img.ts';

export async function loadTemps() {
  const img = await imageToArray(tempsAvif);
  return loadTempsFromArr((i) => img[i * 3], img.length / 3);
}
