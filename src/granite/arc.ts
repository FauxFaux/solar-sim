// fork of https://github.com/svgcamp/svg-arc/blob/d2729c986f77888855f7300c46ee0dc1a9f2bbd7/index.js (MIT)

const point = (x: number, y: number, r: number, angle: number) => [
  (x + Math.sin(angle) * r).toFixed(2),
  (y - Math.cos(angle) * r).toFixed(2),
];

const full = (x: number, y: number, R: number, r: number) => {
  if (r <= 0) {
    return `M ${x - R} ${y} A ${R} ${R} 0 1 1 ${x + R} ${y} A ${R} ${R} 1 1 1 ${x - R} ${y} Z`;
  }
  return `M ${x - R} ${y} A ${R} ${R} 0 1 1 ${x + R} ${y} A ${R} ${R} 1 1 1 ${x - R} ${y} M ${x - r} ${y} A ${r} ${r} 0 1 1 ${x + r} ${y} A ${r} ${r} 1 1 1 ${x - r} ${y} Z`;
};

const part = (
  x: number,
  y: number,
  R: number,
  r: number,
  start: number,
  end: number,
) => {
  const s = (start / 360) * 2 * Math.PI;
  const e = (end / 360) * 2 * Math.PI;
  const P = [
    point(x, y, r, s),
    point(x, y, R, s),
    point(x, y, R, e),
    point(x, y, r, e),
  ];
  const flag = e - s > Math.PI ? '1' : '0';
  return `M ${P[0][0]} ${P[0][1]} L ${P[1][0]} ${P[1][1]} A ${R} ${R} 0 ${flag} 1 ${P[2][0]} ${P[2][1]} L ${P[3][0]} ${P[3][1]} A ${r} ${r}  0 ${flag} 0 ${P[0][0]} ${P[0][1]} Z`;
};

export const arc = (opts: {
  x: number;
  y: number;
  r: number;
  R?: number;
  start?: number;
  end?: number;
}) => {
  const { x, y } = opts;
  let { R = 0, r, start, end } = opts;

  R = Math.max(R, r);
  r = Math.min(R, r);
  if (R <= 0) return '';
  if (start === undefined || end === undefined) return full(x, y, R, r);
  if (Math.abs(start - end) < 0.000001) return '';
  if (Math.abs(start - end) % 360 < 0.000001) return full(x, y, R, r);

  start = start % 360;
  end = end % 360;

  if (start > end) end += 360;
  return part(x, y, R, r, start, end);
};
