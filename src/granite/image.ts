export async function imageToArray(url: string) {
  const img = new Image();
  img.src = url;
  await img.decode();

  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  return ctx.getImageData(0, 0, img.width, img.height).data;
}
