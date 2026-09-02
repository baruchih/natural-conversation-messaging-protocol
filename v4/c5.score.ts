import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { tokenize } from '../ncmp/reference/ncmp.ts';
import {
  FINISH_BASE,
  FINISH_HINT,
  FINISH_SLOTS,
  START_BASE,
  START_HINT,
  START_SLOTS,
  T_FINISH,
  T_START,
  U_ACK,
  U_PROBE,
  eligibleTokens,
  hasHintWord,
  isFinishC5,
  isStartC5,
  pSec,
  steer,
} from './c5.ts';

const start = steer(
  START_SLOTS,
  isStartC5,
  (u) => START_HINT !== null && hasHintWord(u, START_HINT),
);
const finish = steer(
  FINISH_SLOTS,
  isFinishC5,
  (u) => FINISH_HINT !== null && hasHintWord(u, FINISH_HINT),
);
const morningOnly = steer(START_SLOTS, (u) => tokenize(u).includes('morning') && pSec(u) === T_START, (u) =>
  tokenize(u).includes('morning'),
);

const corpus = readFileSync(resolve(import.meta.dirname, 'c2d.corpus.txt'), 'utf8')
  .split('\n')
  .filter((u) => u.length > 0);
const n = corpus.length;
const bar = 2 ** -16;
const startHinted = START_HINT === null ? [] : corpus.filter((u) => hasHintWord(u, START_HINT));
const finishHinted = FINISH_HINT === null ? [] : corpus.filter((u) => hasHintWord(u, FINISH_HINT));
const startHits = corpus.filter((u) => isStartC5(u));
const finishHits = corpus.filter((u) => isFinishC5(u));

const report = {
  u_probe: U_PROBE,
  u_ack: U_ACK,
  probe_eligible: eligibleTokens(U_PROBE),
  ack_eligible: eligibleTokens(U_ACK),
  start_hint: START_HINT,
  finish_hint: FINISH_HINT,
  t_start: `0x${T_START.toString(16)}`,
  t_finish: `0x${T_FINISH.toString(16)}`,
  start: { base: START_BASE, first: start.first, ...start },
  start_if_morning_were_the_hint: { ...morningOnly },
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
writeFileSync(resolve(import.meta.dirname, 'c5.score.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
