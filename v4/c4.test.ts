/**
 * C4 session hint. Do not retune the word list or slots after the score.
 *   npm run test:v4-c4
 */
import {
  FINISH_BASE,
  FINISH_SLOTS,
  K_SESSION,
  SESSION_HINT,
  SESSION_WORDS,
  START_BASE,
  START_SLOTS,
  T_FINISH,
  T_START,
  U_FINISH_C,
  U_START_C,
  enumerate,
  isFinishC,
  isStartA,
  isStartB,
  isStartC,
  sessionHint,
  steer,
} from './c4.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(SESSION_WORDS.length === 32, 'declared 32-word list');
assert(!SESSION_WORDS.includes('umbrella' as never), 'list is not the bootstrap hint');
assert(SESSION_HINT === 'bench', 'derived hint frozen');
assert(sessionHint(K_SESSION) === 'bench', 'hint from K_session only');
assert(T_START === 0x25 && T_FINISH === 0x08, 'same session residuals as C2-B');

const startAll = enumerate(START_SLOTS);
const start = steer(START_SLOTS, isStartC);
assert(startAll[0] === START_BASE, 'first START is the declared base');
assert(start.n === 64 && start.hinted === 64, 'all START keep the session hint');
assert(start.hits === 1, 'one START residual hit');
assert(start.hit === U_START_C, 'declared START hit');
assert(isStartC(U_START_C), 'hit is session START');
assert(!isStartA(U_START_C), 'session START does not use umbrella');
assert(!U_START_C.toLowerCase().includes('umbrella'), 'no bootstrap word');

const finishAll = enumerate(FINISH_SLOTS);
const finish = steer(FINISH_SLOTS, isFinishC);
assert(finishAll[0] === FINISH_BASE, 'first FINISH is the declared base');
assert(finish.n === 64 && finish.hinted === 64, 'all FINISH keep the session hint');
assert(finish.hits === 3, 'three FINISH residual hits');
assert(finish.hit === U_FINISH_C, 'declared FINISH hit');
assert(isFinishC(U_FINISH_C), 'hit is session FINISH');
assert(!U_FINISH_C.toLowerCase().includes('umbrella'), 'no bootstrap word');

assert(isStartB(U_START_C), 'no-hint arm would also accept the START hit');
assert(!isStartC("Let's head out Saturday morning and meet at the park."), 'wrong hint is not START');

if (failed > 0) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('C4 session hint ok');
