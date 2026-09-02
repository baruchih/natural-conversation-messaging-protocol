/**
 * P7-I1: replay vs fresh frame. Strings-only. No metadata in U.
 *   npm run test:i1
 */
import { ACK_EXAMPLE, Agent, PROBE_EXAMPLE } from './p7s1.ts';
import { deliver } from './p7x1.ts';
import { e1For } from './p7e1.ts';
import {
  I1Agent,
  deliverI1,
  encodeBound,
  formatI1,
  recoverPayload,
  surfaceTarget,
  transcriptBind,
} from './p7i1.ts';

const GC42_SEED = 'Did we find the restaurant was good but service was slow for that party?';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

console.log('P7-I1  replay vs fresh  (strings-only, no metadata in U)\n');

const A = new I1Agent('A');
const B = new I1Agent('B');
deliverI1(A, B, PROBE_EXAMPLE);
deliverI1(B, A, ACK_EXAMPLE);
assert(A.mode === 'active' && B.mode === 'active', 'handshake');
assert(transcriptBind(A.transcript) === transcriptBind(B.transcript), 'shared bind');
assert(A.transcript.join('|') === `${PROBE_EXAMPLE}|${ACK_EXAMPLE}`, 'transcript is handshake strings');

const bind0 = transcriptBind(A.transcript);
const u1 = encodeBound(GC42_SEED, 42, A.transcript);
assert(!!u1, `need a realization for surface ${surfaceTarget(42, A.transcript)}`);
assert(!/\d/.test(u1!), 'no digits on the wire');
assert(!/session|nonce|seq/i.test(u1!), 'no conventional metadata words');

const first = deliverI1(A, B, u1!);
console.log(`1  A → B  ${u1}`);
console.log(`   B ${formatI1(first.recv)}`);
assert(first.recv.kind === 'FRAME', 'first frame');
if (first.recv.kind === 'FRAME') {
  assert(first.recv.d === 'GET' && first.recv.e === 'CUSTOMER' && first.recv.n === 42, 'GET CUSTOMER 42');
}
const afterFirst = [...B.transcript];

const replay = deliverI1(A, B, u1!);
console.log(`2  A → B  (same U)`);
console.log(`   B ${formatI1(replay.recv)}`);
assert(replay.recv.kind === 'REPLAY', 'exact replay is REPLAY');
assert(replay.recv.kind !== 'FRAME', 'replay is not a second frame');

const u2 = encodeBound(GC42_SEED, 42, A.transcript, A.seen);
assert(!!u2, 'need a fresh realization after U1');
assert(u2 !== u1, 'fresh U is a different string');
const second = deliverI1(A, B, u2!);
console.log(`3  A → B  ${u2}`);
console.log(`   B ${formatI1(second.recv)}`);
assert(second.recv.kind === 'FRAME', 'fresh realization is a frame');
if (second.recv.kind === 'FRAME') {
  assert(second.recv.n === 42, 'fresh frame still recovers 42 under new bind');
}

assert(recoverPayload(u1!, [PROBE_EXAMPLE, ACK_EXAMPLE]) === 42, 'U1 payload at bind0');
if (transcriptBind(afterFirst) !== bind0) {
  assert(recoverPayload(u1!, afterFirst) !== 42, 'U1 payload is not 42 after transcript advanced');
}

const sA = new Agent('sA');
const sB = new Agent('sB');
deliver(sA, sB, PROBE_EXAMPLE);
deliver(sB, sA, ACK_EXAMPLE);
const bare = e1For(GC42_SEED, 42)[0]?.utterance;
assert(!!bare, 'S1 control needs unbound 42');
const sFirst = deliver(sA, sB, bare!);
const sReplay = deliver(sA, sB, bare!);
assert(sFirst.recv.kind === 'FRAME' && sReplay.recv.kind === 'FRAME', 'S1/X1 accepts the replay');
console.log(`S1 control: replay of the same U is a second FRAME (I1 is what changed)`);

const C = new I1Agent('C');
const D = new I1Agent('D');
deliverI1(C, D, PROBE_EXAMPLE);
deliverI1(D, C, ACK_EXAMPLE);
const cross = D.receive(u1!);
assert(cross.kind === 'FRAME', 'cloned handshake: first-frame cross-session replay still decodes');
if (cross.kind === 'FRAME') {
  assert(cross.n === 42, 'identical handshake strings ⇒ identical bind0');
}
console.log(`cross-session with cloned handshake: ${formatI1(cross)}  (recorded boundary)`);

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nP7-I1: in-session replay is REPLAY; fresh bound realization is GET CUSTOMER 42');
