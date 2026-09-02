/**
 * C5-A pair availability. Do not retune the catalog, STOP, or slots after the score.
 *   npm run test:v4-c5a
 */
import { steer } from './c5p.ts';
import {
  ACK_POP,
  CATALOG,
  CATALOG_AVAIL,
  HITS,
  SLOTS,
  hasOrderedPair,
  isFinishJob,
  isStartJob,
} from './c5a.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(CATALOG.length === 12, 'twelve predeclared jobs');
assert(CATALOG_AVAIL.filter((j) => j.probe_ok).length === 9, 'probe eligibility');
assert(CATALOG_AVAIL.filter((j) => j.ack_ok).length === 8, 'ack eligibility');
assert(CATALOG_AVAIL.filter((j) => j.both_ok).length === 7, 'both sides donate');
assert(
  CATALOG_AVAIL.filter((j) => !j.both_ok)
    .map((j) => j.id)
    .join(',') === 'brief,coffee,gym,library,call',
  'short-turn misses are frozen',
);
assert(ACK_POP.length === 64 && ACK_POP.filter((r) => r.ok).length === 32, 'C2-F ACK population');
assert(
  ACK_POP.filter((r) => r.pair !== null).every((r) => r.pair![0] === 'sounds' && r.pair![1] === 'bring'),
  'C2-F donated pair is sounds,bring',
);

for (const job of CATALOG_AVAIL.filter((j) => j.both_ok)) {
  const slots = SLOTS[job.id];
  const locked = HITS[job.id as keyof typeof HITS];
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
  assert(start.first === slots.start_base && start.hinted === 64, `${job.id} START reusable`);
  assert(finish.first === slots.finish_base && finish.hinted === 64, `${job.id} FINISH reusable`);
  assert(start.hit === locked.start, `${job.id} START hit`);
  assert(finish.hit === locked.finish, `${job.id} FINISH hit`);
}

if (failed > 0) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('C5-A pair availability ok');
