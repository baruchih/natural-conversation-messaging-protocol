import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { isProbeC2D } from './c2d.ts';
import { CONTROL_SEED, U_PROBE, hasHint, isAckC2E, kSession32, tAck6 } from './c2e.ts';

const corpus = readFileSync(resolve(import.meta.dirname, 'c2d.corpus.txt'), 'utf8')
  .split('\n')
  .filter((u) => u.length > 0);
const acks = corpus.filter((u) => isAckC2E(u));
const report = {
  u_probe: U_PROBE,
  probe_ok: isProbeC2D(U_PROBE),
  seed: `0x${CONTROL_SEED.toString(16)}`,
  t_ack: `0x${tAck6().toString(16)}`,
  n: corpus.length,
  hinted: corpus.filter((u) => hasHint(u)).length,
  accidental_ack: acks.length,
  accidental_rate: acks.length / corpus.length,
  bar: 2 ** -16,
  meets_bar: acks.length / corpus.length <= 2 ** -16,
  k_session_self: `0x${kSession32(U_PROBE, U_PROBE).toString(16)}`,
};
writeFileSync(resolve(import.meta.dirname, 'c2e.score.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
