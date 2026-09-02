/**
 * V4-J: candidate J maps and redundancy budgets.
 * Invariant only. No F6. No chosen map.
 *   npm run test:v4-j
 */
import {
  ALPHABET,
  CANDIDATES,
  DATA_OUTCOMES,
  dataCounts,
  decode,
  jSkipFromData,
  label,
  nextModeAgrees,
  skipCounts,
} from './j.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

console.log('V4-J  candidate maps. No F6. None chosen.\n');
console.log('F6 r=3 residues/symbol   8');
console.log('64 / 6                    10.67\n');

for (const { name, jData } of CANDIDATES) {
  const jSkip = jSkipFromData(jData);
  assert(nextModeAgrees(jData, jSkip), `${name}: next_mode(V) agrees`);

  const dc = dataCounts(jData);
  const sc = skipCounts(jSkip);
  let dataSum = 0;
  for (const o of DATA_OUTCOMES) {
    const n = dc[label(o)];
    dataSum += n;
    assert(n >= 10, `${name}: ${label(o)} has ${n}`);
  }
  assert(dataSum === ALPHABET, `${name}: DATA covers 64`);
  assert(sc.DATA + sc.SKIP === ALPHABET, `${name}: SKIP covers 64`);

  const skipDecode = decode('SKIP', 0, jData);
  const dataDecode = decode('DATA', 0, jData);
  assert(skipDecode.bits === '', `${name}: SKIP contributes nothing`);
  assert(dataDecode.bits === jData(0).bits, `${name}: DATA contributes bits`);
  assert(skipDecode.next === dataDecode.next, `${name}: same V, same tomorrow`);

  const rows = DATA_OUTCOMES.map((o) => `${label(o)}=${dc[label(o)]}`).join('  ');
  console.log(`${name.padEnd(10)} DATA  ${rows}`);
  console.log(`${''.padEnd(10)} SKIP  D=${sc.DATA}  S=${sc.SKIP}`);
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV4-J: invariant holds; no map chosen');
