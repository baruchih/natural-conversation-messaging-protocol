/**
 * C3 START length. Do not retune slots after the score.
 *   npm run test:v4-c3
 */
import { U_START } from './c2b.ts';
import {
  C3_BASE,
  C3_SLOTS,
  K_SESSION,
  T_START,
  U_START_TINY,
  argLen,
  enumerate,
  isStartC3,
  startLength,
  steer,
} from './c3.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const reserved = /empty|short|tiny|brief|wide|begin|round|now|close|here/;
const all = enumerate();
const tiny = steer(8);
const brief = steer(24);

assert(C3_SLOTS.length === 9, 'nine declared slots');
assert(all.length === 512, '512 realizations');
assert(all[0] === C3_BASE, 'first realization is the declared base');
assert(K_SESSION === 0xdca0b418, 'same K_session');
assert(T_START === 0x25, 'same T_START');
assert(tiny.n === 512 && tiny.hinted === 512, 'all keep the hint');
assert(tiny.starts === 8, 'eight START hits');
assert(tiny.hits === 4, 'four tiny START hits');
assert(tiny.hit === U_START_TINY, 'declared tiny hit');
assert(isStartC3(U_START_TINY), 'tiny hit is START');
assert(argLen(U_START_TINY) === 8, 'tiny hit declares 8');
assert(startLength(U_START_TINY) === 8, 'START length is 8');
assert(!reserved.test(U_START_TINY.toLowerCase()), 'tiny hit has no reserved length or control words');
assert(!U_START_TINY.includes('0x') && !/\d{3,}/.test(U_START_TINY), 'no nonce or target digits');

assert(brief.hits === 0, 'brief miss is frozen');
assert(tiny.by_length.empty === 2, 'empty covered');
assert(tiny.by_length.short === 0, 'short miss is frozen');
assert(tiny.by_length.tiny === 4, 'tiny covered');
assert(tiny.by_length.brief === 0, 'brief miss is frozen');
assert(tiny.by_length.wide === 2, 'wide covered');
assert(tiny.unique_len === 3, 'three distinct START lengths');

assert(isStartC3(U_START), 'C2-B START remains START');
assert(startLength(U_START) === 5, 'prior START maps to short under LEN');
assert(startLength(C3_BASE) === null, 'base is not START, so length is not declared');
assert(argLen(C3_BASE) !== startLength(C3_BASE), 'LEN exists on ordinary U; START does not read it');

if (failed > 0) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('C3 START length ok');
