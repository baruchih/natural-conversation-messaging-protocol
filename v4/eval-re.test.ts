/**
 * Reliability + efficiency battery. Declared cells. Frozen replay.
 *   npm run test:v4-eval-re
 */
import { declaredBits } from './baseline.ts';
import { FROZEN as UUID_RUN } from './eval-uuid.frozen.ts';
import {
  CELLS,
  CONTEXTS,
  DINNER,
  PAYLOADS,
  SIZES,
  START_FOR,
  UUID,
  encodeRun,
  hexToBits,
  measure,
  summarize,
} from './eval-re.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(SIZES.join(',') === '8,24,128', 'spec-legal sizes only');
assert(CELLS.length === 10, `10 declared cells, got ${CELLS.length}`);
assert(CELLS.every((c) => declaredBits(c.start) === c.size), 'START matches size');
assert(CELLS.every((c) => c.payload.length === c.size), 'payload width');
assert(PAYLOADS[8].a === hexToBits('b6'), '8a is F4 argument');
assert(PAYLOADS[128].a.length === 128 && PAYLOADS[128].a === hexToBits(UUID.replace(/-/g, '')), '128a is the eval UUID');
assert(!CELLS.some((c) => c.size === 128 && c.context === 'dinner'), '128 dinner not in this battery');
assert(DINNER.filter((x) => x.speaker === 'A').length >= 30, 'dinner owner budget');

const hike128 = CELLS.find((c) => c.id === '128-a-hike');
assert(hike128 !== undefined, '128-a-hike exists');
const encoded = encodeRun(hike128!.payload, hike128!.start, CONTEXTS.hike, UUID_RUN.candidates);
const row = measure(hike128!, encoded, UUID_RUN.unused);
assert(row.result === 'ARGUMENT', 'frozen hike 128 completes');
assert(row.match, 'UUID bits match');
assert(row.dataOpportunities === 88 && row.dataSuccesses === 88, '88/88 DATA');
assert(Math.abs(row.bitsPerBodyTurn - 128 / 313) < 1e-9, '128/313 bits per body turn');
assert(row.chat === 0, 'no CHAT');
assert(row.failIndex === null, 'no fail');

console.log('V4-Eval-RE  declared battery  spec-legal START lengths\n');
console.log(`cells             ${CELLS.length}`);
console.log(CELLS.map((c) => c.id).join('\n'));
console.log(`\n128-a-hike        ${row.result}  ${row.bodyTurns} turns  ${row.bitsPerBodyTurn.toFixed(3)} bits/turn  DATA ${row.dataSuccesses}/${row.dataOpportunities}`);

const { FROZEN } = await import('./eval-re.frozen.ts');
const rows = CELLS.map((c) => FROZEN.rows[c.id as keyof typeof FROZEN.rows]);
assert(rows.every(Boolean), 'all 10 cells recorded');
const dataOpp = rows.reduce((n, r) => n + r.dataOpportunities, 0);
const dataHit = rows.reduce((n, r) => n + r.dataSuccesses, 0);
assert(dataOpp === dataHit, 'owner DATA never missed');
assert(rows.every((r) => r.result !== 'NO_CANDIDATE'), 'no NO_CANDIDATE');
assert(rows.filter((r) => r.result === 'ARGUMENT').length === 7, '7 complete frames');
assert(rows.filter((r) => r.result === 'INCOMPLETE').length === 3, '3 intent-budget incompletes');

const hitLists = FROZEN.hits ?? {};
const allHits = Object.values(hitLists).flat();
const s = summarize(rows, allHits);

for (const rec of rows) {
  console.log(`${rec.id.padEnd(16)} ${rec.result.padEnd(12)} DATA ${rec.dataSuccesses}/${rec.dataOpportunities}  bits/turn=${rec.bitsPerBodyTurn.toFixed(3)}  have=${rec.have}/${rec.payloadBits}`);
}

const fmt = (n: number) => n.toFixed(2);
console.log('\nRELIABILITY');
console.log(`completed frames           ${s.completed}/10`);
console.log(`owner-DATA                 ${s.dataHit}/${s.dataOpp}`);
console.log(`peer-continuity failures   ${s.peerFail}`);
console.log(`NO_CANDIDATE               0`);
console.log('first incomplete cause     declared intents exhausted (unused=0)');
console.log('\nSEARCH COST  (hits with transcripts; 8-bit cells have cell max only)');
console.log(`n=${s.search.n}  mean=${fmt(s.search.mean)}  median=${s.search.median}  p95=${s.search.p95}  max=${s.search.max}`);
for (const k of ['0', '10', '11', 'FINAL0', 'FINAL1'] as const) {
  const c = s.search.by[k];
  console.log(`  ${k.padEnd(7)} n=${c.n}  mean=${fmt(c.mean)}  med=${c.median}  p95=${c.p95}  max=${c.max}`);
}
const bodies = s.efficiency.bitsPerBody;
const owners = s.efficiency.bitsPerOwner;
const tpb = s.efficiency.turnsPerBit;
console.log('\nWIRE EFFICIENCY  (complete frames)');
console.log(`bits/body turn    ${Math.min(...bodies).toFixed(3)}–${Math.max(...bodies).toFixed(3)}`);
console.log(`bits/owner turn   ${Math.min(...owners).toFixed(3)}–${Math.max(...owners).toFixed(3)}`);
console.log(`body turns/bit    ${Math.min(...tpb).toFixed(2)}–${Math.max(...tpb).toFixed(2)}`);

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV4-Eval-RE: k=50, half3, spec unchanged');
