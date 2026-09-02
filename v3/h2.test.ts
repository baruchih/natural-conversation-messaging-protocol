/**
 * V3-H2: state-derived g over accepted turns. Not camouflage.
 *   npm run test:v3-h2
 */
import { wellFormed } from '../v1-v2/p7c6.ts';
import { decodeD } from '../v1-v2/p7d1.ts';
import { G_POSITION, L0, decodeE } from './h1.ts';
import { TURNS, both, gSeed, harvested, languageAfter, run, selectG } from './h2.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

console.log('V3-H2  state-derived g, inspect the harvest\n');

for (const u of TURNS) {
  assert(wellFormed(u) && decodeD(u) === 'GET', `GET ${u}`);
  assert(decodeE(u, L0) === 'CUSTOMER', `accepted under L0: ${u}`);
}

const { a, b } = both();
assert(a.length === 10 && b.length === 10, 'ten turns');
assert(a.every((t, i) => t.position === b[i].position && t.token === b[i].token && t.kind === b[i].kind), 'A and B same g and promote');
assert(languageAfter(a).digest === languageAfter(b).digest, 'H(LA) == H(LB)');

const grew = harvested(a);
console.log('n  pos  token         kind        N');
for (const t of a) {
  console.log(
    `${String(t.n).padEnd(3)}${String(t.position).padEnd(5)}${t.token.padEnd(14)}${t.kind.padEnd(12)}${t.residue}`,
  );
}
console.log(`\nharvested ${grew.length}: { ${languageAfter(a).customer.join(', ')} }`);

const seed0 = gSeed(L0, [], TURNS[0]);
assert(seed0.startsWith(L0.digest), 'g starts from H(L)');
assert(!seed0.split('\n').includes(String(a[0].residue)), 'g seed does not contain N as a field');

const positions = new Set(a.map((t) => t.position));
assert(positions.size >= 1, 'g produced positions');
assert(!a.every((t) => t.position === G_POSITION), 'g is not H1’s published 7 on every turn');

if (grew.length > 0) {
  const y = grew[0];
  const used = `Did we find ${y} before dinner last night?`;
  const atHarvest = a.find((t) => t.kind === 'harvested' && t.token === y);
  assert(decodeE(used, L0) === 'NONE', `${y} is NONE under L0`);
  assert(atHarvest !== undefined && decodeE(used, atHarvest.language) === 'CUSTOMER', `${y} is CUSTOMER after harvest`);
}

const gAgain = selectG(L0, [], TURNS[0]);
assert(gAgain.position === a[0].position, 'g is stable for the same state and U');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-H2: g is H(L)||transcript||U; N is not the index; promote is H1’s');
