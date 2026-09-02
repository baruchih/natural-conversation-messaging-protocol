/**
 * NCMP-C5-A. Availability of handshake-donated pairs.
 * Catalog declared before any eligibility of these strings was computed.
 * Same C5-P rule. Not the protocol. Does not change process.
 */
import { enumerate as enumerateAck } from './c2f.ts';
import { kSession32 } from './c2e.ts';
import { tState } from './c2b.ts';
import { pSec } from './c2d.ts';
import {
  eligiblePairs,
  finishPair,
  hasOrderedPair,
  startPair,
  type Pair,
} from './c5p.ts';
import { eligibleWords } from './c5e.ts';

export type Job = {
  readonly id: string;
  readonly scene: string;
  readonly u_probe: string;
  readonly u_ack: string;
};

/**
 * Ordinary handshake texts. Mix of short and medium turns.
 * Written before eligibleWords was evaluated on these strings.
 * Not steered onto T_probe / T_ack. Not C5-G's cafe/market.
 */
export const CATALOG: readonly Job[] = [
  {
    id: 'brief',
    scene: 'short walk ask',
    u_probe: "Walk later? I'll pack an umbrella.",
    u_ack: 'Okay, umbrella too.',
  },
  {
    id: 'coffee',
    scene: 'coffee after work',
    u_probe: "Coffee after work? I'll bring the umbrella.",
    u_ack: "Yes. I've got an umbrella.",
  },
  {
    id: 'train',
    scene: 'evening train',
    u_probe: "Catch the train at six? I'll have the umbrella with me.",
    u_ack: "Six works. I'll bring mine.",
  },
  {
    id: 'dinner',
    scene: 'dinner at eight',
    u_probe: "Dinner at eight still okay? I'll carry the umbrella over from the station.",
    u_ack: "Eight is perfect. I'll bring the umbrella and meet you outside.",
  },
  {
    id: 'movie',
    scene: 'movie tonight',
    u_probe: 'Want to see the movie tonight? I can bring the umbrella if it rains.',
    u_ack: "The movie works. I'll bring a jacket and the umbrella.",
  },
  {
    id: 'gym',
    scene: 'gym before lunch',
    u_probe: "Gym before lunch? I'll toss the umbrella in my bag.",
    u_ack: "See you there. I'll bring the umbrella just in case.",
  },
  {
    id: 'library',
    scene: 'library afternoon',
    u_probe: "Library this afternoon? I'll take the umbrella.",
    u_ack: 'Fine by me. Umbrella in my bag.',
  },
  {
    id: 'call',
    scene: 'call later',
    u_probe: "Can you call later? I'll stay in with the umbrella by the door.",
    u_ack: "I'll call after lunch. Keep the umbrella handy.",
  },
  {
    id: 'office',
    scene: 'office or home',
    u_probe: "Office or home today? I'll pack an umbrella either way.",
    u_ack: "Home works. I'll bring the umbrella if I step out.",
  },
  {
    id: 'beach',
    scene: 'beach morning',
    u_probe: "Beach in the morning? I'll still pack an umbrella for the wind.",
    u_ack: "Let's do the beach. I'll bring extra water and the umbrella.",
  },
  {
    id: 'pizza',
    scene: 'usual pizza place',
    u_probe: "Pizza at the usual place? I'll walk over with the umbrella.",
    u_ack: "Usual place is good. I'll bring cash and the umbrella.",
  },
  {
    id: 'garden',
    scene: 'garden Sunday',
    u_probe: "Help with the garden Sunday? I'll bring the umbrella if the forecast holds.",
    u_ack: "Sunday is good. I'll bring gloves and an umbrella.",
  },
];

export type Availability = {
  readonly id: string;
  readonly scene: string;
  readonly u_probe: string;
  readonly u_ack: string;
  readonly probe_eligible: readonly string[];
  readonly ack_eligible: readonly string[];
  readonly probe_ok: boolean;
  readonly ack_ok: boolean;
  readonly both_ok: boolean;
  readonly start_pair: Pair | null;
  readonly finish_pair: Pair | null;
  readonly k_session: number;
  readonly t_start: number;
  readonly t_finish: number;
};

export function availability(job: Job): Availability {
  const probe = eligibleWords(job.u_probe);
  const ack = eligibleWords(job.u_ack);
  const k = kSession32(job.u_probe, job.u_ack);
  return {
    id: job.id,
    scene: job.scene,
    u_probe: job.u_probe,
    u_ack: job.u_ack,
    probe_eligible: probe,
    ack_eligible: ack,
    probe_ok: probe.length >= 2,
    ack_ok: ack.length >= 2,
    both_ok: probe.length >= 2 && ack.length >= 2,
    start_pair: startPair(job.u_probe),
    finish_pair: finishPair(job.u_ack),
    k_session: k,
    t_start: tState('START', k),
    t_finish: tState('FINISH', k),
  };
}

export const CATALOG_AVAIL = CATALOG.map(availability);

export type AckPopRow = {
  readonly u: string;
  readonly eligible: readonly string[];
  readonly ok: boolean;
  readonly pair: Pair | null;
};

export function ackPopulation(utterances: readonly string[] = enumerateAck()): AckPopRow[] {
  return utterances.map((u) => {
    const eligible = eligibleWords(u);
    return {
      u,
      eligible,
      ok: eligible.length >= 2,
      pair: finishPair(u),
    };
  });
}

export const ACK_POP = ackPopulation();

export function isStartJob(utterance: string, job: Availability): boolean {
  return hasOrderedPair(utterance, job.start_pair) && pSec(utterance) === job.t_start;
}

export function isFinishJob(utterance: string, job: Availability): boolean {
  return hasOrderedPair(utterance, job.finish_pair) && pSec(utterance) === job.t_finish;
}

export type JobSlots = {
  readonly start_base: string;
  readonly start_slots: readonly (readonly string[])[];
  readonly finish_base: string;
  readonly finish_slots: readonly (readonly string[])[];
};

/**
 * START/FINISH spaces for jobs that donated both pairs.
 * Declared after the pairs were known, before any P_sec of a combination.
 * No umbrella.
 */
/** First steered hits. Null is a residual miss, not a retune. */
export const HITS = {
  train: { start: null, finish: "Alright, six works. I'll bring the notes over!" },
  dinner: { start: null, finish: 'Okay, I can bring the plan outside now!' },
  movie: { start: 'Tonight I can bring the plan. The show is fine!', finish: null },
  office: { start: null, finish: "Alright, that works. I'll bring the notes over." },
  beach: { start: 'The beach in the morning is fine. The wind looks fine!', finish: null },
  pizza: { start: null, finish: 'Okay, the place works. I can bring the list!' },
  garden: { start: null, finish: 'Okay, I can bring gloves. Sunday works.' },
} as const;

export const SLOTS: Readonly<Record<string, JobSlots>> = {
  train: {
    start_base: "Let's catch the train. Six is fine for me.",
    start_slots: [
      ["Let's catch", 'We can catch'],
      ['the train.', 'that train.'],
      ['Six is', 'Evening is'],
      ['fine', 'good'],
      ['for me', 'on my end'],
      ['.', '!'],
    ],
    finish_base: "Alright, six works. I'll bring the notes over.",
    finish_slots: [
      ['Alright,', 'Okay,'],
      ['six works.', 'that works.'],
      ["I'll bring", 'I can bring'],
      ['the notes', 'the plan'],
      ['over', 'along'],
      ['.', '!'],
    ],
  },
  dinner: {
    start_base: 'I can carry on from the station. Eight still works for me.',
    start_slots: [
      ['I can carry', 'We can carry'],
      ['on from the station.', 'over from the station.'],
      ['Eight still', 'Dinner still'],
      ['works', 'is fine'],
      ['for me', 'on my end'],
      ['.', '!'],
    ],
    finish_base: "Alright, I'll bring the notes outside now.",
    finish_slots: [
      ['Alright,', 'Okay,'],
      ["I'll bring", 'I can bring'],
      ['the notes', 'the plan'],
      ['outside', 'right outside'],
      ['now', 'shortly'],
      ['.', '!'],
    ],
  },
  movie: {
    start_base: 'Tonight I can bring the notes. The show works.',
    start_slots: [
      ['Tonight I can', 'Tonight we can'],
      ['bring', 'also bring'],
      ['the notes.', 'the plan.'],
      ['The show', 'The time'],
      ['works', 'is fine'],
      ['.', '!'],
    ],
    finish_base: "Alright, the movie is on. I'll grab a jacket.",
    finish_slots: [
      ['Alright,', 'Okay,'],
      ['the movie', 'that movie'],
      ['is on.', 'works.'],
      ["I'll grab", 'I have'],
      ['a jacket', 'my jacket'],
      ['.', '!'],
    ],
  },
  office: {
    start_base: 'Today either works. Home is ok.',
    start_slots: [
      ['Today', 'For today'],
      ['either', 'either option'],
      ['works.', 'is fine.'],
      ['Home', 'The office'],
      ['is ok', 'is good'],
      ['.', '!'],
    ],
    finish_base: "Alright, that works. I'll bring the notes over.",
    finish_slots: [
      ['Alright,', 'Okay,'],
      ['that works.', 'home works.'],
      ["I'll bring", 'I can bring'],
      ['the notes', 'the plan'],
      ['over', 'along'],
      ['.', '!'],
    ],
  },
  beach: {
    start_base: 'The beach in the morning works. The wind is ok.',
    start_slots: [
      ['The beach', 'Beach'],
      ['in the morning', 'this morning'],
      ['works.', 'is fine.'],
      ['The wind', 'The weather'],
      ['is ok', 'looks fine'],
      ['.', '!'],
    ],
    finish_base: "Alright, I'll bring extra water. See you there.",
    finish_slots: [
      ['Alright,', 'Okay,'],
      ["I'll bring", 'I can bring'],
      ['extra water.', 'extra bottles.'],
      ['See you', 'Meet you'],
      ['there', 'then'],
      ['.', '!'],
    ],
  },
  pizza: {
    start_base: 'The pizza place works. Usual time is good.',
    start_slots: [
      ['The pizza', 'That pizza'],
      ['place', 'place still'],
      ['works.', 'is fine.'],
      ['Usual time', 'Tonight'],
      ['is good', 'works too'],
      ['.', '!'],
    ],
    finish_base: "Alright, that place works. I'll bring cash.",
    finish_slots: [
      ['Alright,', 'Okay,'],
      ['that place', 'the place'],
      ['works.', 'is good.'],
      ["I'll bring", 'I can bring'],
      ['cash', 'the list'],
      ['.', '!'],
    ],
  },
  garden: {
    start_base: 'I can bring tools if the forecast holds. Sunday works.',
    start_slots: [
      ['I can bring', 'We can bring'],
      ['tools if the forecast', 'stuff if the forecast'],
      ['holds.', 'is fine.'],
      ['Sunday', 'The morning'],
      ['works', 'is good'],
      ['.', '!'],
    ],
    finish_base: "Alright, I'll bring gloves. Sunday is good.",
    finish_slots: [
      ['Alright,', 'Okay,'],
      ["I'll bring", 'I can bring'],
      ['gloves.', 'the gloves.'],
      ['Sunday', 'The morning'],
      ['is good', 'works'],
      ['.', '!'],
    ],
  },
};

export { eligiblePairs, eligibleWords, hasOrderedPair, pSec };
