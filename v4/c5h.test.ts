/**
 * C5-H pair/fallback hierarchy. Do not retune words or slots after the score.
 *   npm run test:v4-c5h
 */
import { steer } from './c5p.ts';
import {
  CATALOG_AVAIL,
  FALLBACK_HITS,
  FALLBACK_SLOTS,
  HIERARCHY,
  UNUSED_CUE,
  deriveHints,
  hasHint,
  isFinishH,
  isStartH,
} from './c5h.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(HIERARCHY.length === 12, 'twelve jobs');
assert(HIERARCHY.every((h) => deriveHints(CATALOG_AVAIL.find((j) => j.id === h.id)!).start.kind === h.start.kind), 'START agrees');
assert(HIERARCHY.every((h) => h.t_start !== h.t_finish), 'residuals differ');
assert(HIERARCHY.filter((h) => h.start.kind === 'word').map((h) => h.id).join(',') === 'brief,gym,call', 'START fallbacks');
assert(HIERARCHY.filter((h) => h.finish.kind === 'word').map((h) => h.id).join(',') === 'brief,coffee,gym,library', 'FINISH fallbacks');

const coffee = HIERARCHY.find((h) => h.id === 'coffee')!;
assert(coffee.start.kind === 'pair' && coffee.start.pair[0] === 'coffee', 'coffee START is the pair');
assert(coffee.finish.kind === 'word' && coffee.finish.word === 'coffee', 'coffee FINISH is the word');

for (const [id, cue] of Object.entries(UNUSED_CUE)) {
  const h = HIERARCHY.find((row) => row.id === id)!;
  if (cue.start !== undefined) assert(!hasHint(cue.start, h.start), `${id} unused START cue rejected`);
  if (cue.finish !== undefined) assert(!hasHint(cue.finish, h.finish), `${id} unused FINISH cue rejected`);
}

function lockSide(
  id: string,
  side: 'start' | 'finish',
  job = CATALOG_AVAIL.find((j) => j.id === id)!,
  spec = FALLBACK_SLOTS[id][side]!,
  locked = FALLBACK_HITS[id as keyof typeof FALLBACK_HITS][side as 'start' | 'finish'],
): void {
  const hit = side === 'start' ? (u: string) => isStartH(u, job) : (u: string) => isFinishH(u, job);
  const hint = side === 'start' ? HIERARCHY.find((h) => h.id === id)!.start : HIERARCHY.find((h) => h.id === id)!.finish;
  const steered = steer(spec.slots, hit, (u) => hasHint(u, hint));
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
console.log('C5-H pair/fallback hierarchy ok');
