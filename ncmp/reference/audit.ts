/**
 * Publication audit: every published C6 value and control residual
 * in NCMP.md must match the reference machine.
 */
import {
  EXAMPLES,
  argumentLength,
  c6,
  isAck,
  isFinish,
  isProbe,
  isStart,
  kSession32,
  pSec,
  tAck,
  tProbe,
  tState,
} from './ncmp.ts';

const rows: Array<[string, number]> = [
  ['Want to walk before the shops get busy?', 16],
  ['The tea in the flask is still warm enough.', 5],
  ['Let us close this round here.', 39],
  ['Hi.', 17],
  ["Let's meet around 7:30 before the lot fills up.", 14],
  ['How was dinner last night after you sat down?', 22],
  ['The pasta was decent and the bread came out warm.', 15],
  ['Yes, the park gate works if we leave early.', 12],
  ['I packed two bottles and left the extra sweater.', 6],
  ['Should we grab some fresh bread at the market, or do you think we should just bake it later?', 19],
  ['Do you think we should bring jackets this time?', 23],
  ['What do you think about cooking at home with all our fresh finds, or should we go out and eat instead?', 11],
  ['Mostly yes and the coffee almost made up for it.', 5],
  ['Fine by me.', 15],
  ['Keep it simple.', 12],
];

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

for (const [u, v] of rows) {
  assert(c6(u) === v, `C6 ${JSON.stringify(u)} = ${c6(u)}, published ${v}`);
}

assert(tProbe() === 0x01, `T_probe ${tProbe().toString(16)}`);
assert(isProbe(EXAMPLES.PROBE), 'published PROBE');
assert(pSec(EXAMPLES.PROBE) === 0x01, `P_sec(PROBE) ${pSec(EXAMPLES.PROBE).toString(16)}`);
assert(tAck(EXAMPLES.PROBE) === 0x0f, `T_ack ${tAck(EXAMPLES.PROBE).toString(16)}`);
assert(isAck(EXAMPLES.ACK, EXAMPLES.PROBE), 'published ACK');
assert(pSec(EXAMPLES.ACK) === 0x0f, `P_sec(ACK) ${pSec(EXAMPLES.ACK).toString(16)}`);
assert(kSession32(EXAMPLES.PROBE, EXAMPLES.ACK) === 0xdca0b418, 'K_session');
const k = 0xdca0b418;
assert(tState('START', k) === 0x25, 'T_START');
assert(tState('FINISH', k) === 0x08, 'T_FINISH');
assert(isStart(EXAMPLES.START_5, EXAMPLES.PROBE, k) && argumentLength(EXAMPLES.START_5, k) === 5, 'START 5');
assert(argumentLength(EXAMPLES.L0, k) === 0, 'L 0');
assert(argumentLength(EXAMPLES.L8, k) === 8, 'L 8');
assert(argumentLength(EXAMPLES.L128, k) === 128, 'L 128');
assert(isFinish(EXAMPLES.FINISH, EXAMPLES.ACK, k), 'FINISH');
assert(pSec(EXAMPLES.FINISH) === 0x08, `P_sec(FINISH) ${pSec(EXAMPLES.FINISH).toString(16)}`);

if (failed > 0) {
  console.error(`${failed} audit failures`);
  process.exit(1);
}
console.log('publication values match the machine');
