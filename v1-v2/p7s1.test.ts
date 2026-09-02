/**
 * P7-S1: asymmetric handshake. Handshake never uses N.
 *   npm run test:s1
 */
import { decode as decodeN } from './p7c6.ts';
import { legalCandidates } from './p7c6.hy.ts';
import { e1For } from './p7e1.ts';
import {
  ACK_EXAMPLE,
  Agent,
  PROBE_EXAMPLE,
  isAck,
  isProbe,
  step,
} from './p7s1.ts';

const GC42_SEED = 'Did we find the restaurant was good but service was slow for that party?';
const DINNER = 'I think we should order the roasted vegetables tonight.';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const gc42 = e1For(GC42_SEED, 42)[0]?.utterance;
assert(!!gc42, 'need a GET CUSTOMER 42 realization');

console.log('P7-S1  asymmetric handshake  (S = whether, D/E/N = what)\n');
console.log(`GET CUSTOMER 42 U = ${gc42}`);
console.log(`  idle          → ${step('idle', 'recv', gc42!).result.kind}`);
console.log(`  ack_wait      → ${step('ack_wait', 'recv', gc42!).result.kind}`);
console.log(`  ack_required  → ${step('ack_required', 'recv', gc42!).result.kind}`);
console.log(`  active        → ${JSON.stringify(step('active', 'recv', gc42!).result)}\n`);

assert(isProbe(PROBE_EXAMPLE), 'probe example');
assert(isAck(ACK_EXAMPLE), 'ack example');
assert(!isProbe(gc42!), 'application is not probe');
assert(!isAck(gc42!), 'application is not ack');

const probeNs = new Set<number>();
for (const glaze of ['', ' last night', ' this evening', ' during dinner']) {
  const u = `Shall we compare notes on the usual matter${glaze}?`;
  assert(isProbe(u), `probe+glaze still probe: ${u}`);
  probeNs.add(decodeN(u));
}
assert(probeNs.size >= 2, 'probe glaze must change N while isProbe stays true');
console.log(`probe variants: ${probeNs.size} distinct N, all isProbe (N not used)`);

const idleGc = step('idle', 'recv', gc42!);
assert(idleGc.result.kind === 'NOT_NCMP', 'idle application is NOT_NCMP');
assert(idleGc.mode === 'idle', 'idle stays idle on application');

const waitGc = step('ack_wait', 'recv', gc42!);
assert(waitGc.result.kind === 'NOT_NCMP', 'ack_wait application is not a frame');
assert(waitGc.mode === 'ack_wait', 'ack_wait stays until ACK');

const pendingGc = step('ack_required', 'recv', gc42!);
assert(pendingGc.result.kind === 'NOT_NCMP', 'ack_required application is not a frame');
assert(pendingGc.mode === 'ack_required', 'ack_required stays until ACK emitted');

const activeGc = step('active', 'recv', gc42!);
assert(activeGc.result.kind === 'FRAME', 'active application is FRAME');
if (activeGc.result.kind === 'FRAME') {
  assert(activeGc.result.d === 'GET', 'D');
  assert(activeGc.result.e === 'CUSTOMER', 'E');
  assert(activeGc.result.n === 42, 'N');
}

assert(step('idle', 'recv', DINNER).result.kind === 'NOT_NCMP', 'idle dinner');
assert(step('active', 'recv', DINNER).result.kind === 'DECODE_ERROR', 'active dinner without D/E');

const unsolicited = step('idle', 'recv', ACK_EXAMPLE);
assert(unsolicited.result.kind === 'NOT_NCMP', 'unsolicited ACK is not a handshake');
assert(unsolicited.mode === 'idle', 'unsolicited ACK does not activate');

const heardProbe = step('idle', 'recv', PROBE_EXAMPLE);
assert(heardProbe.result.kind === 'PROBE', 'recv probe');
assert(heardProbe.mode === 'ack_required', 'recv probe → ack_required, not active');

const sentAck = step('ack_required', 'send', ACK_EXAMPLE);
assert(sentAck.result.kind === 'ACK', 'send ACK');
assert(sentAck.mode === 'active', 'send ACK from ack_required → active');

const sentProbe = step('idle', 'send', PROBE_EXAMPLE);
assert(sentProbe.result.kind === 'PROBE', 'send probe');
assert(sentProbe.mode === 'ack_wait', 'send probe → ack_wait');

const heardAck = step('ack_wait', 'recv', ACK_EXAMPLE);
assert(heardAck.result.kind === 'ACK', 'recv ACK');
assert(heardAck.mode === 'active', 'recv ACK from ack_wait → active');

const a = new Agent('A');
const b = new Agent('B');
assert(a.send(PROBE_EXAMPLE).kind === 'PROBE', 'A emits probe');
assert(a.mode === 'ack_wait', 'A waits');
assert(b.receive(PROBE_EXAMPLE).kind === 'PROBE', 'B hears probe');
assert(b.mode === 'ack_required', 'B must ACK');
assert(b.send(ACK_EXAMPLE).kind === 'ACK', 'B emits ACK');
assert(b.mode === 'active', 'B active after emitting ACK');
assert(a.receive(ACK_EXAMPLE).kind === 'ACK', 'A hears ACK');
assert(a.mode === 'active', 'A active after hearing ACK');
const frame = b.receive(gc42!);
assert(frame.kind === 'FRAME', 'after handshake, GC42 is a frame');

const probeN = decodeN(PROBE_EXAMPLE);
const sameResidue = legalCandidates(
  'The restaurant was good but service was slow.',
).find((c) => c.residue === probeN && !isProbe(c.utterance));
assert(!!sameResidue, `need a dinner sentence with N=${probeN}`);
assert(!isProbe(sameResidue!.utterance), 'same residue without probe tokens is not a probe');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nP7-S1: handshake is directional; same U is NOT_NCMP until ACTIVE');
