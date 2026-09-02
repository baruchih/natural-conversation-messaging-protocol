import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BASE, SLOTS, steer } from './c2f.ts';

const r = steer();
const report = {
  base: BASE,
  slots: SLOTS,
  target: r.target,
  n: r.n,
  hinted: r.hinted,
  unique_p: r.unique_p,
  hits: r.hits,
  hit: r.hit,
  k_session: r.k_session,
};
writeFileSync(resolve(import.meta.dirname, 'c2f.score.json'), JSON.stringify({ ...report, realizations: r.realizations }, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
