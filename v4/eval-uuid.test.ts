/**
 * Spec UUID evaluation: planted checks and frozen replay.
 *   npm run test:v4-eval-uuid
 */
import { START_128, declaredBits, process, fresh, ACK_EXAMPLE, PROBE_EXAMPLE } from './baseline.ts';
import {
  INTENTS,
  PAYLOAD,
  UUID,
  bitsToUuid,
  encodeFromSets,
  parseNatural,
  selectNatural,
  selectOwnerData,
  symbolCount,
  tally,
} from './eval-uuid.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(PAYLOAD.length === 128, '128 bits');
assert(bitsToUuid(PAYLOAD) === UUID, 'canonical uuid');
assert(declaredBits(START_128) === 128, 'START declares 128');
assert(symbolCount(PAYLOAD) === 88, '88 Profile 0 symbols');
assert(INTENTS.filter((x) => x.speaker === 'A').length >= 170, 'declared owner budget');

const CLOCK = "Let's meet around 7:30 before the lot fills up.";
const nat = selectNatural([CLOCK, 'A second unused line.']);
assert(nat.chosen === CLOCK, 'peer takes the first U');
assert(nat.searched === false, 'peer is not a search');
assert(/[0-9]/.test(CLOCK), 'clock has digits');

const m = fresh();
process(m, 'A', PROBE_EXAMPLE);
process(m, 'B', ACK_EXAMPLE);
process(m, 'A', START_128);
const clockSnap = process(m, 'B', CLOCK);
assert(clockSnap.outcome === 'BODY_SKIP', 'clock peer is BODY');
assert(clockSnap.bits === '', 'clock peer zero payload');
assert(clockSnap.mode === 'DATA', 'clock V=14 → DATA');
assert(clockSnap.open === true, 'frame stays open');

const miss = selectOwnerData([CLOCK], PAYLOAD);
assert(miss.chosen === null, 'owner DATA still rejects digits via turnOk');
assert(miss.searched === true, 'owner DATA is a search');

assert(!!parseNatural("Let's meet around 7:30 before the lot fills up"), 'parseNatural keeps a clock line');

console.log('V4-Eval-UUID  specification evaluation\n');
console.log(`uuid              ${UUID}`);
console.log(`symbols           ${symbolCount(PAYLOAD)}`);
console.log(`declared intents  ${INTENTS.length}`);

try {
  const { FROZEN } = await import('./eval-uuid.frozen.ts');
  const encoded = encodeFromSets(FROZEN.candidates);
  const t = tally(encoded.turns);
  assert(FROZEN.uuid === UUID, 'frozen uuid');
  console.log(`result            ${FROZEN.result}`);
  console.log(`body turns        ${t.body}`);
  console.log(`owner / peer      ${t.owner} / ${t.peer}`);
  console.log(`DATA opp / hit    ${t.dataOpportunities} / ${t.dataSuccesses}`);
  console.log(`owner SKIP        ${t.ownerSkip}`);
  console.log(`CHAT              ${t.chat}`);
  console.log(`peer digits       ${t.peerDigits}`);
  console.log(`max examined      ${t.maxExamined}`);
  if (encoded.kind === 'UUID') {
    const arg = encoded.snaps[encoded.snaps.length - 1].argument;
    assert(arg === PAYLOAD, 'recovered bits');
    assert(bitsToUuid(arg ?? '') === UUID, 'uuid match');
    console.log(`uuid match        yes`);
  } else if (encoded.kind === 'INCOMPLETE') {
    console.log(`have              ${encoded.have}/128`);
  } else {
    console.log(`NO_CANDIDATE      at U${encoded.index + 1}  role=${encoded.role}  wanted=${encoded.wanted || '—'}`);
  }
} catch (e) {
  if ((e as { code?: string }).code !== 'ERR_MODULE_NOT_FOUND') throw e;
  console.log('live              not frozen yet');
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV4-Eval-UUID: peer is natural; only owner DATA searches');
