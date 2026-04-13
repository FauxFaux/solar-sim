import tempsAvif from '../../assets/temps.avif';
import radsAvif from '../../assets/rads.avif';
import { imageToArray } from '../image.ts';
import { loadTempsFromArr } from './temps-from-img.ts';
import { loadRadsFromArr } from './rads-from-img.ts';
import { tryTo } from '../../ts.ts';

export const meteosPromise = tryTo(async () =>
  Promise.all([
    imageToArray(tempsAvif).then(loadTempsFromArr),
    imageToArray(radsAvif).then(loadRadsFromArr),
  ]),
);
