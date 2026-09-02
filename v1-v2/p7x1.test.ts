/**
 * P7-X1: two independent agents. No new semantics.
 *   npm run test:x1
 */
import { e1For } from './p7e1.ts';
import { ACK_EXAMPLE, Agent, PROBE_EXAMPLE } from './p7s1.ts';
import { deliver, formatResult } from './p7x1.ts';

const GC42_SEED = 'Did we find the restaurant was good but service was slow for that party?';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

function line(turn: ReturnType<typeof deliver>): void {
  console.log(`${turn.from} → ${turn.to}`);
  console.log(`  "${turn.utterance}"`);
  console.log(`  ${turn.from}: ${formatResult(turn.sent)} → ${turn.senderMode}`);
  console.log(`  ${turn.to}: ${formatResult(turn.recv)} → ${turn.receiverMode}`);
}

const gc42 = e1For(GC42_SEED, 42)[0]?.utterance;
assert(!!gc42, 'need the published GET CUSTOMER 42 realization');

console.log('P7-X1  two-agent exchange  (published S1 + E1 only)\n');

const controlA = new Agent('A');
const controlB = new Agent('B');
const control = deliver(controlA, controlB, gc42!);
console.log('CONTROL  application sentence before handshake');
line(control);
assert(controlA.mode === 'idle' && controlB.mode === 'idle', 'control stays idle');
assert(control.sent.kind === 'NOT_NCMP', 'idle sender: ordinary language');
assert(control.recv.kind === 'NOT_NCMP', 'idle receiver: NOT_NCMP');

console.log('\nEXCHANGE');
const A = new Agent('A');
const B = new Agent('B');
assert(A.mode === 'idle' && B.mode === 'idle', 'both start idle');

const probe = deliver(A, B, PROBE_EXAMPLE);
line(probe);
assert(probe.sent.kind === 'PROBE' && A.mode === 'ack_wait', 'A sent probe → ack_wait');
assert(probe.recv.kind === 'PROBE' && B.mode === 'ack_required', 'B heard probe → ack_required');

const early = B.receive(gc42!);
assert(early.kind === 'NOT_NCMP', 'B still NOT_NCMP before ACK');
assert(B.mode === 'ack_required', 'unfinished handshake is not active');

const ack = deliver(B, A, ACK_EXAMPLE);
line(ack);
assert(ack.sent.kind === 'ACK' && B.mode === 'active', 'B sent ACK → active');
assert(ack.recv.kind === 'ACK' && A.mode === 'active', 'A heard ACK → active');

const app = deliver(A, B, gc42!);
line(app);
assert(app.recv.kind === 'FRAME', 'active receiver reconstructs a frame');
if (app.recv.kind === 'FRAME') {
  assert(app.recv.d === 'GET', 'D');
  assert(app.recv.e === 'CUSTOMER', 'E');
  assert(app.recv.n === 42, 'N');
}

assert(A !== B, 'independent agent objects');
assert(controlA !== A && controlB !== B, 'control runtimes are separate');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nP7-X1: same U is NOT_NCMP before handshake and GET CUSTOMER 42 after');
