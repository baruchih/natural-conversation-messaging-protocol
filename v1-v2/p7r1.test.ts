/**
 * P7-R1 offline: published rewrites. The intermediary is not NCMP.
 *   npm run test:r1
 */
import { decodeD } from './p7d1.ts';
import { decodeE } from './p7e1.ts';
import { ACK_EXAMPLE, PROBE_EXAMPLE } from './p7s1.ts';
import { I1Agent, recoverPayload } from './p7i1.ts';
import { R1_SOURCE, scoreRewrite } from './p7r1.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const identity = scoreRewrite(R1_SOURCE, R1_SOURCE);
const poleSwap = scoreRewrite(
  R1_SOURCE,
  'Did we find the restaurant was good yet service was slow for that party this evening?',
);
const ordinary = scoreRewrite(
  R1_SOURCE,
  'Did we think dinner was tasty even though the waiters took forever for that group tonight?',
);

console.log('P7-R1  rewriting  (semantic preservation ≠ protocol preservation)\n');
console.log(`source  D=${identity.dSource} E=${identity.eSource} N=${identity.nSource}`);
console.log(`  identity   D=${identity.dSame} E=${identity.eSame} N=${identity.nSame} frame=${identity.frameSame}`);
console.log(`  pole-swap  D=${poleSwap.dSame} E=${poleSwap.eSame} N=${poleSwap.nSame} frame=${poleSwap.frameSame}`);
console.log(`  ordinary   D=${ordinary.dSame} E=${ordinary.eSame} N=${ordinary.nSame} frame=${ordinary.frameSame}`);

assert(decodeD(R1_SOURCE) === 'GET' && decodeE(R1_SOURCE) === 'CUSTOMER', 'source is GET CUSTOMER');
assert(identity.frameSame, 'identity preserves the frame');
assert(poleSwap.dSame && poleSwap.eSame, 'tiny pole swap keeps D and E');
assert(!poleSwap.nSame, 'tiny pole swap changes N');
assert(!ordinary.eSame, 'ordinary paraphrase drops the E construction');
assert(!ordinary.nSame, 'ordinary paraphrase changes N');
assert(!ordinary.frameSame, 'ordinary paraphrase is not the same frame');

const A = new I1Agent('A');
const B = new I1Agent('B');
A.send(PROBE_EXAMPLE);
B.receive(PROBE_EXAMPLE);
B.send(ACK_EXAMPLE);
A.receive(ACK_EXAMPLE);
const afterHandshake = [...B.transcript];
const rewrittenRecv = B.receive(ordinary.rewritten);
const rewrittenN = recoverPayload(ordinary.rewritten, afterHandshake);
console.log(`  I1 after ordinary rewrite: ${rewrittenRecv.kind}  recoveredN=${rewrittenN}`);
assert(rewrittenRecv.kind !== 'FRAME' || rewrittenN !== 42, 'I1 does not recover 42 from a semantic rewrite');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nP7-R1: identity holds; ordinary paraphrase is not protocol-preserving');
