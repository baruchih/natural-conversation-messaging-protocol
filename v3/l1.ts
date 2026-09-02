/**
 * NCMP-V3-L1. One class, one toy derivation. Convergence is correctness.
 * Y must be derived, not transmitted, not interpreted.
 */
import { createHash } from 'node:crypto';

export const L0_CONSTRUCTION = 'that party';
export const DERIVE_DET = ['that', 'this', 'the'] as const;
export const DERIVE_HEAD = ['party', 'person', 'holder', 'one'] as const;

export type EntityOrNone = 'CUSTOMER' | 'NONE';
export type EvolveKind = 'derived' | 'none' | 'transmission';

export interface Language {
  customer: string[];
  digest: string;
}

export interface EvolveResult {
  language: Language;
  y: string | null;
  kind: EvolveKind;
}

function tokenList(utterance: string): string[] {
  return utterance
    .normalize('NFC')
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z]/g, ''))
    .filter(Boolean);
}

function hasSeq(tokens: string[], pat: readonly string[]): boolean {
  outer: for (let i = 0; i <= tokens.length - pat.length; i++) {
    for (let j = 0; j < pat.length; j++) {
      if (tokens[i + j] !== pat[j]) continue outer;
    }
    return true;
  }
  return false;
}

export function canonical(language: Pick<Language, 'customer'>): string {
  return [...language.customer].map((c) => c.trim().toLowerCase()).sort().join('\n');
}

export function languageDigest(language: Pick<Language, 'customer'>): string {
  return createHash('sha256').update(canonical(language)).digest('hex');
}

export function language(customer: readonly string[]): Language {
  const unique = [...new Set(customer.map((c) => c.trim().toLowerCase()))].sort();
  return { customer: unique, digest: languageDigest({ customer: unique }) };
}

export const L0 = language([L0_CONSTRUCTION]);

export function converged(a: Language, b: Language): boolean {
  return a.digest === b.digest;
}

export function decodeE(utterance: string, lang: Language): EntityOrNone {
  const tokens = tokenList(utterance);
  for (const c of lang.customer) {
    if (hasSeq(tokens, c.split(/\s+/))) return 'CUSTOMER';
  }
  return 'NONE';
}

function phraseOf(det: string, head: string): string {
  return `${det} ${head}`;
}

function listedPairs(tokens: string[]): Array<{ det: string; head: string; i: number }> {
  const out: Array<{ det: string; head: string; i: number }> = [];
  for (let i = 0; i < tokens.length - 1; i++) {
    if (DERIVE_DET.includes(tokens[i] as (typeof DERIVE_DET)[number]) &&
        DERIVE_HEAD.includes(tokens[i + 1] as (typeof DERIVE_HEAD)[number])) {
      out.push({ det: tokens[i], head: tokens[i + 1], i });
    }
  }
  return out;
}

/**
 * Toy derivation. DET from the first L-matching pair, HEAD from the
 * first extra DET+HEAD pair. If Y is already in U, refuse to add it.
 */
export function evolve(lang: Language, utterance: string): EvolveResult {
  if (decodeE(utterance, lang) !== 'CUSTOMER') {
    return { language: lang, y: null, kind: 'none' };
  }

  const tokens = tokenList(utterance);
  const inL = new Set(lang.customer);
  const pairs = listedPairs(tokens);
  const matched = pairs.filter((p) => inL.has(phraseOf(p.det, p.head)));
  const extra = pairs.filter((p) => !inL.has(phraseOf(p.det, p.head)));
  if (matched.length === 0 || extra.length === 0) {
    return { language: lang, y: null, kind: 'none' };
  }

  const y = phraseOf(matched[0].det, extra[0].head);
  if (hasSeq(tokens, y.split(/\s+/))) {
    return { language: lang, y, kind: 'transmission' };
  }
  if (inL.has(y)) {
    return { language: lang, y: null, kind: 'none' };
  }

  return { language: language([...lang.customer, y]), y, kind: 'derived' };
}

export class Agent {
  language: Language;

  constructor(
    public readonly name: string,
    start: Language = L0,
  ) {
    this.language = start;
  }

  /** Accept U under current L, then evolve. Divergence is caller's check. */
  receive(utterance: string): { entity: EntityOrNone; evolve: EvolveResult } {
    const entity = decodeE(utterance, this.language);
    const next = entity === 'CUSTOMER' ? evolve(this.language, utterance) : {
      language: this.language,
      y: null,
      kind: 'none' as const,
    };
    if (next.kind === 'derived') this.language = next.language;
    return { entity, evolve: next };
  }
}
