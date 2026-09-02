/**
 * NCMP-C5-H. Pair when donated, session word when not.
 * Hierarchy declared before fallback words were known. Not the protocol.
 */
import { fnv1a32 } from './c1.ts';
import { pSec } from './c2d.ts';
import { SESSION_WORDS } from './c4.ts';
import { CATALOG_AVAIL, type Availability } from './c5a.ts';
import { hasWord } from './c5e.ts';
import { finishPair, hasOrderedPair, startPair, type Pair } from './c5p.ts';

const utf8 = new TextEncoder();

export type PairHint = { readonly kind: 'pair'; readonly pair: Pair };
export type WordHint = { readonly kind: 'word'; readonly word: string };
export type Hint = PairHint | WordHint;

/**
 * Session fallback. Same list as C4. Role-tagged so START and FINISH
 * can differ. Tags 0x08 / 0x09 are new; not C4's single 0x03 word.
 */
export function sessionWord(session: number, role: 'START' | 'FINISH'): string {
  const tag = role === 'START' ? 0x08 : 0x09;
  const prefix = Uint8Array.of(
    (session >>> 24) & 0xff,
    (session >>> 16) & 0xff,
    (session >>> 8) & 0xff,
    session & 0xff,
    tag,
  );
  const label = utf8.encode(role);
  const bytes = new Uint8Array(prefix.length + label.length);
  bytes.set(prefix);
  bytes.set(label, prefix.length);
  return SESSION_WORDS[fnv1a32(bytes) % SESSION_WORDS.length];
}

/** Handshake-only. Later U is not an input. */
export function startHint(job: Availability): Hint {
  const pair = startPair(job.u_probe);
  if (pair !== null) return { kind: 'pair', pair };
  return { kind: 'word', word: sessionWord(job.k_session, 'START') };
}

export function finishHint(job: Availability): Hint {
  const pair = finishPair(job.u_ack);
  if (pair !== null) return { kind: 'pair', pair };
  return { kind: 'word', word: sessionWord(job.k_session, 'FINISH') };
}

export function hasHint(utterance: string, hint: Hint): boolean {
  return hint.kind === 'pair' ? hasOrderedPair(utterance, hint.pair) : hasWord(utterance, hint.word);
}

export function isStartH(utterance: string, job: Availability): boolean {
  return hasHint(utterance, startHint(job)) && pSec(utterance) === job.t_start;
}

export function isFinishH(utterance: string, job: Availability): boolean {
  return hasHint(utterance, finishHint(job)) && pSec(utterance) === job.t_finish;
}

export type JobHints = {
  readonly id: string;
  readonly start: Hint;
  readonly finish: Hint;
  readonly unused_start_word: string;
  readonly unused_finish_word: string;
  readonly t_start: number;
  readonly t_finish: number;
};

export function deriveHints(job: Availability): JobHints {
  return {
    id: job.id,
    start: startHint(job),
    finish: finishHint(job),
    unused_start_word: sessionWord(job.k_session, 'START'),
    unused_finish_word: sessionWord(job.k_session, 'FINISH'),
    t_start: job.t_start,
    t_finish: job.t_finish,
  };
}

export const HIERARCHY = CATALOG_AVAIL.map(deriveHints);

export type SideSlots = {
  readonly base: string;
  readonly slots: readonly (readonly string[])[];
};

/**
 * Fallback spaces only. Declared after the words were known,
 * before any P_sec of a combination. No umbrella.
 */
export const FALLBACK_SLOTS: Readonly<Record<string, { start?: SideSlots; finish?: SideSlots }>> = {
  brief: {
    start: {
      base: 'Let\'s head to the shops later. The plan works.',
      slots: [
        ["Let's head", 'We can head'],
        ['to the shops', 'by the shops'],
        ['later.', 'this afternoon.'],
        ['The plan', 'The time'],
        ['works', 'is fine'],
        ['.', '!'],
      ],
    },
    finish: {
      base: "Alright, see you at the bridge later then.",
      slots: [
        ['Alright,', 'Okay,'],
        ['see you', "I'll be"],
        ['at the bridge', 'by the bridge'],
        ['later', 'shortly'],
        ['then', 'now'],
        ['.', '!'],
      ],
    },
  },
  coffee: {
    finish: {
      base: "Alright, coffee works. I'll stay in.",
      slots: [
        ['Alright,', 'Okay,'],
        ['coffee', 'the coffee'],
        ['works.', 'is fine.'],
        ["I'll stay", 'I can stay'],
        ['in', 'put'],
        ['.', '!'],
      ],
    },
  },
  gym: {
    start: {
      base: "Let's go to the market before lunch. The plan works.",
      slots: [
        ["Let's go", 'We can go'],
        ['to the market', 'by the market'],
        ['before lunch.', 'after lunch.'],
        ['The plan', 'The time'],
        ['works', 'is fine'],
        ['.', '!'],
      ],
    },
    finish: {
      base: "Alright, I'll grab a jacket. See you there.",
      slots: [
        ['Alright,', 'Okay,'],
        ["I'll grab", 'I have'],
        ['a jacket.', 'my jacket.'],
        ['See you', 'Meet you'],
        ['there', 'then'],
        ['.', '!'],
      ],
    },
  },
  library: {
    finish: {
      base: 'Alright, see you at the ridge later then.',
      slots: [
        ['Alright,', 'Okay,'],
        ['see you', "I'll be"],
        ['at the ridge', 'by the ridge'],
        ['later', 'shortly'],
        ['then', 'now'],
        ['.', '!'],
      ],
    },
  },
  call: {
    start: {
      base: "I'll grab a jacket and call later. That works.",
      slots: [
        ["I'll grab", 'I have'],
        ['a jacket', 'my jacket'],
        ['and call later.', 'then call later.'],
        ['That', 'This'],
        ['works', 'is fine'],
        ['.', '!'],
      ],
    },
  },
};

/** Pair-mode unused cue. Must not satisfy the derived hint. */
/** First steered fallback hits. Null is a residual miss, not a retune. */
export const FALLBACK_HITS = {
  brief: {
    start: 'Let\'s head by the shops this afternoon. The plan is fine.',
    finish: "Okay, I'll be at the bridge shortly now.",
  },
  coffee: { finish: null },
  gym: { start: null, finish: "Alright, I'll grab my jacket. Meet you there." },
  library: { finish: null },
  call: { start: "I'll grab a jacket then call later. This is fine." },
} as const;

export const UNUSED_CUE: Readonly<Record<string, { start?: string; finish?: string }>> = {
  coffee: {
    start: 'The coffee is ready.',
  },
  library: {
    start: 'The ridge is quiet.',
  },
  call: {
    finish: 'The bottle is here.',
  },
  train: {
    start: 'The weather looks later than I thought.',
    finish: 'The weather looks later than I thought.',
  },
  dinner: {
    start: 'The shops by the bridge are open.',
    finish: 'The shops by the bridge are open.',
  },
  movie: {
    start: 'Bread and pasta are enough.',
    finish: 'Bread and pasta are enough.',
  },
  office: {
    start: 'Later the weather may turn.',
    finish: 'Later the weather may turn.',
  },
  beach: {
    start: 'The market jacket is packed.',
    finish: 'The market jacket is packed.',
  },
  pizza: {
    start: 'A sweater from the shops is fine.',
    finish: 'A sweater from the shops is fine.',
  },
  garden: {
    start: 'The flask is around here.',
    finish: 'The flask is around here.',
  },
};

export { CATALOG_AVAIL, SESSION_WORDS, hasWord, pSec };
