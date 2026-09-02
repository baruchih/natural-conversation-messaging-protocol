/**
 * V4-F5: Result #5, PARTIAL, frozen.
 * Declared battery reliability. Not an independent p.
 *   npm run test:v4-f5
 */
import { ARGUMENT_BITS_TEXT, BATCH as F4_BATCH } from './f4.ts';
import { FROZEN } from './f5.frozen.ts';
import {
  BATCH,
  CONTEXTS,
  FRAME_PAYLOADS,
  PAYLOADS,
  SCRIPTS,
  bitsCarried,
  encodeScript,
  lastOf,
  opportunityRate,
  rateTable,
  scoreOpportunity,
} from './f5.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(BATCH === 50 && BATCH === F4_BATCH, 'k = 50 stays frozen');
assert(PAYLOADS.every((p) => p.length === 8), 'payloads stay 8 bits');
assert(PAYLOADS.every((p) => p !== ARGUMENT_BITS_TEXT), 'not the F4 argument');
assert(FRAME_PAYLOADS.every((p) => (PAYLOADS as readonly string[]).includes(p)), 'frame payloads are declared');
assert(CONTEXTS.length === 6, 'six new contexts');
assert(SCRIPTS.length === 3, 'three new scripts');
assert(SCRIPTS.every((s) => s.intents.length === 6), 'six intents each');

const rates = CONTEXTS.map((c) => opportunityRate(c));
assert(rates.filter((r) => r === 1).length === 2, 'two r=1 lasts');
assert(rates.filter((r) => r === 2).length === 2, 'two r=2 lasts');
assert(rates.filter((r) => r === 3).length === 2, 'two r=3 lasts');
assert(new Set(CONTEXTS.map((c) => lastOf(c))).size === 6, 'lasts are distinct');

assert(encodeScript(PAYLOADS[0], SCRIPTS[0].intents, SCRIPTS[0].intents.map(() => [])).kind === 'NO_CANDIDATE', 'empty script → NO_CANDIDATE');

console.log('V4-F5  reliability of frozen R / π / accept\n');
console.log(`k                ${BATCH}`);
console.log(`payloads         ${PAYLOADS.join('  ')}`);
console.log(`contexts         ${CONTEXTS.map((c) => `${c.id}/r${opportunityRate(c)}`).join('  ')}`);
console.log(`scripts          ${SCRIPTS.map((s) => s.id).join('  ')}`);
console.log('not a UUID; do not enlarge k; do not change R');

if (FROZEN) {
  const rows = FROZEN.opportunities.map((o) => {
    const ctx = CONTEXTS.find((c) => c.id === o.id);
    const ctxIndex = CONTEXTS.findIndex((c) => c.id === o.id);
    assert(!!ctx && ctxIndex >= 0, `frozen context ${o.id}`);
    const scored = scoreOpportunity(ctx!, o.payload, FROZEN.opportunityCandidates[ctxIndex] ?? []);
    assert(scored.hit === o.hit, `${o.id} ${o.payload} replay`);
    return scored;
  });
  const table = rateTable(rows);
  console.log('\nr  attempts  successes');
  for (const row of table) {
    console.log(`${row.r}  ${String(row.attempts).padEnd(9)}${row.successes}`);
  }
  const misses = rows.filter((x) => !x.hit).length;
  const hits = rows.filter((x) => x.hit);
  const examined = hits.length ? hits.reduce((n, x) => n + x.examined, 0) / hits.length : 0;
  console.log(`NO_CANDIDATE     ${misses}/${rows.length}`);
  console.log(`examined/hit     ${examined.toFixed(2)}`);

  console.log('\nscript   payload   result         bits');
  for (const [i, frame] of FROZEN.frames.entries()) {
    const script = SCRIPTS.find((s) => s.id === frame.script);
    assert(!!script, `script ${frame.script}`);
    const encoded = encodeScript(frame.payload, script!.intents, FROZEN.frameCandidates[i] ?? []);
    const bits = bitsCarried(encoded);
    assert(bits === frame.bits, `${frame.script} ${frame.payload} bits`);
    assert((encoded.kind === 'ENCODED' ? 'ARGUMENT' : 'NO_CANDIDATE') === frame.result, `${frame.script} ${frame.payload} result`);
    console.log(`${frame.script.padEnd(9)}${frame.payload.padEnd(10)}${frame.result.padEnd(15)}${bits}`);
  }
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV4-F5: how often does a natural opportunity contain the bin?');
