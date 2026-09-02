/**
 * C5-G cross-job pair donation. Do not retune jobs or slots after the score.
 *   npm run test:v4-c5g
 */
import { steer } from './c5p.ts';
import {
  DERIVED,
  HITS,
  JOBS,
  SLOTS,
  hasOrderedPair,
  isFinishJob,
  isStartJob,
} from './c5g.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(JOBS.length === 3, 'three predeclared jobs');
assert(JOBS[0].id === 'walk' && JOBS[1].id === 'cafe' && JOBS[2].id === 'market', 'job ids');

for (const job of DERIVED) {
  assert(job.start_pair !== null && job.finish_pair !== null, `${job.id} donated both pairs`);
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
  assert(start.first === slots.start_base, `${job.id} START base`);
  assert(finish.first === slots.finish_base, `${job.id} FINISH base`);
  assert(start.n === 64 && start.hinted === 64, `${job.id} START keeps the pair`);
  assert(finish.n === 64 && finish.hinted === 64, `${job.id} FINISH keeps the pair`);
  const locked = HITS[job.id as keyof typeof HITS];
  assert(start.hit === locked.start, `${job.id} START hit`);
  assert(finish.hit === locked.finish, `${job.id} FINISH hit`);
  assert(start.hits >= 1 && finish.hits >= 1, `${job.id} residual hits`);
  assert(!locked.start.toLowerCase().includes('umbrella'), `${job.id} START has no bootstrap word`);
  assert(!locked.finish.toLowerCase().includes('umbrella'), `${job.id} FINISH has no bootstrap word`);
}

assert(DERIVED[0].probe_is_bootstrap && DERIVED[0].ack_is_bootstrap, 'walk is the residual handshake');
assert(!DERIVED[1].probe_is_bootstrap && !DERIVED[2].probe_is_bootstrap, 'new texts are not a second bootstrap search');

if (failed > 0) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('C5-G cross-job pair donation ok');
