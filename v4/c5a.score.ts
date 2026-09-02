import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { steer } from './c5p.ts';
import {
  ACK_POP,
  CATALOG_AVAIL,
  SLOTS,
  hasOrderedPair,
  isFinishJob,
  isStartJob,
} from './c5a.ts';

const corpus = readFileSync(resolve(import.meta.dirname, 'c2d.corpus.txt'), 'utf8')
  .split('\n')
  .filter((u) => u.length > 0);
const n = corpus.length;
const bar = 2 ** -16;

const catalog = CATALOG_AVAIL.map((job) => {
  const slots = SLOTS[job.id];
  if (!job.both_ok || slots === undefined) {
    return {
      id: job.id,
      scene: job.scene,
      u_probe: job.u_probe,
      u_ack: job.u_ack,
      probe_eligible: job.probe_eligible,
      ack_eligible: job.ack_eligible,
      probe_ok: job.probe_ok,
      ack_ok: job.ack_ok,
      both_ok: job.both_ok,
      start_pair: job.start_pair,
      finish_pair: job.finish_pair,
      reuse: null,
    };
  }
  const start = steer(
    slots.start_slots,
    (u) => isStartJob(u, job),
    (u) => hasOrderedPair(u, job.start_pair),
  );
  const finish = steer(
    slots.finish_slots,
    (u) => isFinishJob(u, job),
    (u) => hasOrderedPair(u, job.finish_pair),
  );
  const startHinted = corpus.filter((u) => hasOrderedPair(u, job.start_pair));
  const finishHinted = corpus.filter((u) => hasOrderedPair(u, job.finish_pair));
  const startHits = corpus.filter((u) => isStartJob(u, job));
  const finishHits = corpus.filter((u) => isFinishJob(u, job));
  return {
    id: job.id,
    scene: job.scene,
    u_probe: job.u_probe,
    u_ack: job.u_ack,
    probe_eligible: job.probe_eligible,
    ack_eligible: job.ack_eligible,
    probe_ok: job.probe_ok,
    ack_ok: job.ack_ok,
    both_ok: job.both_ok,
    start_pair: job.start_pair,
    finish_pair: job.finish_pair,
    k_session: `0x${job.k_session.toString(16)}`,
    t_start: `0x${job.t_start.toString(16)}`,
    t_finish: `0x${job.t_finish.toString(16)}`,
    reuse: {
      start: { base: slots.start_base, first: start.first, ...start },
      finish: { base: slots.finish_base, first: finish.first, ...finish },
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
    },
  };
});

const pairCounts: Record<string, number> = {};
for (const row of ACK_POP) {
  const key = row.pair === null ? 'null' : row.pair.join(',');
  pairCounts[key] = (pairCounts[key] ?? 0) + 1;
}

const report = {
  catalog_n: CATALOG_AVAIL.length,
  catalog_probe_ok: CATALOG_AVAIL.filter((j) => j.probe_ok).length,
  catalog_ack_ok: CATALOG_AVAIL.filter((j) => j.ack_ok).length,
  catalog_both_ok: CATALOG_AVAIL.filter((j) => j.both_ok).length,
  catalog,
  ack_pop: {
    n: ACK_POP.length,
    ok: ACK_POP.filter((r) => r.ok).length,
    pairs: pairCounts,
  },
};
writeFileSync(resolve(import.meta.dirname, 'c5a.score.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
