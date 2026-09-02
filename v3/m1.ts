/**
 * NCMP-V3-M1. Result #16, frozen.
 * Do not change ADJUNCTS, STARTERS, SWAPS, normalize, or ranking.
 * W5 measures this neighborhood.
 */
import { decode, jaccard, wellFormed } from '../v1-v2/p7c6.ts';
import { GLAZES } from '../v1-v2/p7c6.hy.ts';
import { tokenList } from '../v1-v2/p7c6.lm.ts';
import { requiredA2, TARGET } from './k3.ts';
import { singletonN, windowN } from './k2.ts';

export { TARGET, requiredA2, singletonN, windowN, jaccard };

/** Optional suffixes. Not a residue codebook. Not restaurant poles. */
export const ADJUNCTS = [
  ...GLAZES,
  'tonight',
  'this time',
  'after all',
  'for now',
  'I guess',
  'I think',
  'to be honest',
  'after the rush',
  'before we leave',
  'on balance',
  'in the end',
  'so far',
  'in short',
  'once more',
  'without much fuss',
  'as we planned',
  'if that still works',
  'when it feels right',
  'before it gets late',
  'after a short pause',
  'while we still can',
  'if nobody objects',
  'with a bit of luck',
  'after some thought',
  'in a quiet way',
] as const;

/** Swap only a word already in the LM sentence. */
export const SWAPS: readonly (readonly string[])[] = [
  ['pretty', 'quite', 'fairly'],
  ['good', 'fine', 'okay'],
  ['little', 'slightly', 'somewhat'],
  ['busy', 'packed', 'crowded'],
  ['long', 'late', 'awhile'],
  ['place', 'spot', 'room'],
  ['stay', 'linger', 'remain'],
  ['yeah', 'yes'],
  ['unusual', 'odd', 'strange'],
  ['slow', 'sluggish', 'delayed'],
];

export interface Prefix {
  id: string;
  a1: string;
  b1: string;
  intent: string;
}

/** Visible dinner goals. No protocol words. */
export const PREFIXES: readonly Prefix[] = [
  {
    id: 'p1',
    a1: 'How was dinner last night after you sat down?',
    b1: 'Pretty good overall though the service was a little slow.',
    intent: 'react briefly and ask a natural follow-up',
  },
  {
    id: 'p2',
    a1: 'Did you two end up going out after work yesterday?',
    b1: 'We did and the place was packed once we arrived.',
    intent: 'ask whether they stayed long',
  },
  {
    id: 'p3',
    a1: 'What did you think of the meal last night?',
    b1: 'The food was fine although we waited a while.',
    intent: 'sympathize and ask if anything else stood out',
  },
  {
    id: 'p4',
    a1: 'Was the evening worth it after all that waiting?',
    b1: 'Mostly yes and the dessert almost made up for the wait.',
    intent: 'agree and ask what they would change',
  },
  {
    id: 'p5',
    a1: 'Did anyone else from the office show up last night?',
    b1: 'A couple of people came by later after we sat.',
    intent: 'ask how the rest of the night went',
  },
  {
    id: 'p6',
    a1: 'Should we try that place again sometime next week?',
    b1: 'Maybe later since I liked the food more than the wait.',
    intent: 'suggest a different time or ask what they want next time',
  },
];

/** Spoken openers. Applied only as optional prefixes. */
export const STARTERS = ['Well', 'So', 'Honestly', 'Yeah', 'Still'] as const;

/** Mechanical cleanup. Not encoding. */
export function normalizeProposal(raw: string): string {
  let u = raw.trim().replace(/^["'`]+|["'`]+$/g, '');
  u = u.replace(/^(A|B)\s*:\s*/i, '');
  u = u.replace(/[—–]/g, ', ');
  const parts = u.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  if (parts.length > 1) u = parts[parts.length - 1];
  if (!/[.!?]$/.test(u)) u = `${u}.`;
  return u.replace(/\s+/g, ' ').trim();
}

export function proposerPrompt(prefix: Prefix): string {
  return `You are continuing a casual conversation about a meal. Reply with exactly one natural next sentence for speaker A. No quotation marks.

Conversation:
A: ${prefix.a1}
B: ${prefix.b1}

A wants to ${prefix.intent}.`;
}

export function promptIsBlind(prefix: Prefix): boolean {
  const p = proposerPrompt(prefix).toLowerCase();
  if (p.includes('ncmp') || p.includes('residue') || p.includes('letter-sum')) return false;
  if (p.includes('encode') || p.includes('protocol') || /\b64\b/.test(p)) return false;
  return true;
}

function terminal(u: string): '.' | '?' | '!' {
  const t = u.trim().slice(-1);
  return t === '?' || t === '!' ? t : '.';
}

function bodyOf(u: string): string {
  return u.trim().replace(/[.!?]$/, '').trim();
}

function realize(body: string, punct: '.' | '?' | '!'): string {
  const text = body.replace(/\s+/g, ' ').trim();
  const capped = text.charAt(0).toUpperCase() + text.slice(1);
  return `${capped}${punct}`;
}

function swapMap(): Map<string, readonly string[]> {
  const m = new Map<string, readonly string[]>();
  for (const cls of SWAPS) {
    for (const w of cls) m.set(w, cls);
  }
  return m;
}

const SWAPS_FOR = swapMap();

function swapVariants(body: string): Array<{ text: string; depth: number }> {
  const toks = tokenList(body);
  const sites: number[] = [];
  for (let i = 0; i < toks.length; i++) {
    if (SWAPS_FOR.has(toks[i])) sites.push(i);
  }
  const out: Array<{ text: string; depth: number }> = [{ text: body, depth: 0 }];
  const seen = new Set([body.toLowerCase()]);

  function walk(i: number, cur: string[], depth: number): void {
    if (i === sites.length) {
      const text = cur.join(' ');
      const key = text.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        out.push({ text, depth });
      }
      return;
    }
    const at = sites[i];
    const word = cur[at];
    for (const alt of SWAPS_FOR.get(word) ?? [word]) {
      const next = [...cur];
      next[at] = alt;
      walk(i + 1, next, depth + (alt === word ? 0 : 1));
    }
  }

  if (sites.length > 0 && sites.length <= 5) walk(0, toks, 0);
  return out;
}

export interface Neighbor {
  utterance: string;
  residue: number;
  depth: number;
  jaccard: number;
}

/** Nearby realizations of the LM sentence. No dinner-seed fallback. */
export function neighbors(seed: string): Neighbor[] {
  const base = normalizeProposal(seed);
  const punct = terminal(base);
  const out: Neighbor[] = [];
  const seen = new Set<string>();
  for (const swap of swapVariants(bodyOf(base))) {
    for (const starter of [null, ...STARTERS]) {
      for (const adj of [null, ...ADJUNCTS]) {
        let body = swap.text;
        if (starter) {
          const rest = body.charAt(0).toLowerCase() + body.slice(1);
          body = `${starter} ${rest}`;
        }
        if (adj) body = `${body} ${adj}`;
        const u = realize(body, punct);
        if (!wellFormed(u) || seen.has(u)) continue;
        seen.add(u);
        const depth = swap.depth + (starter ? 1 : 0) + (adj ? 1 : 0);
        out.push({
          utterance: u,
          residue: decode(u),
          depth,
          jaccard: jaccard(base, u),
        });
      }
    }
  }
  return out;
}

export interface Modulation {
  seed: string;
  need: number;
  hit: boolean;
  chosen: Neighbor | null;
  seedResidue: number;
  solutions: number;
}

export function modulate(seed: string, need: number): Modulation {
  const pool = neighbors(seed);
  const hits = pool.filter((n) => n.residue === need);
  const chosen =
    hits.slice().sort((a, b) => a.depth - b.depth || b.jaccard - a.jaccard || a.utterance.localeCompare(b.utterance))[0] ??
    null;
  return {
    seed,
    need,
    hit: chosen !== null,
    chosen,
    seedResidue: decode(seed),
    solutions: hits.length,
  };
}

export interface CloseNatural {
  prefix: Prefix;
  proposal: string;
  need: number;
  modulation: Modulation;
  window: number | null;
}

export function closeNatural(prefix: Prefix, proposal: string, target = TARGET): CloseNatural {
  const need = requiredA2(singletonN(prefix.a1), singletonN(prefix.b1), target);
  const modulation = modulate(proposal, need);
  return {
    prefix,
    proposal,
    need,
    modulation,
    window: modulation.chosen ? windowN(prefix.a1, prefix.b1, modulation.chosen.utterance) : null,
  };
}

/** Frozen live LM proposals. One generation. Not dinner-family seeds. */
export const FROZEN_PROPOSALS: Readonly<Record<string, string>> = {
  p1: 'What did you end up ordering?',
  p2: 'How long did you guys end up staying there?',
  p3: 'Yeah, I get that—it was kind of a long wait. Was there anything else that stood out to you?',
  p4: 'I totally agree, but if you could change one thing about the meal, what would it be?',
  p5: 'A: Oh nice! How was the vibe once they arrived?',
  p6: 'How about we go for lunch instead of dinner this time?',
};
