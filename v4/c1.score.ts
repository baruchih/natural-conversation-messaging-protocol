/**
 * Score frozen C1 corpus. Do not change CONTROL_SEED after this run.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { CONTROL_SEED, isProbe, kSession, p, tAck, tProbe } from './c1.ts';

const corpusPath = resolve(import.meta.dirname, 'c1.corpus.txt');
const corpus = readFileSync(corpusPath, 'utf8').split('\n').filter((u) => u.length > 0);

const target = tProbe();
const hits: string[] = [];
for (const u of corpus) {
  if (isProbe(u)) hits.push(u);
}

let uProbe = '';
const base = 'Let me know.';
for (let i = 0; i < 0x100000000; i++) {
  const u = `${base} ${i}.`;
  if (p(u) === target) {
    uProbe = u;
    break;
  }
  if (i > 0 && i % 5_000_000 === 0) console.log(`search ${i}`);
}

const ack = tAck(uProbe);
const ack2 = tAck(uProbe);
const session = kSession(uProbe, 'Fine by me.');

const report = {
  seed: `0x${CONTROL_SEED.toString(16)}`,
    width: 24,
  t_probe: `0x${target.toString(16)}`,
  corpus_n: corpus.length,
  accidental_hits: hits.length,
  hits,
  u_probe: uProbe,
  p_u_probe: uProbe ? `0x${p(uProbe).toString(16)}` : null,
  t_ack: `0x${ack.toString(16)}`,
  t_ack_repeat: `0x${ack2.toString(16)}`,
  t_ack_deterministic: ack === ack2,
  k_session_example: `0x${session.toString(16)}`,
};

writeFileSync(resolve(import.meta.dirname, 'c1.score.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
