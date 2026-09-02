import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  FINISH_BASE,
  FINISH_HINT,
  FINISH_SLOTS,
  START_BASE,
  START_HINT,
  START_SLOTS,
  U_ACK,
  U_PROBE,
  eligibleWords,
  hasWord,
  isFinishC5E,
  isStartC5E,
  steer,
} from './c5e.ts';

const start = steer(START_SLOTS, isStartC5E, (u) => START_HINT !== null && hasWord(u, START_HINT));
const finish = steer(FINISH_SLOTS, isFinishC5E, (u) => FINISH_HINT !== null && hasWord(u, FINISH_HINT));

const corpus = readFileSync(resolve(import.meta.dirname, 'c2d.corpus.txt'), 'utf8')
  .split('\n')
  .filter((u) => u.length > 0);
const n = corpus.length;
const bar = 2 ** -16;
const startHinted = START_HINT === null ? [] : corpus.filter((u) => hasWord(u, START_HINT));
const finishHinted = FINISH_HINT === null ? [] : corpus.filter((u) => hasWord(u, FINISH_HINT));
const startHits = corpus.filter((u) => isStartC5E(u));
const finishHits = corpus.filter((u) => isFinishC5E(u));

const report = {
  u_probe: U_PROBE,
  u_ack: U_ACK,
  probe_eligible: eligibleWords(U_PROBE),
  ack_eligible: eligibleWords(U_ACK),
  start_hint: START_HINT,
  finish_hint: FINISH_HINT,
  start: { base: START_BASE, first: start.first, ...start },
  finish: { base: FINISH_BASE, first: finish.first, ...finish },
  corpus: {
    n,
    bar,
    start_hinted: startHinted.length,
    finish_hinted: finishHinted.length,
    start_hits: startHits.length,
    start_rate: startHits.length / n,
    finish_hits: finishHits.length,
    finish_rate: finishHits.length / n,
    start_meets_bar: startHits.length / n <= bar,
    finish_meets_bar: finishHits.length / n <= bar,
  },
};
writeFileSync(resolve(import.meta.dirname, 'c5e.score.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
