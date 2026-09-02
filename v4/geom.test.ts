/**
 * V4-Geom: 4/4/4 contiguous vs declared interleave. Frozen F6.
 *   npm run test:v4-geom
 */
import { FROZEN } from './f6.frozen.ts';
import { residuesOfSet } from './code.ts';
import {
  NEUTRAL,
  SYMBOLS,
  assignmentOk,
  copyOf,
  decodeInterleaved,
  interleavedCopies,
  reservedStates,
  scoreContiguousNeutral,
  scoreInterleaved,
} from './geom.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(NEUTRAL.k1 === 4 && NEUTRAL.k2 === 4 && NEUTRAL.k3 === 4, 'neutral 4/4/4');
assert(SYMBOLS.length === 14, '14 symbols');
assert(assignmentOk(), 'interleave is collision-free and reserved-null');
assert(interleavedCopies('101').join(',') === '11,27,43,59', '101 → 11,27,43,59');
assert(copyOf(0, 0) === 0 && copyOf(0, 1) === 16, 'copy stride 16');
assert(decodeInterleaved(14) === null, '14 reserved');
assert(reservedStates().length === 8, 'eight reserved');
assert(FROZEN !== null, 'F6 frozen');

const sets = FROZEN!.candidates.map((list) => residuesOfSet(list));
const contig = scoreContiguousNeutral(sets);
const inter = scoreInterleaved(sets);

assert(contig.fullSets === 8, 'contiguous 4/4/4 stays 8/18 (Code note)');

console.log('V4-Geom  4/4/4  contiguous vs interleave\n');
console.log('budget     4/4/4  (not chosen for score)');
console.log('interleave copy_j(s) = s + 16j   s ∈ 0..13');
console.log('101        {11, 27, 43, 59}');
console.log('reserved   14,15,30,31,46,47,62,63\n');
console.log('             contiguous    interleaved');
console.log(`full           ${String(contig.fullSets).padStart(2)}/18           ${String(inter.fullSets).padStart(2)}/18`);
console.log(`mean          ${contig.meanCovered.toFixed(2)}           ${inter.meanCovered.toFixed(2)}`);
console.log(`minimum          ${String(contig.minCovered).padStart(2)}              ${String(inter.minCovered).padStart(2)}`);
console.log(`w1 full          ${String(contig.widthFull[1]).padStart(2)}              ${String(inter.widthFull[1]).padStart(2)}`);
console.log(`w2 full          ${String(contig.widthFull[2]).padStart(2)}              ${String(inter.widthFull[2]).padStart(2)}`);
console.log(`w3 full          ${String(contig.widthFull[3]).padStart(2)}              ${String(inter.widthFull[3]).padStart(2)}`);

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV4-Geom: same budget, different geometry, same frozen sets');
