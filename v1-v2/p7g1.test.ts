/**
 * P7-G1 offline: δ and C6-HY decide. The LM is not in this file.
 *   npm run test:g1
 */
import { decode as decodeN } from './p7c6.ts';
import { decodeD } from './p7d1.ts';
import { decodeE } from './p7e1.ts';
import { decodeE2 } from './p7e2.ts';
import { carrierNovelty, finishN, scoreProposal } from './p7g1.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const echo = 'Did we find the restaurant was good but service was slow for whoever held it?';
const template = 'Did we find the restaurant was good but service was slow for that holder?';
const poleSwap = 'Did we find the place was decent though staff was delayed for anyone seated?';
const novel = 'Did we notice the kitchen felt solid yet the wait seemed sluggish around whoever held it?';
const nearMiss = 'Did we find the restaurant was good but service was slow for whoever ate there?';
const magic = 'Did we find the restaurant was good but service was slow for the customer?';

console.log('P7-G1  generation pipeline  (LM does not decode, does not search N)\n');

assert(scoreProposal(echo).deHit, 'echo DE');
assert(scoreProposal(echo).novelty === 'echo', 'echo class');
assert(scoreProposal(template).novelty === 'template', 'template class');
assert(scoreProposal(poleSwap).deHit, 'pole-swap DE');
assert(scoreProposal(poleSwap).novelty === 'pole_swap', 'pole-swap class');
assert(scoreProposal(novel).deHit, 'novel DE');
assert(scoreProposal(novel).novelty === 'novel', 'novel class');

assert(decodeE(echo) === 'NONE', 'echo is E1-invisible');
assert(decodeE2(echo) === 'CUSTOMER', 'echo is E2 CUSTOMER');
assert(scoreProposal(nearMiss).deHit === false, 'whoever ate there is not DE');
assert(scoreProposal(nearMiss).e === 'NONE', 'near-miss E');
assert(scoreProposal(magic).deHit === false, 'magic noun rejected');
assert(carrierNovelty(nearMiss, false) === 'reject', 'reject novelty');

const finished = finishN(novel, 42);
assert(finished.score.deHit, 'novel is finishable');
assert(finished.nHit, 'C6-HY hits 42 from a novel carrier');
assert(!!finished.finished, 'finished utterance exists');
if (finished.finished) {
  assert(decodeD(finished.finished) === 'GET', 'finished D');
  assert(decodeE2(finished.finished) === 'CUSTOMER', 'finished E');
  assert(decodeN(finished.finished) === 42, 'finished N');
  console.log(`GET CUSTOMER 42 from novel carrier via C6-HY`);
  console.log(`  in  ${novel}`);
  console.log(`  out ${finished.finished}`);
  console.log(`  solutions ${finished.solutions}`);
}

const miss = finishN(nearMiss, 42);
assert(!miss.nHit && miss.finished === null, 'near-miss cannot be finished');

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nP7-G1: novelty classes and N-finish are deterministic; LM is not the judge');
