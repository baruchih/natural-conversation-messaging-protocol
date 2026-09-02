/**
 * First W. Intent-paired. Offline checks.
 *   npm run test:v4-eval-w
 */
import { START_128, declaredBits } from './baseline.ts';
import { FROZEN as C_FROZEN } from './eval-c.frozen.ts';
import {
  CAPS,
  CELLS,
  OBSERVERS,
  PAYLOADS,
  SKELETONS,
  SURFACE_FEATURES,
  jobPrompt,
  jobSetPrompt,
  playArm,
  preferencePrompt,
  promptIsBlindJob,
  promptIsBlindPreference,
  promptsAreSymmetric,
  settingFor,
  surfaceOf,
} from './eval-w.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(CELLS.map((c) => c.id).join(',') === 'weekend,dinner,technical', 'search-complete scenes only');
assert(!CELLS.some((c) => c.id === ('collab' as string)), 'collab stays out');
assert(declaredBits(START_128) === 128, 'wide wrap, no new START length');

assert(PAYLOADS.weekend === '11' && PAYLOADS.weekend.length === 2, 'weekend 2 bits');
assert(PAYLOADS.dinner === '1011010010' && PAYLOADS.dinner.length === 10, 'dinner 10 bits');
assert(PAYLOADS.technical === '110010101' && PAYLOADS.technical.length === 9, 'technical 9 bits');
assert(PAYLOADS.weekend.length <= CAPS.weekend, 'weekend fits C_encodable');
assert(PAYLOADS.dinner.length <= CAPS.dinner, 'dinner fits C_encodable');
assert(PAYLOADS.technical.length <= CAPS.technical, 'technical fits C_encodable');

for (const cell of CELLS) {
  const frozenTurns = C_FROZEN.transcripts[cell.id].turns.length;
  assert(cell.skeleton.length === frozenTurns, `${cell.id} skeleton N=${cell.skeleton.length} frozen=${frozenTurns}`);
  assert(SKELETONS[cell.id].every((j, i) => j.speaker === C_FROZEN.transcripts[cell.id].turns[i].speaker), `${cell.id} speaker sequence`);
  assert(cell.skeleton.every((j) => promptIsBlindJob(cell.id, [], j.speaker, j.job)), `${cell.id} jobs are blind`);
  assert(promptsAreSymmetric(settingFor(cell.id), [], 'A', cell.skeleton[0].job), `${cell.id} prompts share skeleton, not NCMP pep talk`);
}

assert(OBSERVERS.join(',') === 'surface,preference', 'first W observers');
assert(SURFACE_FEATURES.join(',') === 'meanTokens,meanChars,ttr,digitTurnRate,bangTurnRate', 'declared surface features');
assert(
  promptIsBlindPreference(preferencePrompt([{ speaker: 'A', utterance: 'Hi.' }], [{ speaker: 'A', utterance: 'Hey.' }])),
  'preference prompt is blind',
);

const toyTurns = [
  { speaker: 'A' as const, utterance: 'Walk Saturday morning before it warms up.' },
  { speaker: 'B' as const, utterance: 'Park gate at ten works for me.' },
];
const surf = surfaceOf(toyTurns);
assert(surf.meanTokens > 0 && surf.digitTurnRate === 0, 'surface stats');

const weekend = CELLS[0];
const controlSets = weekend.skeleton.map((j) => [`${j.job} Okay.`]);
const played = playArm(weekend, controlSets, 'control');
assert(played.turns.length === weekend.skeleton.length, 'control completes N');
assert(played.constrained.length === 0, 'control provenance is empty');
assert(!jobPrompt(settingFor('weekend'), [], 'A', SKELETONS.weekend[0].job).toLowerCase().includes('despite'), 'CONTROL has no despite');
assert(!jobSetPrompt(settingFor('weekend'), [], 'A', SKELETONS.weekend[0].job).toLowerCase().includes('despite'), 'TREATMENT set has no despite');

console.log('V4-W  fork declared  intent-paired  not run\n');
console.log('primary            intent-paired job skeleton');
console.log('surface-paired     shelf');
for (const cell of CELLS) {
  console.log(
    `${cell.id.padEnd(12)} N=${String(cell.skeleton.length).padStart(2)}  payload=${cell.payload}  cap=${cell.cap}`,
  );
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

const { FROZEN } = await import('./eval-w.frozen.ts');
assert(CELLS.every((c) => FROZEN.rows[c.id]), 'three pairs recorded');
assert(FROZEN.rows.weekend.noCandidate, 'weekend miss stays a miss');
assert(FROZEN.rows.dinner.bitsPlaced === 10, 'dinner placed 10');
assert(FROZEN.rows.technical.bitsPlaced === 9, 'technical placed 9');
console.log('');
for (const c of CELLS) {
  const r = FROZEN.rows[c.id];
  console.log(
    `${r.id.padEnd(12)} N=${r.n}  DATA=${r.constrained.length}/${r.n}  bits=${r.bitsPlaced}/${r.payload.length}  prefT=${r.preferencePickedTreatment}`,
  );
}

console.log('\nV4-W: k=50, half3, spec unchanged');
