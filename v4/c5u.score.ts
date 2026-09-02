import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { steer } from './c5p.ts';
import {
  CATALOG_AVAIL,
  CUES,
  FILL_SLOTS,
  finishPair,
  hasOrderedPair,
  isFinishU,
  isStartU,
  startPair,
} from './c5u.ts';

const corpus = readFileSync(resolve(import.meta.dirname, 'c2d.corpus.txt'), 'utf8')
  .split('\n')
  .filter((u) => u.length > 0);
const n = corpus.length;
const bar = 2 ** -16;

const jobs = CUES.map((cue, i) => {
  const job = CATALOG_AVAIL[i];
  const startDonated = startPair(job.u_probe);
  const finishDonated = finishPair(job.u_ack);
  const startUntouched =
    startDonated === null
      ? cue.start.source !== 'donated'
      : cue.start.source === 'donated' &&
        cue.start.pair[0] === startDonated[0] &&
        cue.start.pair[1] === startDonated[1];
  const finishUntouched =
    finishDonated === null
      ? cue.finish.source !== 'donated'
      : cue.finish.source === 'donated' &&
        cue.finish.pair[0] === finishDonated[0] &&
        cue.finish.pair[1] === finishDonated[1];
  const scoreSide = (side: 'start' | 'finish', pair: readonly [string, string], hit: (u: string) => boolean) => {
    const spec = FILL_SLOTS[job.id]?.[side];
    if (spec === undefined) return null;
    const steered = steer(spec.slots, hit, (u) => hasOrderedPair(u, pair));
    const hinted = corpus.filter((u) => hasOrderedPair(u, pair));
    const hits = corpus.filter(hit);
    return {
      pair,
      base: spec.base,
      first: steered.first,
      n: steered.n,
      hinted: steered.hinted,
      unique_p: steered.unique_p,
      hits: steered.hits,
      hit: steered.hit,
      corpus: {
        n,
        bar,
        hinted: hinted.length,
        hits: hits.length,
        rate: hits.length / n,
        meets_bar: hits.length / n <= bar,
      },
    };
  };
  return {
    id: job.id,
    start: cue.start,
    finish: cue.finish,
    start_untouched: startUntouched,
    finish_untouched: finishUntouched,
    fill: {
      start: cue.start.source === 'donated' ? null : scoreSide('start', cue.start.pair, (u) => isStartU(u, job)),
      finish: cue.finish.source === 'donated' ? null : scoreSide('finish', cue.finish.pair, (u) => isFinishU(u, job)),
    },
  };
});

const report = {
  n: jobs.length,
  sources: {
    start_donated: jobs.filter((j) => j.start.source === 'donated').length,
    start_hybrid: jobs.filter((j) => j.start.source === 'hybrid').length,
    start_derived: jobs.filter((j) => j.start.source === 'derived').length,
    finish_donated: jobs.filter((j) => j.finish.source === 'donated').length,
    finish_hybrid: jobs.filter((j) => j.finish.source === 'hybrid').length,
    finish_derived: jobs.filter((j) => j.finish.source === 'derived').length,
  },
  donated_untouched: jobs.every((j) => j.start_untouched && j.finish_untouched),
  all_pairs: jobs.every((j) => j.start.pair.length === 2 && j.finish.pair.length === 2),
  jobs,
};
writeFileSync(resolve(import.meta.dirname, 'c5u.score.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
