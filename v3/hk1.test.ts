/**
 * V3-HK1: harvested sunset + K4 window compose. One window.
 *   npm run test:v3-hk1
 */
import { decodeE, L0 } from './h1.ts';
import {
  A1,
  ALT_B1,
  LN,
  TARGET,
  WINDOW,
  WINDOW_PROFILE,
  isGetCustomer42,
  singletonFrame,
  windowE,
  windowFrame,
  windowN,
} from './hk1.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

console.log('V3-HK1  H sunset + K window  (one frame, no find-sunset shell)\n');

assert(WINDOW_PROFILE.width === 3 && WINDOW_PROFILE.relation === 'K2', 'K4 clock');
assert(LN.customer.includes('sunset') && LN.customer.includes('that party'), 'Ln has harvested sunset');
assert(A1.toLowerCase().includes('sunset'), 'A1 mentions sunset');
assert(!A1.toLowerCase().includes('find sunset'), 'A1 is not find-sunset');
assert(decodeE(A1, LN) === 'NONE', 'H1 find-slot on A1 is NONE');

const [a1, b1, a2] = WINDOW;
const w = windowFrame(WINDOW, LN);
console.log(`A1  D=${singletonFrame(a1, LN).d} E=${singletonFrame(a1, LN).e} N=${singletonFrame(a1, LN).n}`);
console.log(`    ${a1}`);
console.log(`B1  D=${singletonFrame(b1, LN).d} E=${singletonFrame(b1, LN).e} N=${singletonFrame(b1, LN).n}`);
console.log(`    ${b1}`);
console.log(`A2  D=${singletonFrame(a2, LN).d} E=${singletonFrame(a2, LN).e} N=${singletonFrame(a2, LN).n}`);
console.log(`    ${a2}`);
console.log(`W   D=${w.d} E=${w.e} N=${w.n}`);

assert(!isGetCustomer42(singletonFrame(a1, LN)), 'A1 is not GET CUSTOMER 42');
assert(!isGetCustomer42(singletonFrame(b1, LN)), 'B1 is not GET CUSTOMER 42');
assert(!isGetCustomer42(singletonFrame(a2, LN)), 'A2 is not GET CUSTOMER 42');
assert(isGetCustomer42(w), 'window is GET CUSTOMER 42');
assert(windowE(WINDOW, L0) === 'NONE', 'same window under L0 is not CUSTOMER');
assert(windowN(a1, ALT_B1, a2) !== TARGET, 'alter B1 and N is not 42');
assert(!a2.toLowerCase().includes('find sunset'), 'A2 is not the W3 shell');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-HK1: H needed for E, K needed for N, window needed for the frame');
