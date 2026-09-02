import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BOOTSTRAP_HINT, CONTROL_SEED, SECONDARY_WIDTH, hasHint, isProbeC2D, tSec } from './c2d.ts';

const corpus = readFileSync(resolve(import.meta.dirname, 'c2d.corpus.txt'), 'utf8')
  .split('\n')
  .filter((u) => u.length > 0);
const n = corpus.length;
const hinted = corpus.filter((u) => hasHint(u));
const probes = corpus.filter((u) => isProbeC2D(u));
const q = hinted.length / n;
const accidental = probes.length / n;
const bar = 2 ** -16;
const report = {
  hint: BOOTSTRAP_HINT,
  width: SECONDARY_WIDTH,
  seed: `0x${CONTROL_SEED.toString(16)}`,
  t_sec: `0x${tSec().toString(16)}`,
  n,
  hinted: hinted.length,
  q,
  probes: probes.length,
  accidental,
  bar,
  q_for_bar: 2 ** -10,
  meets_bar: accidental <= bar,
  hinted_examples: hinted.slice(0, 8),
};
writeFileSync(resolve(import.meta.dirname, 'c2d.score.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
