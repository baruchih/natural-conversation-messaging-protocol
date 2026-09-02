import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  FINISH_BASE,
  FINISH_PAIR,
  FINISH_SLOTS,
  START_BASE,
  START_PAIR,
  START_SLOTS,
  U_ACK,
  U_PROBE,
  eligiblePairs,
  eligibleWords,
  hasOrderedPair,
  isFinishC5P,
  isStartC5P,
  steer,
} from './c5p.ts';

const start = steer(START_SLOTS, isStartC5P, (u) => hasOrderedPair(u, START_PAIR));
const finish = steer(FINISH_SLOTS, isFinishC5P, (u) => hasOrderedPair(u, FINISH_PAIR));

const corpus = readFileSync(resolve(import.meta.dirname, 'c2d.corpus.txt'), 'utf8')
  .split('\n')
  .filter((u) => u.length > 0);
const n = corpus.length;
const bar = 2 ** -16;
const startHinted = corpus.filter((u) => hasOrderedPair(u, START_PAIR));
const finishHinted = corpus.filter((u) => hasOrderedPair(u, FINISH_PAIR));
const startHits = corpus.filter((u) => isStartC5P(u));
const finishHits = corpus.filter((u) => isFinishC5P(u));

const report = {
  u_probe: U_PROBE,
  u_ack: U_ACK,
  probe_eligible: eligibleWords(U_PROBE),
  ack_eligible: eligibleWords(U_ACK),
  probe_pairs: eligiblePairs(U_PROBE),
  ack_pairs: eligiblePairs(U_ACK),
  start_pair: START_PAIR,
  finish_pair: FINISH_PAIR,
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
writeFileSync(resolve(import.meta.dirname, 'c5p.score.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
