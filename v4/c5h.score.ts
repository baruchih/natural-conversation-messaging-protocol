import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { steer } from './c5p.ts';
import {
  CATALOG_AVAIL,
  FALLBACK_SLOTS,
  HIERARCHY,
  UNUSED_CUE,
  deriveHints,
  hasHint,
  isFinishH,
  isStartH,
} from './c5h.ts';

const corpus = readFileSync(resolve(import.meta.dirname, 'c2d.corpus.txt'), 'utf8')
  .split('\n')
  .filter((u) => u.length > 0);
const n = corpus.length;
const bar = 2 ** -16;

const jobs = HIERARCHY.map((h, i) => {
  const job = CATALOG_AVAIL[i];
  const again = deriveHints(job);
  const startAgree = JSON.stringify(again.start) === JSON.stringify(h.start);
  const finishAgree = JSON.stringify(again.finish) === JSON.stringify(h.finish);
  const unused = UNUSED_CUE[job.id];
  const unusedRejected = unused
    ? {
        start: unused.start === undefined ? null : !hasHint(unused.start, h.start),
        finish: unused.finish === undefined ? null : !hasHint(unused.finish, h.finish),
      }
    : null;
  const fb = FALLBACK_SLOTS[job.id];
  const scoreSide = (
    side: 'start' | 'finish',
    hint: typeof h.start,
    hit: (u: string) => boolean,
  ) => {
    const spec = fb?.[side];
    if (hint.kind !== 'word' || spec === undefined) return null;
    const steered = steer(spec.slots, hit, (u) => hasHint(u, hint));
    const hinted = corpus.filter((u) => hasHint(u, hint));
    const hits = corpus.filter(hit);
    return {
      word: hint.word,
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
    start: h.start,
    finish: h.finish,
    t_start: `0x${h.t_start.toString(16)}`,
    t_finish: `0x${h.t_finish.toString(16)}`,
    targets_differ: h.t_start !== h.t_finish,
    agree: startAgree && finishAgree,
    unused_rejected: unusedRejected,
    fallback: {
      start: scoreSide('start', h.start, (u) => isStartH(u, job)),
      finish: scoreSide('finish', h.finish, (u) => isFinishH(u, job)),
    },
  };
});

const kinds = {
  start_pair: jobs.filter((j) => j.start.kind === 'pair').length,
  start_word: jobs.filter((j) => j.start.kind === 'word').length,
  finish_pair: jobs.filter((j) => j.finish.kind === 'pair').length,
  finish_word: jobs.filter((j) => j.finish.kind === 'word').length,
  both_covered: jobs.length,
};

const report = {
  n: jobs.length,
  kinds,
  all_agree: jobs.every((j) => j.agree),
  all_targets_differ: jobs.every((j) => j.targets_differ),
  unused_all_rejected: jobs.every((j) => {
    const u = j.unused_rejected;
    if (u === null) return true;
    return (u.start === null || u.start) && (u.finish === null || u.finish);
  }),
  jobs,
};
writeFileSync(resolve(import.meta.dirname, 'c5h.score.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
