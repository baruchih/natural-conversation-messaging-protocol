import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  FINISH_BASE,
  FINISH_SLOTS,
  K_SESSION,
  START_BASE,
  START_SLOTS,
  T_FINISH,
  T_START,
  steer,
} from './c2b.ts';

const start = steer(START_SLOTS, T_START);
const finish = steer(FINISH_SLOTS, T_FINISH);
const report = {
  k_session: `0x${K_SESSION.toString(16)}`,
  start: { base: START_BASE, first: start.first, ...start },
  finish: { base: FINISH_BASE, first: finish.first, ...finish },
};
writeFileSync(resolve(import.meta.dirname, 'c2b.score.json'), JSON.stringify(report, null, 2) + '\n');
console.log(
  JSON.stringify(
    {
      k_session: report.k_session,
      t_start: start.target,
      start_n: start.n,
      start_unique: start.unique_p,
      start_hits: start.hits,
      start_hit: start.hit,
      t_finish: finish.target,
      finish_n: finish.n,
      finish_unique: finish.unique_p,
      finish_hits: finish.hits,
      finish_hit: finish.hit,
    },
    null,
    2,
  ),
);
