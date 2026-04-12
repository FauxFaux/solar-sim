import tempsAvif from '../../assets/temps.avif';
import radsAvif from '../../assets/rads.avif';
import { imageToArray } from '../image.ts';
import { loadTempsFromArr } from './temps-from-img.ts';
import { loadRadsFromArr } from './rads-from-img.ts';

export const temps = await loadTempsFromArr(await imageToArray(tempsAvif));
export const rads = await loadRadsFromArr(await imageToArray(radsAvif));
