/**
 * C1 first construction. Not process.
 *   npm run test:v4-c1
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  CONTROL_SEED,
  WIDTH,
  isProbe,
  kSession,
  p,
  tAck,
  tProbe,
} from './c1.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

export const U_PROBE = 'Let me know. 11941749.';

assert(CONTROL_SEED === 0x9ca2c1c1, 'seed frozen before corpus');
assert(WIDTH === 24, '24-bit namespace');
assert(tProbe() === 0xa2c1c1, 'T_probe is low 24 of seed');
assert(p(U_PROBE) === tProbe(), 'deliberate U_probe hits T_probe');
assert(isProbe(U_PROBE), 'U_probe is PROBE');
assert(!isProbe(U_PROBE, CONTROL_SEED ^ 1), 'same U, different seed, not PROBE');
assert(!isProbe('Shall we compare notes on the usual matter?'), 'lexical example is not C1 PROBE');
assert(!isProbe('Let me know.'), 'base sentence is not PROBE');

const ack = tAck(U_PROBE);
assert(ack === 0x78db4f, 'T_ack from seed + U_probe');
assert(tAck(U_PROBE) === ack, 'T_ack deterministic');
assert(tAck('Let me know.') !== ack, 'different U_probe, different T_ack');
assert(kSession(U_PROBE, 'Fine by me.') === 0xa7b6c4, 'K_session defined, not scored');

const corpus = readFileSync(resolve(import.meta.dirname, 'c1.corpus.txt'), 'utf8')
  .split('\n')
  .filter((u) => u.length > 0);
assert(corpus.length === 5289, `frozen corpus N=${corpus.length}`);
const hits = corpus.filter((u) => isProbe(u));
assert(hits.length === 0, `accidental hits ${hits.length}`);

if (failed > 0) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('C1 first construction ok');
