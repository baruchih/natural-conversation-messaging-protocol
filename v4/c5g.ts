/**
 * NCMP-C5-G. Pair donation across predeclared jobs.
 * Handshake texts declared before pairs or residuals were known.
 * Same C5-P rule. Not the protocol. Does not change process.
 */
import { tAck6, kSession32 } from './c2e.ts';
import { hasHint, isProbeC2D, pSec } from './c2d.ts';
import { tState } from './c2b.ts';
import {
  eligiblePairs,
  finishPair,
  hasOrderedPair,
  startPair,
  type Pair,
} from './c5p.ts';
import { eligibleWords } from './c5e.ts';
import { U_ACK as WALK_ACK, U_PROBE as WALK_PROBE } from './c5p.ts';

export type Job = {
  readonly id: string;
  readonly scene: string;
  readonly u_probe: string;
  readonly u_ack: string;
};

/**
 * Predeclared jobs. Walk is the frozen C5-P handshake.
 * Cafe and market are different scenes, written as complete turns
 * before any pair or P_sec of those strings was computed.
 */
export const JOBS: readonly Job[] = [
  {
    id: 'walk',
    scene: 'Saturday morning walk',
    u_probe: WALK_PROBE,
    u_ack: WALK_ACK,
  },
  {
    id: 'cafe',
    scene: 'rain, stay at the coffee shop',
    u_probe:
      "The rain looks serious. Want to just sit at the coffee shop this afternoon? I'll keep the umbrella handy in case we change our minds.",
    u_ack: "Yes, the coffee shop works. I'll bring my umbrella and grab a table by the window.",
  },
  {
    id: 'market',
    scene: 'afternoon market before closing',
    u_probe: 'Should we try the market before it closes? I can pack the umbrella if the clouds stay.',
    u_ack: "Let's do the market. I'll bring a spare bag and the umbrella.",
  },
];

export type JobDerived = {
  readonly id: string;
  readonly scene: string;
  readonly u_probe: string;
  readonly u_ack: string;
  readonly probe_eligible: readonly string[];
  readonly ack_eligible: readonly string[];
  readonly probe_pairs: readonly Pair[];
  readonly ack_pairs: readonly Pair[];
  readonly start_pair: Pair | null;
  readonly finish_pair: Pair | null;
  readonly k_session: number;
  readonly t_start: number;
  readonly t_finish: number;
  readonly probe_is_bootstrap: boolean;
  readonly ack_is_bootstrap: boolean;
};

export function deriveJob(job: Job): JobDerived {
  const k = kSession32(job.u_probe, job.u_ack);
  return {
    id: job.id,
    scene: job.scene,
    u_probe: job.u_probe,
    u_ack: job.u_ack,
    probe_eligible: eligibleWords(job.u_probe),
    ack_eligible: eligibleWords(job.u_ack),
    probe_pairs: eligiblePairs(job.u_probe),
    ack_pairs: eligiblePairs(job.u_ack),
    start_pair: startPair(job.u_probe),
    finish_pair: finishPair(job.u_ack),
    k_session: k,
    t_start: tState('START', k),
    t_finish: tState('FINISH', k),
    probe_is_bootstrap: isProbeC2D(job.u_probe),
    ack_is_bootstrap: hasHint(job.u_ack) && pSec(job.u_ack) === tAck6(job.u_probe),
  };
}

export const DERIVED = JOBS.map(deriveJob);

export function isStartJob(utterance: string, job: JobDerived): boolean {
  return hasOrderedPair(utterance, job.start_pair) && pSec(utterance) === job.t_start;
}

export function isFinishJob(utterance: string, job: JobDerived): boolean {
  return hasOrderedPair(utterance, job.finish_pair) && pSec(utterance) === job.t_finish;
}

export type JobSlots = {
  readonly start_base: string;
  readonly start_slots: readonly (readonly string[])[];
  readonly finish_base: string;
  readonly finish_slots: readonly (readonly string[])[];
};

/**
 * START/FINISH spaces declared after the pairs were known,
 * before any P_sec of a combination. No umbrella.
 */
/** First steered hits under each job's donated pair. */
export const HITS = {
  walk: {
    start: 'We can set off Saturday in the morning. The park works!',
    finish: "Alright, that sounds good. I'll bring the notes.",
  },
  cafe: {
    start: "Weather is quite serious. We're of two minds on heading out!",
    finish: "Alright, that works. I'll bring the notes along.",
  },
  market: {
    start: "Let's go before the place closes. When the clouds hold we're fine.",
    finish: 'Alright, the market works for me. I can bring the bag!',
  },
} as const;

export const SLOTS: Readonly<Record<string, JobSlots>> = {
  walk: {
    start_base: 'We can head out Saturday morning. The park works.',
    start_slots: [
      ['We can', "Let's"],
      ['head out', 'set off'],
      ['Saturday morning.', 'Saturday in the morning.'],
      ['The park', 'The gate'],
      ['works', 'is fine'],
      ['.', '!'],
    ],
    finish_base: "Alright, it sounds settled. I'll bring the notes.",
    finish_slots: [
      ['Alright,', 'Okay,'],
      ['it sounds', 'that sounds'],
      ['settled.', 'good.'],
      ["I'll bring", 'I can bring'],
      ['the notes', 'the plan'],
      ['.', '!'],
    ],
  },
  cafe: {
    start_base: "The rain looks serious. I'm of two minds about going out.",
    start_slots: [
      ['The rain looks', 'Weather is'],
      ['serious.', 'quite serious.'],
      ["I'm of two", "We're of two"],
      ['minds about', 'minds on'],
      ['going out', 'heading out'],
      ['.', '!'],
    ],
    finish_base: "Alright, coffee works. I'll bring the notes over.",
    finish_slots: [
      ['Alright,', 'Okay,'],
      ['coffee works.', 'that works.'],
      ["I'll bring", 'I can bring'],
      ['the notes', 'the plan'],
      ['over', 'along'],
      ['.', '!'],
    ],
  },
  market: {
    start_base: "Let's go before it closes. If the clouds hold we're fine.",
    start_slots: [
      ["Let's go", 'We can go'],
      ['before it closes.', 'before the place closes.'],
      ['If the clouds', 'When the clouds'],
      ['hold', 'stay'],
      ["we're fine", "we're good"],
      ['.', '!'],
    ],
    finish_base: "Alright, the market is the plan. I'll bring the list.",
    finish_slots: [
      ['Alright,', 'Okay,'],
      ['the market', 'that market'],
      ['is the plan.', 'works for me.'],
      ["I'll bring", 'I can bring'],
      ['the list', 'the bag'],
      ['.', '!'],
    ],
  },
};

export { hasOrderedPair, pSec };
