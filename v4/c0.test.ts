/**
 * C0 witness. Architectural, not process.
 *   npm run test:v4-c0
 */
import {
  FRAME_ACTIVE_REMAINING,
  U_FLIP_TO_EXCEPTIONAL,
  U_FLIP_TO_ORDINARY,
  c6,
  p,
  t,
  x,
} from './c0.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(t('INACTIVE') === 0, 'INACTIVE target is 0');
assert(
  t('FRAME_ACTIVE') === (FRAME_ACTIVE_REMAINING.header + FRAME_ACTIVE_REMAINING.argument) % 64,
  'FRAME_ACTIVE target is remaining sum',
);
assert(t('FRAME_ACTIVE') === 10, 'exhibited FRAME_ACTIVE T = 10');

assert(c6(U_FLIP_TO_EXCEPTIONAL) === 54, 'Let me know. C6 = 54');
assert(p(U_FLIP_TO_EXCEPTIONAL) === 10, 'Let me know. P = 10');
assert(x('INACTIVE', U_FLIP_TO_EXCEPTIONAL) === 'ORDINARY', 'same U ordinary when INACTIVE');
assert(
  x('FRAME_ACTIVE', U_FLIP_TO_EXCEPTIONAL) === 'EXCEPTIONAL',
  'same U exceptional when FRAME_ACTIVE',
);

assert(c6(U_FLIP_TO_ORDINARY) === 27, 'Saturday C6 = 27');
assert(p(U_FLIP_TO_ORDINARY) === 0, 'Saturday P = 0');
assert(x('INACTIVE', U_FLIP_TO_ORDINARY) === 'EXCEPTIONAL', 'same U exceptional when INACTIVE');
assert(x('FRAME_ACTIVE', U_FLIP_TO_ORDINARY) === 'ORDINARY', 'same U ordinary when FRAME_ACTIVE');

assert(
  x('INACTIVE', U_FLIP_TO_EXCEPTIONAL) === x('INACTIVE', U_FLIP_TO_EXCEPTIONAL),
  'deterministic',
);
assert(p(U_FLIP_TO_EXCEPTIONAL) !== c6(U_FLIP_TO_EXCEPTIONAL), 'P is not C6 on the killer U');
assert(
  x('FRAME_ACTIVE', U_FLIP_TO_EXCEPTIONAL) === 'EXCEPTIONAL' &&
    c6(U_FLIP_TO_EXCEPTIONAL) !== t('FRAME_ACTIVE'),
  'EXCEPTIONAL is not C6(U) = T',
);

function cover(avoid: number): number {
  const hit = Array<boolean>(64).fill(false);
  const base = 'Keep it simple and we can leave after breakfast tomorrow morning';
  for (let i = 0; i < 26; i++) {
    for (let j = 0; j < 26; j++) {
      const u = `${base} ${String.fromCharCode(97 + i)}${String.fromCharCode(97 + j)}.`;
      if (p(u) !== avoid) hit[c6(u)] = true;
    }
  }
  for (let n = 0; n < 8000; n++) {
    let u = 'The ';
    let seed = n;
    const len = 3 + (n % 12);
    for (let k = 0; k < len; k++) {
      u += String.fromCharCode(97 + ((seed + k * 7) % 26));
      seed = (Math.imul(seed, 31) + 17) >>> 0;
    }
    if (p(u) !== avoid) hit[c6(u)] = true;
  }
  return hit.filter(Boolean).length;
}

assert(cover(t('INACTIVE')) === 64, 'every C6 attainable on INACTIVE ordinary path');
assert(cover(t('FRAME_ACTIVE')) === 64, 'every C6 attainable on FRAME_ACTIVE ordinary path');

if (failed > 0) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('C0 witness ok');
