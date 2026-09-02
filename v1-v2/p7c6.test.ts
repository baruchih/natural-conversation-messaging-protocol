/**
 * NCMP-P7-C6 experiment runner.
 *   npx tsx p7c6.test.ts
 */
import {
  MODULUS,
  PROPOSITIONS,
  TOPICS,
  capacitySweep,
  canonicalize,
  collectByResidue,
  coverage,
  decode,
  encode,
  encodeProposition,
  enumerateTopic,
  greedyMaterialSubset,
  letterSum,
  letterValue,
  propositionCoverage,
  selectedLetters,
  wellFormed,
} from './p7c6.ts';

let failed = 0;

function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

function assertEqual<T>(actual: T, expected: T, message: string): void {
  if (actual !== expected) {
    failed += 1;
    console.error(`FAIL  ${message} (got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)})`);
  }
}

assertEqual(letterValue('a'), 1, 'value(a)=1');
assertEqual(letterValue('z'), 26, 'value(z)=26');
assertEqual(letterValue('A'), 0, 'non a-z value is 0');
assertEqual(canonicalize('Café!'), 'café!', 'NFC + lowercase');
assertEqual(selectedLetters('Café! 42'), 'caf', 'only a-z are selected');

const worked = 'What did we find when we looked at that account?';
assert(wellFormed(worked), 'worked sentence is well-formed');
const workedN = decode(worked);
assert(workedN >= 0 && workedN < MODULUS, 'worked residue in range');
assertEqual(decode(worked.toUpperCase()), workedN, 'case does not change N');
assertEqual(letterSum(worked) % MODULUS, workedN, 'N is sum mod 64');
assertEqual(decode('Hello there friend now.'), decode('Hello, there — friend now!'), 'punct ignored');

assert(!wellFormed('Hi there.'), 'too short');
assert(
  !wellFormed('I think we should order the pasta at table 12 tonight.'),
  'digits rejected'
);
assert(!wellFormed('I think we should go. Then we eat.'), 'multi-sentence rejected');

for (const topic of TOPICS) {
  const { hit, missing } = coverage(topic);
  assertEqual(hit, MODULUS, `${topic} residue coverage`);
  if (missing.length > 0) {
    failed += 1;
    console.error(`FAIL  ${topic} missing residues: ${missing.join(',')}`);
  }

  for (let n = 0; n < MODULUS; n++) {
    const u = encode(n, topic);
    if (!u) {
      failed += 1;
      console.error(`FAIL  ${topic} failed to encode ${n}`);
      continue;
    }
    assert(wellFormed(u), `${topic} encode(${n}) well-formed: ${u}`);
    assertEqual(decode(u), n, `${topic} encode(${n}) invert`);
    assert(!/[0-9]/.test(u), `${topic} encode(${n}) has no digits`);
  }
}

const byResidue = collectByResidue();
const materialPerN: number[] = [];
for (let n = 0; n < MODULUS; n++) {
  materialPerN.push(greedyMaterialSubset(byResidue.get(n) ?? []).length);
}

const minMaterial = Math.min(...materialPerN);
const below20 = materialPerN.filter((c) => c < 20).length;
assert(
  below20 === 0,
  `target bar: every residue has ≥20 materially distinct sentences (min=${minMaterial}, below20=${below20})`
);

const example42 = encode(42, 'dinner');
const example0 = encode(0, 'weather');
console.log(`C6 encode(42, dinner) = ${example42}`);
console.log(`C6 encode(0, weather) = ${example0}`);

for (const topic of TOPICS) {
  for (const u of enumerateTopic(topic)) {
    assert(wellFormed(u), `grammar sentence well-formed: ${u}`);
  }
}

console.log(`C6 worked example residue: "${worked}" → ${workedN}`);
console.log(`C6 target bar: ${64 - below20}/64 residues have ≥20 materially distinct sentences (min=${minMaterial})`);

console.log('\nC6 semantic invariance (F(P) locked):');
for (const prop of PROPOSITIONS) {
  const row = propositionCoverage(prop.id);
  assertEqual(row.hit, MODULUS, `${prop.id} residues`);
  if (row.missing.length > 0) {
    console.error(`FAIL  ${prop.id} missing: ${row.missing.join(',')}`);
  }
  for (let n = 0; n < MODULUS; n++) {
    const u = encodeProposition(n, prop.id);
    if (!u) {
      failed += 1;
      console.error(`FAIL  ${prop.id} failed to encode ${n}`);
      continue;
    }
    assert(wellFormed(u), `${prop.id} encode(${n}) well-formed`);
    assertEqual(decode(u), n, `${prop.id} encode(${n}) invert`);
  }
  const u0 = encodeProposition(0, prop.id);
  const u42 = encodeProposition(42, prop.id);
  console.log(`  ${row.hit}/64  |F|=${row.familySize}  P=${row.source}`);
  console.log(`           n=0  ${u0}`);
  console.log(`           n=42 ${u42}`);
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nC6 capacity sweep (same F(P), larger M):');
const sweep = capacitySweep();
const byId = new Map<string, typeof sweep>();
for (const row of sweep) {
  const list = byId.get(row.id) ?? [];
  list.push(row);
  byId.set(row.id, list);
}
for (const [id, rows] of byId) {
  const cells = rows.map((r) => {
    const ok = r.hit === r.modulus ? 'OK' : 'FAIL';
    return `${r.hit}/${r.modulus} ${ok}`;
  });
  const six = rows.find((r) => r.modulus === 64);
  assert(six !== undefined && six.hit === 64, `${id} must still cover C6`);
  console.log(`  ${id.padEnd(36)} |F|=${rows[0].familySize}  ${cells.join('  ')}`);
}

console.log('\nNCMP-P7-C6 minimum bar: PASS');
console.log('NCMP-P7-C6 semantic invariance (closed F(P)): PASS');
