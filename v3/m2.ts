/**
 * NCMP-V3-M2. Result #17, PARTIAL, frozen.
 * Batch A: paraphrase of a seed sentence (0/6).
 * Batch B: realizations of conversational intent (2/6).
 * Do not enlarge k. Do not regenerate Batch B.
 */
import { canonicalize, decode, selectedLetters, wellFormed, MIN_SELECTED_LETTERS, MIN_TOKENS } from '../v1-v2/p7c6.ts';
import {
  FROZEN_PROPOSALS,
  PREFIXES,
  TARGET,
  promptIsBlind,
  requiredA2,
  singletonN,
  windowN,
  type Prefix,
} from './m1.ts';
import { FROZEN_SETS } from './m2.frozen.ts';
import { FROZEN_INTENT } from './m2.intent.frozen.ts';

export { FROZEN_SETS, FROZEN_INTENT, PREFIXES, TARGET, FROZEN_PROPOSALS, promptIsBlind, requiredA2, singletonN, windowN };
export type { Prefix };

export const BATCH = 50;

/** C6 carrier mins. Internal .!? allowed. U is a conversational turn. */
export function turnOk(utterance: string): boolean {
  const trimmed = utterance.trim();
  if (!/[.!?]$/.test(trimmed)) return false;
  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length < MIN_TOKENS) return false;
  const canon = canonicalize(trimmed);
  if (/[0-9]/.test(canon)) return false;
  if (selectedLetters(trimmed).length < MIN_SELECTED_LETTERS) return false;
  return true;
}

export function paraphrasePrompt(prefix: Prefix, seed: string, k = BATCH): string {
  return `You are rewriting one conversational sentence. Give ${k} different natural ways speaker A could have said the same thing in this exact conversation. Same meaning. One sentence per line. No numbering. No quotation marks.

Conversation:
A: ${prefix.a1}
B: ${prefix.b1}
A's sentence: ${seed}`;
}

export function intentPrompt(prefix: Prefix, k = BATCH): string {
  return `Conversation so far:
A: ${prefix.a1}
B: ${prefix.b1}

A's next conversational intent:
${prefix.intent}.

Generate ${k} genuinely different, natural ways A could continue this conversation while preserving that intent. Vary sentence structure, phrasing, discourse style, contractions, and conversational framing. Do not merely substitute synonyms into one template. One conversational turn per line. A turn may contain more than one sentence. No numbering. No quotation marks.`;
}

export function promptIsBlindParaphrase(prefix: Prefix, seed: string): boolean {
  return isBlind(paraphrasePrompt(prefix, seed)) && promptIsBlind(prefix);
}

export function promptIsBlindIntent(prefix: Prefix): boolean {
  return isBlind(intentPrompt(prefix)) && promptIsBlind(prefix);
}

function isBlind(p: string): boolean {
  const t = p.toLowerCase();
  if (t.includes('ncmp') || t.includes('residue') || t.includes('letter-sum')) return false;
  if (t.includes('encode') || t.includes('protocol') || /\b64\b/.test(t)) return false;
  return true;
}

export function parseCandidates(text: string): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of text.split('\n')) {
    let u = raw.trim().replace(/^["'`]+|["'`]+$/g, '');
    u = u.replace(/^\d+[.)]\s+/, '').replace(/^[-*]\s+/, '');
    if (!u) continue;
    if (!/[.!?]$/.test(u)) u = `${u}.`;
    const key = u.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(u);
  }
  return out;
}

export function needOf(prefix: Prefix, target = TARGET): number {
  return requiredA2(singletonN(prefix.a1), singletonN(prefix.b1), target);
}

export interface Selection {
  prefix: Prefix;
  seed: string | null;
  need: number;
  candidates: string[];
  legal: string[];
  residues: number[];
  uniqueResidues: number;
  chosen: string | null;
  window: number | null;
}

function finish(prefix: Prefix, seed: string | null, all: string[], legal: string[], target: number): Selection {
  const need = needOf(prefix, target);
  const residues = legal.map((u) => decode(u));
  const chosen = legal.find((u) => decode(u) === need) ?? null;
  return {
    prefix,
    seed,
    need,
    candidates: all,
    legal,
    residues,
    uniqueResidues: new Set(residues).size,
    chosen,
    window: chosen ? windowN(prefix.a1, prefix.b1, chosen) : null,
  };
}

/** Batch A. Seed-anchored paraphrases. P7 wellFormed. */
export function selectParaphrase(prefix: Prefix, seed: string, candidates: readonly string[], target = TARGET): Selection {
  const seen = new Set<string>();
  const all: string[] = [];
  for (const u of [seed, ...candidates]) {
    const key = u.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    all.push(u);
  }
  return finish(prefix, seed, all, all.filter(wellFormed), target);
}

/** Batch B. Intent realizations. No seed. Turn gate, not P7 wellFormed. */
export function selectIntent(prefix: Prefix, candidates: readonly string[], target = TARGET): Selection {
  const seen = new Set<string>();
  const all: string[] = [];
  for (const u of candidates) {
    const key = u.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    all.push(u);
  }
  return finish(prefix, null, all, all.filter(turnOk), target);
}

export function coverage(residues: readonly number[]): number[] {
  const counts = Array.from({ length: 64 }, () => 0);
  for (const n of residues) counts[n] += 1;
  return counts;
}

export function runFrozenParaphrase(): Selection[] {
  return PREFIXES.map((p) => selectParaphrase(p, FROZEN_PROPOSALS[p.id], FROZEN_SETS[p.id] ?? []));
}

export function runFrozenIntent(): Selection[] {
  return PREFIXES.map((p) => selectIntent(p, FROZEN_INTENT[p.id] ?? []));
}
