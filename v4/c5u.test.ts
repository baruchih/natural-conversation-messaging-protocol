/**
 * C5-U uniform two-word cues. Do not retune pairs or slots after the score.
 *   npm run test:v4-c5u
 */
import { steer } from './c5p.ts';
import {
  CATALOG_AVAIL,
  CUES,
  FILL_HITS,
  FILL_SLOTS,
  finishPair,
  hasOrderedPair,
  isFinishU,
  isStartU,
  startPair,
} from './c5u.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(CUES.length === 12, 'twelve jobs');
assert(CUES.every((c) => c.start.pair.length === 2 && c.finish.pair.length === 2), 'every cue is a pair');
assert(CUES.filter((c) => c.start.source === 'hybrid').map((c) => c.id).join(',') === 'brief,gym,call', 'START hybrids');
assert(CUES.filter((c) => c.finish.source === 'derived').map((c) => c.id).join(',') === 'brief,coffee,library', 'FINISH derived');
assert(CUES.find((c) => c.id === 'gym')!.finish.source === 'hybrid', 'gym FINISH hybrid');

for (const job of CATALOG_AVAIL) {
  const cue = CUES.find((c) => c.id === job.id)!;
  const donatedStart = startPair(job.u_probe);
  const donatedFinish = finishPair(job.u_ack);
  if (donatedStart !== null) {
    assert(cue.start.source === 'donated' && cue.start.pair[0] === donatedStart[0] && cue.start.pair[1] === donatedStart[1], `${job.id} START C5-P untouched`);
  } else {
    assert(cue.start.source !== 'donated', `${job.id} START not fake-donated`);
  }
  if (donatedFinish !== null) {
    assert(cue.finish.source === 'donated' && cue.finish.pair[0] === donatedFinish[0] && cue.finish.pair[1] === donatedFinish[1], `${job.id} FINISH C5-P untouched`);
  }
}

function lockSide(id: string, side: 'start' | 'finish'): void {
  const job = CATALOG_AVAIL.find((j) => j.id === id)!;
  const spec = FILL_SLOTS[id][side]!;
  const locked = FILL_HITS[id as keyof typeof FILL_HITS][side as 'start' | 'finish'];
  const cue = CUES.find((c) => c.id === id)!;
  const pair = side === 'start' ? cue.start.pair : cue.finish.pair;
  const hit = side === 'start' ? (u: string) => isStartU(u, job) : (u: string) => isFinishU(u, job);
  const steered = steer(spec.slots, hit, (u) => hasOrderedPair(u, pair));
  assert(steered.first === spec.base && steered.hinted === 64, `${id} ${side} reusable`);
  assert(steered.hit === locked, `${id} ${side} hit`);
}

lockSide('brief', 'start');
lockSide('brief', 'finish');
lockSide('coffee', 'finish');
lockSide('gym', 'start');
lockSide('gym', 'finish');
lockSide('library', 'finish');
lockSide('call', 'start');

if (failed > 0) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('C5-U uniform two-word cues ok');
