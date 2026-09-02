/**
 * C2-B START / FINISH from K_session + state.
 * Do not retune slots after the score.
 *   npm run test:v4-c2b
 */
import { kSession32 } from './c2e.ts';
import {
  FINISH_BASE,
  FINISH_SLOTS,
  K_SESSION,
  START_BASE,
  START_SLOTS,
  T_FINISH,
  T_START,
  U_ACK,
  U_FINISH,
  U_PROBE,
  U_START,
  enumerate,
  isFinishC2B,
  isStartC2B,
  steer,
  tState,
} from './c2b.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(K_SESSION === 0xdca0b418, 'same K_session as C2-F');
assert(K_SESSION === kSession32(U_PROBE, U_ACK), 'K_session from the two exact strings');
assert(T_START === tState('START'), 'T_START from K_session + START');
assert(T_FINISH === tState('FINISH'), 'T_FINISH from K_session + FINISH');
assert(T_START === 0x25, 'declared T_START');
assert(T_FINISH === 0x08, 'declared T_FINISH');
assert(T_START !== T_FINISH, 'state names distinct residuals');

const startAll = enumerate(START_SLOTS);
const start = steer(START_SLOTS, T_START);
assert(START_SLOTS.length === 6, 'six declared START slots');
assert(startAll.length === 64, '64 START realizations');
assert(startAll[0] === START_BASE, 'first START realization is the declared base');
assert(start.n === 64 && start.hinted === 64, 'all START keep the hint');
assert(start.hits === 1, 'one START residual hit');
assert(start.hit === U_START, 'declared START hit');
assert(isStartC2B(U_START), 'START hit is START');
assert(!isFinishC2B(U_START), 'START hit is not FINISH');
assert(!U_START.includes('0x') && !/\d{3,}/.test(U_START), 'START has no nonce or target digits');

const finishAll = enumerate(FINISH_SLOTS);
const finish = steer(FINISH_SLOTS, T_FINISH);
assert(FINISH_SLOTS.length === 6, 'six declared FINISH slots');
assert(finishAll.length === 64, '64 FINISH realizations');
assert(finishAll[0] === FINISH_BASE, 'first FINISH realization is the declared base');
assert(finish.n === 64 && finish.hinted === 64, 'all FINISH keep the hint');
assert(finish.hits === 3, 'three FINISH residual hits');
assert(finish.hit === U_FINISH, 'declared first FINISH hit');
assert(isFinishC2B(U_FINISH), 'FINISH hit is FINISH');
assert(!isStartC2B(U_FINISH), 'FINISH hit is not START');
assert(!U_FINISH.includes('0x') && !/\d{3,}/.test(U_FINISH), 'FINISH has no nonce or target digits');

if (failed > 0) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('C2-B START / FINISH ok');
