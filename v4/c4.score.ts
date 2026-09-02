import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { tokenize } from '../ncmp/reference/ncmp.ts';
import {
  BOOTSTRAP_HINT,
  FINISH_BASE,
  FINISH_SLOTS,
  K_SESSION,
  SESSION_HINT,
  START_BASE,
  START_SLOTS,
  T_FINISH,
  T_START,
  isFinishC,
  isStartB,
  isStartC,
  pSec,
  steer,
} from './c4.ts';

const start = steer(START_SLOTS, isStartC);
const finish = steer(FINISH_SLOTS, isFinishC);

const corpus = readFileSync(resolve(import.meta.dirname, 'c2d.corpus.txt'), 'utf8')
  .split('\n')
  .filter((u) => u.length > 0);
const n = corpus.length;
const bar = 2 ** -16;
const hintedC = corpus.filter((u) => tokenize(u).includes(SESSION_HINT));
const hintedA = corpus.filter((u) => tokenize(u).includes(BOOTSTRAP_HINT));
const startB = corpus.filter((u) => isStartB(u));
const startC = corpus.filter((u) => isStartC(u));
const finishC = corpus.filter((u) => isFinishC(u));

const report = {
  k_session: `0x${K_SESSION.toString(16)}`,
  session_hint: SESSION_HINT,
  t_start: `0x${T_START.toString(16)}`,
  t_finish: `0x${T_FINISH.toString(16)}`,
  start: { base: START_BASE, first: start.first, ...start },
  finish: { base: FINISH_BASE, first: finish.first, ...finish },
  corpus: {
    n,
    bar,
    bootstrap_hinted: hintedA.length,
    session_hinted: hintedC.length,
    arm_b_start: startB.length,
    arm_b_rate: startB.length / n,
    arm_c_start: startC.length,
    arm_c_start_rate: startC.length / n,
    arm_c_finish: finishC.length,
    arm_c_finish_rate: finishC.length / n,
    arm_b_meets_bar: startB.length / n <= bar,
    arm_c_start_meets_bar: startC.length / n <= bar,
    arm_c_finish_meets_bar: finishC.length / n <= bar,
  },
};
writeFileSync(resolve(import.meta.dirname, 'c4.score.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
