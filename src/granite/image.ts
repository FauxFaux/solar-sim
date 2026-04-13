import type { VirtualArray } from './meteo/meteo-meta.ts';
import { sleep } from '../ts.ts';

export async function imageToArray(url: string): Promise<VirtualArray> {
  const img = new Image();
  img.src = url;

  await sleep(15);

  // node-canvas doesn't support decode, or OffscreenCanvas, or..
  await img.decode();

  await sleep(1);

  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d')!;

  await sleep(1);

  ctx.drawImage(img, 0, 0);

  await sleep(1);

  const imageData = ctx.getImageData(0, 0, img.width, img.height).data;

  await sleep(1);

  const BYTES_PER_PIXEL_RGBA = 4;
  return {
    data: (i) => imageData[i * BYTES_PER_PIXEL_RGBA],
    length: imageData.length / BYTES_PER_PIXEL_RGBA,
  };
}
