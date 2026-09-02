/**
 * NCMP-C5-U. Uniform two-word cues. Donate what exists; derive the rest.
 * C5-P pair path is untouched. Not the protocol. Does not change process.
 */
import { fnv1a32 } from './c1.ts';
import { pSec } from './c2d.ts';
import { SESSION_WORDS } from './c4.ts';
import { CATALOG_AVAIL, type Availability } from './c5a.ts';
import { eligibleWords } from './c5e.ts';
import { finishPair, hasOrderedPair, startPair, type Pair } from './c5p.ts';

const utf8 = new TextEncoder();

export type Source = 'donated' | 'hybrid' | 'derived';

export type Cue = {
  readonly source: Source;
  readonly pair: Pair;
};

/**
 * Session word for a role and slot. Same C4 list.
 * Tags 0x0A/0x0B START, 0x0C/0x0D FINISH. Not C5-H's single-word tags.
 * If the index lands on exclude, take the next word.
 */
export function derivedWord(
  session: number,
  role: 'START' | 'FINISH',
  slot: 0 | 1,
  exclude: string | null = null,
): string {
  const tag = (role === 'START' ? 0x0a : 0x0c) + slot;
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
  const i = fnv1a32(bytes) % SESSION_WORDS.length;
  const word = SESSION_WORDS[i];
  if (exclude !== null && word === exclude) {
    return SESSION_WORDS[(i + 1) % SESSION_WORDS.length];
  }
  return word;
}

export function derivedPair(session: number, role: 'START' | 'FINISH'): Pair {
  const first = derivedWord(session, role, 0);
  const second = derivedWord(session, role, 1, first);
  return [first, second];
}

export function hybridPair(donated: string, session: number, role: 'START' | 'FINISH'): Pair {
  return [donated, derivedWord(session, role, 1, donated)];
}

/** Handshake-only. C5-P pair when ≥2 eligible words. */
export function startCueFrom(uProbe: string, session: number): Cue {
  const donated = startPair(uProbe);
  if (donated !== null) return { source: 'donated', pair: donated };
  const elig = eligibleWords(uProbe);
  if (elig.length === 1) {
    return { source: 'hybrid', pair: hybridPair(elig[0], session, 'START') };
  }
  return { source: 'derived', pair: derivedPair(session, 'START') };
}

export function finishCueFrom(uAck: string, session: number): Cue {
  const donated = finishPair(uAck);
  if (donated !== null) return { source: 'donated', pair: donated };
  const elig = eligibleWords(uAck);
  if (elig.length === 1) {
    return { source: 'hybrid', pair: hybridPair(elig[0], session, 'FINISH') };
  }
  return { source: 'derived', pair: derivedPair(session, 'FINISH') };
}

export function startCue(job: Availability): Cue {
  return startCueFrom(job.u_probe, job.k_session);
}

export function finishCue(job: Availability): Cue {
  return finishCueFrom(job.u_ack, job.k_session);
}

export function isStartU(utterance: string, job: Availability): boolean {
  return hasOrderedPair(utterance, startCue(job).pair) && pSec(utterance) === job.t_start;
}

export function isFinishU(utterance: string, job: Availability): boolean {
  return hasOrderedPair(utterance, finishCue(job).pair) && pSec(utterance) === job.t_finish;
}

export type JobCue = {
  readonly id: string;
  readonly start: Cue;
  readonly finish: Cue;
  readonly t_start: number;
  readonly t_finish: number;
};

export function deriveCues(job: Availability): JobCue {
  return {
    id: job.id,
    start: startCue(job),
    finish: finishCue(job),
    t_start: job.t_start,
    t_finish: job.t_finish,
  };
}

export const CUES = CATALOG_AVAIL.map(deriveCues);

export type SideSlots = {
  readonly base: string;
  readonly slots: readonly (readonly string[])[];
};

/**
 * Spaces for hybrid/derived sides only. Declared after the pairs were known,
 * before any P_sec of a combination. No umbrella. Donated path stays C5-A.
 */
/** First steered fill hits. Null is a residual miss, not a retune. */
export const FILL_HITS = {
  brief: {
    start: 'Later we can make it simple. The time works on my end!',
    finish: 'Okay, later I will grab a sweater. See you there.',
  },
  coffee: { finish: null },
  gym: {
    start: 'Lunch maybe is fine. The time is ok.',
    finish: "Alright, I'll bring stuff around. See you then.",
  },
  library: { finish: 'Okay, I have my jacket. See you at the bench later!' },
  call: { start: 'Later we can meet at the bench. The time is fine on my end!' },
} as const;

export const FILL_SLOTS: Readonly<Record<string, { start?: SideSlots; finish?: SideSlots }>> = {
  brief: {
    start: {
      base: 'Later we can keep it simple. The walk works for me.',
      slots: [
        ['Later we can', 'Later I can'],
        ['keep it simple.', 'make it simple.'],
        ['The walk', 'The time'],
        ['works', 'is fine'],
        ['for me', 'on my end'],
        ['.', '!'],
      ],
    },
    finish: {
      base: "Alright, later I can grab a sweater. See you then.",
      slots: [
        ['Alright,', 'Okay,'],
        ['later I can', 'later I will'],
        ['grab a sweater.', 'bring a sweater.'],
        ['See you', 'Meet you'],
        ['then', 'there'],
        ['.', '!'],
      ],
    },
  },
  coffee: {
    finish: {
      base: "Alright, the walk is set. I'm packed now.",
      slots: [
        ['Alright,', 'Okay,'],
        ['the walk', 'that walk'],
        ['is set.', 'works.'],
        ["I'm packed", "we're packed"],
        ['now', 'too'],
        ['.', '!'],
      ],
    },
  },
  gym: {
    start: {
      base: 'Lunch maybe works. The gym is ok.',
      slots: [
        ['Lunch', 'After lunch'],
        ['maybe', 'maybe still'],
        ['works.', 'is fine.'],
        ['The gym', 'The time'],
        ['is ok', 'is good'],
        ['.', '!'],
      ],
    },
    finish: {
      base: "Alright, I'll bring it around. See you there.",
      slots: [
        ['Alright,', 'Okay,'],
        ["I'll bring", 'I can bring'],
        ['it around.', 'stuff around.'],
        ['See you', 'Meet you'],
        ['there', 'then'],
        ['.', '!'],
      ],
    },
  },
  library: {
    finish: {
      base: "Alright, I'll grab a jacket. See you at the bench later.",
      slots: [
        ['Alright,', 'Okay,'],
        ["I'll grab", 'I have'],
        ['a jacket.', 'my jacket.'],
        ['See you at the bench', 'Meet you by the bench'],
        ['later', 'shortly'],
        ['.', '!'],
      ],
    },
  },
  call: {
    start: {
      base: 'Later we can meet at the bench. The call works for me.',
      slots: [
        ['Later we can', 'Later I can'],
        ['meet at the bench.', 'sit by the bench.'],
        ['The call', 'The time'],
        ['works', 'is fine'],
        ['for me', 'on my end'],
        ['.', '!'],
      ],
    },
  },
};

export { CATALOG_AVAIL, SESSION_WORDS, hasOrderedPair, pSec, startPair, finishPair };
