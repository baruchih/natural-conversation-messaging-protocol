/**
 * V4-F1: variable-length application frames. No K4. No payload.
 *   npm run test:v4-f1
 */
import { isAck, isProbe } from '../v1-v2/p7s1.ts';
import {
  BODY_LENGTHS,
  DINNER_BODY,
  FINISH_EXAMPLE,
  Participant,
  START_EXAMPLE,
  deliver,
  frameDigest,
  framesEqual,
  handshake,
  isFinish,
  isStart,
  runFrame,
} from './f1.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(isStart(START_EXAMPLE), 'start example');
assert(isFinish(FINISH_EXAMPLE), 'finish example');
assert(!isStart(FINISH_EXAMPLE), 'finish is not start');
assert(!isFinish(START_EXAMPLE), 'start is not finish');
assert(!isProbe(START_EXAMPLE) && !isAck(START_EXAMPLE), 'start is not S1');
assert(!isProbe(FINISH_EXAMPLE) && !isAck(FINISH_EXAMPLE), 'finish is not S1');
for (const u of DINNER_BODY) {
  assert(!isStart(u) && !isFinish(u) && !isProbe(u) && !isAck(u), `body is ordinary: ${u}`);
}

const idle = new Participant('I');
assert(idle.send(START_EXAMPLE).kind === 'NOT_NCMP', 'START before session');
assert(idle.session === 'idle', 'idle stays idle');
assert(idle.frame === 'none', 'no frame while idle');

const a = new Participant('A');
const b = new Participant('B');
handshake(a, b);
assert(a.session === 'active' && b.session === 'active', 'S1 handshake');
assert(a.frame === 'none' && b.frame === 'none', 'no frame yet');

assert(deliver(a, b, FINISH_EXAMPLE).left.kind === 'NO_FRAME', 'FINISH with no frame');
assert(a.frame === 'none' && b.frame === 'none', 'still no frame');
assert(a.session === 'active' && b.session === 'active', 'session stays active');

assert(deliver(a, b, DINNER_BODY[0]).left.kind === 'CHAT', 'ordinary text is not a frame');
assert(a.frame === 'none' && a.completed.length === 0, 'chat does not open');

console.log('V4-F1  START / BODY / FINISH\n');
console.log('len  body  digest');

const cases = BODY_LENGTHS.map((n) => DINNER_BODY.slice(0, n));
for (const body of cases) {
  const left = new Participant('A');
  const right = new Participant('B');
  handshake(left, right);
  const frame = runFrame(left, right, body);
  assert(left.session === 'active' && right.session === 'active', `${body.length} session`);
  assert(left.frame === 'none' && right.frame === 'none', `${body.length} closed`);
  assert(left.completed.length === 1 && right.completed.length === 1, `${body.length} one frame`);
  assert(frame.body.length === body.length, `${body.length} body length`);
  assert(framesEqual(left.completed[0], right.completed[0]), `${body.length} agreed`);
  assert(frameDigest(left.completed[0]) === frameDigest(frame), `${body.length} digest`);
  console.log(`${String(body.length).padEnd(3)}  ${body.length}     ${frameDigest(frame).slice(0, 16)}`);
}

const again = new Participant('A');
const peer = new Participant('B');
handshake(again, peer);
const first = runFrame(again, peer, DINNER_BODY.slice(0, 1));
const second = runFrame(again, peer, DINNER_BODY.slice(0, 4));
assert(again.completed.length === 2 && peer.completed.length === 2, 'second frame after FINISH');
assert(again.session === 'active', 'session still active');
assert(frameDigest(first) !== frameDigest(second), 'different lengths differ');
assert(framesEqual(again.completed[0], peer.completed[0]), 'first frame agreed');
assert(framesEqual(again.completed[1], peer.completed[1]), 'second frame agreed');

deliver(again, peer, START_EXAMPLE);
const nest = deliver(again, peer, START_EXAMPLE);
assert(nest.left.kind === 'NEST' && nest.right.kind === 'NEST', 'no nested START');
assert(again.frame === 'open' && again.completed.length === 2, 'still one open frame');
deliver(again, peer, DINNER_BODY[1]);
deliver(again, peer, FINISH_EXAMPLE);
assert(again.completed.length === 3, 'FINISH after ignored START');
assert(again.completed[2].body.length === 1, 'nested START was not a body turn');
assert(framesEqual(again.completed[2], peer.completed[2]), 'post-nest frame agreed');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV4-F1: window ≠ frame; frozen');
