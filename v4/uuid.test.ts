/**
 * V4-UUID: replay if frozen. Profile 0 unchanged.
 *   npm run test:v4-uuid
 */
import { START_128, declaredBits } from './baseline.ts';
import { PAYLOAD, UUID, bitsToUuid, encodeFromSets, symbolCount, tally } from './uuid.ts';

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

console.log('V4-UUID  Profile 0, one fixed 128-bit id\n');
console.log(`uuid              ${UUID}`);
console.log(`symbols           ${symbolCount(PAYLOAD)}`);

try {
  const { FROZEN } = await import('./uuid.frozen.ts');
  const encoded = encodeFromSets(FROZEN.candidates);
  const t = tally(encoded.turns);
  assert(FROZEN.uuid === UUID, 'frozen uuid');
  console.log(`result            ${FROZEN.result}`);
  console.log(`body turns        ${t.body}`);
  console.log(`owner / peer      ${t.owner} / ${t.peer}`);
  console.log(`owner DATA/SKIP   ${t.ownerData} / ${t.ownerSkip}`);
  console.log(`CHAT              ${t.chat}`);
  console.log(`max examined      ${t.maxExamined}`);
  if (encoded.kind === 'UUID') {
    const arg = encoded.snaps[encoded.snaps.length - 1].argument;
    assert(arg === PAYLOAD, 'recovered bits');
    assert(bitsToUuid(arg ?? '') === UUID, 'uuid match');
    console.log(`uuid match        yes`);
  } else if (encoded.kind === 'INCOMPLETE') {
    console.log(`have              ${encoded.have}/128`);
  } else {
    assert(encoded.kind === 'NO_CANDIDATE', 'recorded miss');
    assert(FROZEN.result === 'NO_CANDIDATE', 'frozen miss');
    console.log(`NO_CANDIDATE      at U${encoded.index + 1}  have=2/128`);
  }
} catch (e) {
  if ((e as { code?: string }).code !== 'ERR_MODULE_NOT_FOUND') throw e;
  console.log('live              not frozen yet');
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV4-UUID: no new semantics, k = 50');
