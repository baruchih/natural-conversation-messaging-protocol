/**
 * C2-F first steerer. Do not retune slots after the score.
 *   npm run test:v4-c2f
 */
import { isAckC2E, kSession32 } from './c2e.ts';
import { BASE, SLOTS, U_PROBE, enumerate, steer, tAck6 } from './c2f.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const all = enumerate();
const r = steer();
assert(SLOTS.length === 6, 'six declared slots');
assert(all.length === 64, '64 realizations');
assert(all[0] === BASE, 'first realization is the declared base');
assert(tAck6() === 0x0f, 'same derived T_ack');
assert(r.n === 64 && r.hinted === 64, 'all keep the hint');
assert(r.hits === 1, 'one residual hit');
assert(r.hit === "Sounds good. I'll bring my umbrella too, just in case.", 'declared hit');
assert(isAckC2E(r.hit!), 'hit is ACK');
assert(r.k_session === `0x${kSession32(U_PROBE, r.hit!).toString(16)}`, 'both peers, same K_session');
assert(!r.hit!.includes('0x') && !/\d{3,}/.test(r.hit!), 'no nonce or target digits');

if (failed > 0) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('C2-F first steerer ok');
