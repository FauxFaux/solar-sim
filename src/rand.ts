// Based on https://github.com/bryc/code/blob/master/jshash/PRNGs.md#xoshiro
// mostly care about seedability, not incredible quality randomness
// returns 0-2^32-1
export function seedyRng(seed: number) {
  let a = 0xbaadf00d;
  let b = (seed * 0xdeadbeef) ^ 0xddba11;
  let c = 0x5ca1ab1e;
  let d = 0xcafebabe;

  return function () {
    const t = b << 9;
    c = c ^ a;
    d = d ^ b;
    b = b ^ c;
    a = a ^ d;
    c = c ^ t;
    d = (d << 11) | (d >>> 21);

    const b5 = b * 5;
    const r = ((b5 << 7) | (b5 >>> 25)) * 9;
    return r >>> 0;
  };
}
