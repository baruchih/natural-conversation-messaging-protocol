/**
 * NCMP-P7-G1. LM proposes language. δ and C6-HY decide.
 * The model does not decode and does not search N.
 */
import { decode as decodeN, wellFormed } from './p7c6.ts';
import { GLAZES } from './p7c6.hy.ts';
import { missingPoles, RESTAURANT_P_POLES, tokenList } from './p7c6.lm.ts';
import { decodeD } from './p7d1.ts';
import { usesMagicEntityNoun } from './p7e1.ts';
import {
  decodeE2,
  e2For,
  matchingConstructions,
  E2_CONSTRUCTIONS,
  type Construction,
} from './p7e2.ts';

export const G1_PROPOSITION = 'The restaurant was good, but service was slow.';
export const G1_TARGET_N = 42;

export type G1Condition = 'informed' | 'free';
export type CarrierNovelty = 'echo' | 'template' | 'pole_swap' | 'novel' | 'reject';

export interface G1Score {
  utterance: string;
  wellFormed: boolean;
  polesOk: boolean;
  d: ReturnType<typeof decodeD>;
  e: ReturnType<typeof decodeE2>;
  n: number | null;
  magic: boolean;
  constructions: string[];
  deHit: boolean;
  novelty: CarrierNovelty;
}

export interface G1Finished {
  score: G1Score;
  finished: string | null;
  nHit: boolean;
  solutions: number;
}

const PUBLISHED_ECHO = [
  'Did we find the restaurant was good but service was slow for that party?',
  'Did we find the restaurant was good but service was slow for whoever held it?',
  'Did we find the restaurant was good but service was slow for their account holder?',
  'Did we find the restaurant was good but service was slow for those folks?',
  'Did we find the restaurant was good but service was slow for anyone seated?',
  'Did we find the restaurant was good but service was slow for the account holder?',
  'Did we find the restaurant was good but service was slow for the person involved?',
  'Did we find the restaurant was good but service was slow for the one we discussed?',
];

const FRAME_TOKENS = new Set([
  'did',
  'we',
  'find',
  'the',
  'restaurant',
  'was',
  'good',
  'but',
  'service',
  'slow',
  'for',
  'on',
  'i',
  'confirm',
]);

function expand(slots: Construction['slots']): string[][] {
  return slots.reduce<string[][]>((acc, slot) => {
    if (acc.length === 0) return slot.map((w) => [w]);
    const next: string[][] = [];
    for (const prefix of acc) {
      for (const w of slot) next.push([...prefix, w]);
    }
    return next;
  }, []);
}

export function customerPhrases(): string[] {
  const out: string[] = [];
  for (const c of E2_CONSTRUCTIONS.filter((x) => x.entity === 'CUSTOMER')) {
    for (const pat of expand(c.slots)) out.push(pat.join(' '));
  }
  return out;
}

function poleWordSet(): Set<string> {
  const s = new Set<string>();
  for (const words of Object.values(RESTAURANT_P_POLES)) {
    for (const w of words) s.add(w);
  }
  for (const g of GLAZES) {
    for (const w of tokenList(g)) s.add(w);
  }
  return s;
}

const POLE_OR_GLAZE = poleWordSet();

function normalize(u: string): string {
  return tokenList(u).join(' ');
}

function stripCustomerSpan(tokens: string[]): string[] {
  const hits = matchingConstructions(tokens.join(' ')).filter((c) => c.entity === 'CUSTOMER');
  for (const c of hits) {
    for (const pat of expand(c.slots)) {
      outer: for (let i = 0; i <= tokens.length - pat.length; i++) {
        for (let j = 0; j < pat.length; j++) {
          if (tokens[i + j] !== pat[j]) continue outer;
        }
        return [...tokens.slice(0, i), ...tokens.slice(i + pat.length)];
      }
    }
  }
  return tokens;
}

export function carrierNovelty(utterance: string, deHit: boolean): CarrierNovelty {
  if (!deHit) return 'reject';
  const norm = normalize(utterance);
  if (PUBLISHED_ECHO.some((s) => normalize(s) === norm)) return 'echo';
  const leftover = stripCustomerSpan(tokenList(utterance));
  if (leftover.every((t) => FRAME_TOKENS.has(t))) return 'template';
  if (leftover.every((t) => FRAME_TOKENS.has(t) || POLE_OR_GLAZE.has(t))) return 'pole_swap';
  return 'novel';
}

export function scoreProposal(utterance: string): G1Score {
  const formOk = wellFormed(utterance);
  const polesOk = missingPoles(utterance).length === 0;
  const d = decodeD(utterance);
  const e = decodeE2(utterance);
  const magic = usesMagicEntityNoun(utterance);
  const deHit = formOk && polesOk && !magic && d === 'GET' && e === 'CUSTOMER';
  return {
    utterance,
    wellFormed: formOk,
    polesOk,
    d,
    e,
    n: formOk ? decodeN(utterance) : null,
    magic,
    constructions: matchingConstructions(utterance).map((c) => c.id),
    deHit,
    novelty: carrierNovelty(utterance, deHit),
  };
}

/** Deterministic N finish. The LM is not asked and is not believed. */
export function finishN(utterance: string, n = G1_TARGET_N): G1Finished {
  const score = scoreProposal(utterance);
  if (!score.deHit) return { score, finished: null, nHit: false, solutions: 0 };
  const hits = e2For(utterance, n);
  return {
    score,
    finished: hits[0]?.utterance ?? null,
    nHit: hits.length > 0,
    solutions: hits.length,
  };
}

export function stripFences(text: string): string {
  return (
    text
      .trim()
      .replace(/^["'`]+|["'`]+$/g, '')
      .replace(/^[-*]\s+/, '')
      .split('\n')
      .map((l) => l.trim())
      .find((l) => l.length > 0) ?? ''
  );
}

function informedPrompt(): string {
  const phrases = customerPhrases().join('\n- ');
  return `Write ONE natural conversational question that keeps this meaning:

${G1_PROPOSITION}

It must be a question using did, whether, or what (not just a rising tone).
It must contain one CUSTOMER construction as contiguous words from this published grammar:

- ${phrases}

Keep the dinner contrast (restaurant/place/kitchen was good/decent/solid/fine, but/though/although/yet service/wait/staff was slow/sluggish/delayed).
Do not use the words customer or transaction.
Do not mention codes, bits, or numbers.
Do not decide whether the sentence is valid.

Reply with the sentence only.`;
}

function freePrompt(): string {
  return `Write ONE natural conversational question that keeps this meaning:

${G1_PROPOSITION}

Ask whether we learned something about the person the dinner was for.
Speak the way people actually talk. Do not use the words customer or transaction.
Do not mention codes, bits, or numbers.
Do not decide whether the sentence is valid.

Reply with the sentence only.`;
}

export function promptFor(condition: G1Condition): string {
  return condition === 'informed' ? informedPrompt() : freePrompt();
}

export async function proposeUtterance(
  condition: G1Condition,
  options: { apiKey: string; model: string },
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model,
      temperature: 0.9,
      messages: [
        {
          role: 'system',
          content:
            'You write one ordinary English sentence. No quotes, no lists, no explanation. You do not score or validate the sentence.',
        },
        { role: 'user', content: promptFor(condition) },
      ],
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI ${response.status}: ${body.slice(0, 400)}`);
  }
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return stripFences(data.choices?.[0]?.message?.content ?? '');
}
