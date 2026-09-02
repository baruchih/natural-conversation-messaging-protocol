/**
 * C2-E frozen scores. Do not regenerate.
 *   npm run test:v4-c2e
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isProbeC2D } from './c2d.ts';
import { U_PROBE, tAck6 } from './c2e.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const corpus = JSON.parse(readFileSync(resolve(import.meta.dirname, 'c2e.score.json'), 'utf8')) as {
  probe_ok: boolean;
  t_ack: string;
  accidental_ack: number;
  meets_bar: boolean;
};
const run = JSON.parse(readFileSync(resolve(import.meta.dirname, 'c2e.frozen.json'), 'utf8')) as {
  hits: number;
  hit: string | null;
  same_session: boolean;
  legal: number;
};

assert(isProbeC2D(U_PROBE), 'frozen U_probe is still PROBE');
assert(tAck6() === 0x0f, 'T_ack derived');
assert(corpus.t_ack === '0xf', 'score T_ack');
assert(corpus.probe_ok, 'score saw the probe');
assert(corpus.accidental_ack === 1, 'one accidental ACK on held-out');
assert(corpus.meets_bar, 'accidental ACK ≤ 2^-16');
assert(run.legal >= 1, 'encoder used the hint');
assert(run.hits === 0 && run.hit === null, 'no ACK hit');
assert(run.same_session === false, 'no session without U_ack');

if (failed > 0) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('C2-E frozen not YES ok');
