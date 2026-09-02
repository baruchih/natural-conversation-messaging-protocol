/**
 * C5-S shadow machine. Two implementations. Prefix agreement.
 *   npm run test:v4-c5s
 *
 * Research shadow of C5-U. C5-U is now process. Donated / hybrid / derived frame cues.
 */
import { EXAMPLES, isStart, kSession32, type Profile } from '../ncmp/reference/ncmp.ts';
import { CATALOG } from './c5a.ts';
import { U_FINISH_C5P, U_START_C5P } from './c5p.ts';
import { Shadow, finishPairS, isFinishS, isStartS, startPairS } from './c5s.ts';
import { shadowRefFresh, shadowRefInstall, shadowRefProcess, shadowRefState } from './c5s.ref.ts';
import { CUES, FILL_HITS } from './c5u.ts';
import type { Outcome, Speaker } from '../ncmp/reference/ncmp.ts';
import type { ShadowState } from './c5s.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const A_SKIP = 'How was dinner last night after you sat down?';
const B_PEER = 'The pasta was decent and the bread came out warm.';
const SYM_0A = 'Yes, the park gate works if we leave early.';
const SYM_0B = 'I packed two bottles and left the extra sweater.';
const SYM_10 = 'Should we grab some fresh bread at the market, or do you think we should just bake it later?';
const SYM_11 = 'What do you think about cooking at home with all our fresh finds, or should we go out and eat instead?';
const SYM_11B = 'Do you think we should bring jackets this time?';
const FINAL_1 = 'Mostly yes and the coffee almost made up for it.';
const PRE = 'Saturday still work for you?';
const POST = 'See you at the gate.';
const HINTED_CHAT = "I'll bring an umbrella.";

const brief = CATALOG.find((j) => j.id === 'brief')!;
const gym = CATALOG.find((j) => j.id === 'gym')!;
function sameState(a: ShadowState, b: ShadowState): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function pair(profile?: Profile) {
  const impl = new Shadow(profile);
  const ref = shadowRefFresh(profile);
  return {
    process(speaker: Speaker, utterance: string): Outcome {
      const oa = impl.process(speaker, utterance);
      const ob = shadowRefProcess(ref, speaker, utterance);
      assert(oa === ob, `machines ${speaker}: ${oa} vs referee ${ob} @ ${utterance.slice(0, 56)}`);
      assert(impl.bits === ref.bits, `machines bits ${impl.bits} vs ${ref.bits}`);
      assert(sameState(impl.state, shadowRefState(ref)), `machines state diverge after ${utterance.slice(0, 56)}`);
      return oa;
    },
    install(uProbe: string, uAck: string): void {
      impl.installHandshake(uProbe, uAck);
      shadowRefInstall(ref, uProbe, uAck);
      assert(sameState(impl.state, shadowRefState(ref)), 'install state');
    },
    get state() {
      return impl.state;
    },
  };
}

const K_WALK = kSession32(EXAMPLES.PROBE, EXAMPLES.ACK);
assert(startPairS(EXAMPLES.PROBE, K_WALK)[0] === 'saturday', 'walk START pair');
assert(finishPairS(EXAMPLES.ACK, K_WALK)[1] === 'bring', 'walk FINISH pair');
assert(isStartS(U_START_C5P, EXAMPLES.PROBE, K_WALK), 'donated START');
assert(isFinishS(U_FINISH_C5P, EXAMPLES.ACK, K_WALK), 'donated FINISH');
assert(!isStartS(EXAMPLES.FINISH, EXAMPLES.PROBE, K_WALK), 'FINISH is not shadow START');
assert(isFinishS(EXAMPLES.FINISH, EXAMPLES.ACK, K_WALK), 'published FINISH is the pair');
assert(isStart(EXAMPLES.START_5, EXAMPLES.PROBE, K_WALK), 'v0.1 START is the pair');
assert(!isStartS(HINTED_CHAT, EXAMPLES.PROBE, K_WALK), 'umbrella alone is not shadow START');

assert(pair().process('A', PRE) === 'NOT_NCMP', 'ordinary before PROBE');

const walk = pair();
assert(walk.process('A', EXAMPLES.PROBE) === 'PROBE', 'walk PROBE');
assert(walk.process('B', EXAMPLES.ACK) === 'ACK', 'walk ACK');
assert(walk.process('A', 'Hi.') === 'CHAT', 'session CHAT');
assert(walk.process('A', HINTED_CHAT) === 'CHAT', 'umbrella without pair is CHAT');
assert(walk.process('A', EXAMPLES.FINISH) === 'NO_FRAME', 'FINISH with no frame');
assert(walk.process('A', U_START_C5P) === 'START', 'donated START');
assert(walk.state.frame?.argument_bits === 5, 'walk declares 5');
assert(walk.process('A', U_START_C5P) === 'NEST', 'NEST');
assert(walk.process('B', U_FINISH_C5P) === 'NOT_OWNER', 'peer FINISH');
assert(walk.process('A', A_SKIP) === 'BODY_SKIP', 'owner SKIP');
assert(walk.process('B', B_PEER) === 'BODY_SKIP', 'peer BODY');
assert(walk.process('A', SYM_0A) === 'BODY_DATA', 'header ACTION');
assert(walk.process('A', SYM_0B) === 'BODY_DATA', 'header RESOURCE');
assert(walk.process('A', SYM_10) === 'BODY_DATA', 'DATA 10');
assert(walk.process('B', SYM_11B) === 'BODY_SKIP', 'peer during DATA');
assert(walk.process('A', SYM_11) === 'BODY_DATA', 'DATA 11');
assert(walk.process('A', FINAL_1) === 'BODY_DATA', 'final bit');
assert(walk.process('A', U_FINISH_C5P) === 'FINISH_ARGUMENT', 'donated FINISH');
assert(walk.state.last_object?.action === 'GET', 'GET');
assert(walk.state.last_object?.resource === 'CUSTOMER', 'CUSTOMER');
assert(walk.state.last_object?.argument === '10111', 'published argument');
assert(walk.process('A', POST) === 'CHAT', 'ordinary after FINISH');

const leftover = pair();
leftover.process('A', EXAMPLES.PROBE);
leftover.process('B', EXAMPLES.ACK);
leftover.process('A', U_START_C5P);
leftover.process('A', A_SKIP);
assert(leftover.process('A', U_FINISH_C5P) === 'INCOMPLETE', 'FINISH with remaining > 0');

const hybrid = pair();
hybrid.install(brief.u_probe, brief.u_ack);
const briefCue = CUES.find((c) => c.id === 'brief')!;
assert(briefCue.start.source === 'hybrid' && briefCue.finish.source === 'derived', 'brief sources');
assert(hybrid.process('A', FILL_HITS.brief.start) === 'START', 'hybrid START');
assert(hybrid.state.frame?.argument_bits === 0, 'brief declares 0');
assert(hybrid.process('A', FILL_HITS.brief.finish) === 'INCOMPLETE', 'empty START then immediate FINISH');

const hybridFull = pair();
hybridFull.install(brief.u_probe, brief.u_ack);
assert(hybridFull.process('A', FILL_HITS.brief.finish) === 'NO_FRAME', 'derived FINISH with no frame');
assert(hybridFull.process('A', FILL_HITS.brief.start) === 'START', 'hybrid START again');
assert(hybridFull.process('A', A_SKIP) === 'BODY_SKIP', 'brief SKIP');
assert(hybridFull.process('A', SYM_0A) === 'BODY_DATA', 'brief header 0');
assert(hybridFull.process('A', SYM_0B) === 'BODY_DATA', 'brief header 0');
assert(hybridFull.process('A', FILL_HITS.brief.finish) === 'FINISH_ARGUMENT', 'derived FINISH');
assert(hybridFull.state.last_object?.action === 'GET', 'brief GET');
assert(hybridFull.state.last_object?.resource === 'CUSTOMER', 'brief CUSTOMER');
assert(hybridFull.state.last_object?.argument === '', 'brief empty argument');
assert(hybridFull.process('A', HINTED_CHAT) === 'CHAT', 'umbrella after brief frame is CHAT');

const derivedGym = pair();
derivedGym.install(gym.u_probe, gym.u_ack);
const gymCue = CUES.find((c) => c.id === 'gym')!;
assert(gymCue.start.source === 'hybrid' && gymCue.finish.source === 'hybrid', 'gym sources');
assert(derivedGym.process('A', FILL_HITS.gym.start) === 'START', 'gym START');
assert(derivedGym.state.frame?.argument_bits === 5, 'gym declares 5');
assert(derivedGym.process('A', A_SKIP) === 'BODY_SKIP', 'gym SKIP');
assert(derivedGym.process('B', B_PEER) === 'BODY_SKIP', 'gym peer');
assert(derivedGym.process('A', SYM_0A) === 'BODY_DATA', 'gym header ACTION');
assert(derivedGym.process('A', SYM_0B) === 'BODY_DATA', 'gym header RESOURCE');
assert(derivedGym.process('A', SYM_10) === 'BODY_DATA', 'gym DATA 10');
assert(derivedGym.process('B', SYM_11B) === 'BODY_SKIP', 'gym peer DATA');
assert(derivedGym.process('A', SYM_11) === 'BODY_DATA', 'gym DATA 11');
assert(derivedGym.process('A', FINAL_1) === 'BODY_DATA', 'gym final bit');
assert(derivedGym.process('A', FILL_HITS.gym.finish) === 'FINISH_ARGUMENT', 'gym FINISH');
assert(derivedGym.state.last_object?.argument === '10111', 'gym published argument');

const reservedProfile: Profile = { actions: ['GET', 'SET', 'DELETE'], resources: ['CUSTOMER', 'ORDER'] };
const reserved = pair(reservedProfile);
reserved.install(brief.u_probe, brief.u_ack);
reserved.process('A', FILL_HITS.brief.start);
reserved.process('A', A_SKIP);
reserved.process('B', B_PEER);
reserved.process('A', SYM_11);
reserved.process('A', SYM_0A);
assert(reserved.process('A', FILL_HITS.brief.finish) === 'HEADER_RESERVED', 'unused codebook pattern');

if (failed > 0) {
  console.error(`${failed} failed`);
  process.exit(1);
}
console.log('C5-S shadow machine ok');
