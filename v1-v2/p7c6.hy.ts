/**
 * NCMP-P7-C6-HY. Code owns arithmetic. LLM owns language. δ_N owns truth.
 *
 * From a poles-valid seed U, search published equivalence-class edits
 * (and optional glaze) whose letter-sum deltas hit the target residue.
 * Many realizations per residue — not a one-word codebook.
 */
import { decode, letterSum, wellFormed } from './p7c6.ts';
import { RESTAURANT_P_POLES, missingPoles, tokenList } from './p7c6.lm.ts';

export const GLAZES = [
  'last night',
  'this evening',
  'when we went',
  'after we sat',
  'once we arrived',
  'during dinner',
] as const;

export type SlotName = keyof typeof RESTAURANT_P_POLES;

export interface HybridCandidate {
  utterance: string;
  residue: number;
  glaze: string | null;
  slots: Record<SlotName, string>;
  depth: number;
}

function phraseSum(phrase: string): number {
  return letterSum(phrase);
}

export function stripGlaze(utterance: string): { body: string; glaze: string | null } {
  const trimmed = utterance.trim().replace(/[.!?]$/, '').trim();
  const lower = trimmed.toLowerCase();
  const ordered = [...GLAZES].sort((a, b) => b.length - a.length);
  for (const g of ordered) {
    if (lower.endsWith(g)) {
      return { body: trimmed.slice(0, trimmed.length - g.length).trim(), glaze: g };
    }
  }
  return { body: trimmed, glaze: null };
}

export function locateSlots(body: string): Record<SlotName, { index: number; word: string }> | null {
  const tokens = tokenList(body);
  const found = {} as Record<SlotName, { index: number; word: string }>;
  for (const [slot, words] of Object.entries(RESTAURANT_P_POLES) as [SlotName, readonly string[]][]) {
    const index = tokens.findIndex((t) => words.includes(t));
    if (index < 0) return null;
    found[slot] = { index, word: tokens[index] };
  }
  return found;
}

function realize(bodyTokens: string[], glaze: string | null): string {
  let text = bodyTokens.join(' ').replace(/\s+/g, ' ').trim();
  if (glaze) text = `${text} ${glaze}`;
  const capped = text.charAt(0).toUpperCase() + text.slice(1);
  return /[.!?]$/.test(capped) ? capped : `${capped}.`;
}

export function legalCandidates(seed: string): HybridCandidate[] {
  if (missingPoles(seed).length > 0) return [];
  const { body, glaze: seedGlaze } = stripGlaze(seed);
  const located = locateSlots(body);
  if (!located) return [];

  const tokens = tokenList(body);
  const glazeOptions: Array<string | null> = [null, ...GLAZES];
  const slotNames = Object.keys(RESTAURANT_P_POLES) as SlotName[];
  const out: HybridCandidate[] = [];

  function walk(i: number, slots: Record<SlotName, string>): void {
    if (i === slotNames.length) {
      const next = [...tokens];
      for (const name of slotNames) {
        next[located![name].index] = slots[name];
      }
      for (const glaze of glazeOptions) {
        const u = realize(next, glaze);
        if (!wellFormed(u) || missingPoles(u).length > 0) continue;
        let depth = glaze === seedGlaze ? 0 : 1;
        for (const name of slotNames) {
          if (slots[name] !== located![name].word) depth += 1;
        }
        out.push({
          utterance: u,
          residue: decode(u),
          glaze,
          slots: { ...slots },
          depth,
        });
      }
      return;
    }
    const name = slotNames[i];
    for (const word of RESTAURANT_P_POLES[name]) {
      walk(i + 1, { ...slots, [name]: word });
    }
  }

  walk(0, {} as Record<SlotName, string>);
  return out;
}

export function realizationsFor(seed: string, n: number): HybridCandidate[] {
  return legalCandidates(seed).filter((c) => c.residue === n);
}

export function solutionsPerResidue(seed: string): number[] {
  const counts = Array.from({ length: 64 }, () => 0);
  for (const c of legalCandidates(seed)) counts[c.residue] += 1;
  return counts;
}

export function uniquePathsPerResidue(seed: string): number[] {
  const sets = Array.from({ length: 64 }, () => new Set<string>());
  for (const c of legalCandidates(seed)) {
    const sig = `${Object.values(c.slots).join('|')}|${c.glaze ?? ''}`;
    sets[c.residue].add(sig);
  }
  return sets.map((s) => s.size);
}

export function encodeHybrid(
  seed: string,
  n: number
): { hit: boolean; chosen: HybridCandidate | null; solutions: number; paths: number } {
  const hits = realizationsFor(seed, n);
  const paths = new Set(hits.map((c) => `${Object.values(c.slots).join('|')}|${c.glaze ?? ''}`));
  const chosen =
    hits.slice().sort((a, b) => a.depth - b.depth || a.utterance.localeCompare(b.utterance))[0] ??
    null;
  return { hit: chosen !== null, chosen, solutions: hits.length, paths: paths.size };
}

/** Prefer a shallow, distinct wording — still only among residue-correct edits. */
export function pickDiverse(seed: string, n: number, take = 5): HybridCandidate[] {
  const hits = realizationsFor(seed, n).sort(
    (a, b) => a.depth - b.depth || a.utterance.localeCompare(b.utterance)
  );
  const picked: HybridCandidate[] = [];
  const used = new Set<string>();
  for (const c of hits) {
    const sig = `${Object.values(c.slots).join('|')}|${c.glaze ?? ''}`;
    if (used.has(sig)) continue;
    used.add(sig);
    picked.push(c);
    if (picked.length >= take) break;
  }
  return picked;
}
