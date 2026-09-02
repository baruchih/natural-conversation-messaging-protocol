import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { steer } from './c5p.ts';
import {
  DERIVED,
  SLOTS,
  hasOrderedPair,
  isFinishJob,
  isStartJob,
} from './c5g.ts';

const corpus = readFileSync(resolve(import.meta.dirname, 'c2d.corpus.txt'), 'utf8')
  .split('\n')
  .filter((u) => u.length > 0);
const n = corpus.length;
const bar = 2 ** -16;

const jobs = DERIVED.map((job) => {
  const slots = SLOTS[job.id];
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
    start_pair: job.start_pair,
    finish_pair: job.finish_pair,
    k_session: `0x${job.k_session.toString(16)}`,
    t_start: `0x${job.t_start.toString(16)}`,
    t_finish: `0x${job.t_finish.toString(16)}`,
    probe_is_bootstrap: job.probe_is_bootstrap,
    ack_is_bootstrap: job.ack_is_bootstrap,
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
  };
});

const report = {
  n_jobs: jobs.length,
  jobs,
};
writeFileSync(resolve(import.meta.dirname, 'c5g.score.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
