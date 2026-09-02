/**
 * NCMP-V3-H1. Arbitrary terminal harvest. g is published position 7.
 * Appearance is not membership. No hash. No camouflage. No capacity.
 */
import { GET_CUES, ALLOW_CUES } from '../v1-v2/p7d1.ts';
import { E_DET, E_EVENT, E_PARTY } from '../v1-v2/p7e1.ts';
import { ACK_TOKENS, PROBE_TOKENS } from '../v1-v2/p7s1.ts';
import {
  L0,
  converged,
  language,
  languageDigest,
  type Language,
} from './l1.ts';

export { L0, converged, language, languageDigest };
export type { Language };

export const U1 = 'Did we find that party before sunset?';
export const U2 = 'Did we find sunset before dinner?';
export const U_APPEAR = 'The sunset was beautiful last night after dinner.';

/** 1-based. On U1 this is sunset. H1 does not hash. */
export const G_POSITION = 7;

/** E-slot cue for this profile. Construction must sit immediately after it. */
export const E_CUE = 'find';

export const RESERVED = new Set<string>([
  ...GET_CUES,
  ...ALLOW_CUES,
  ...E_DET,
  ...E_EVENT,
  ...E_PARTY,
  ...PROBE_TOKENS,
  ...ACK_TOKENS,
  E_CUE,
]);

export type EntityOrNone = 'CUSTOMER' | 'NONE';
export type HarvestKind = 'harvested' | 'none';

export interface HarvestResult {
  language: Language;
  token: string | null;
  kind: HarvestKind;
}

export function tokens(utterance: string): string[] {
  return utterance
    .normalize('NFC')
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z]/g, ''))
    .filter(Boolean);
}

export function select(utterance: string, position = G_POSITION): string | null {
  const t = tokens(utterance);
  if (position < 1 || position > t.length) return null;
  return t[position - 1];
}

function lexiconTokens(lang: Language): Set<string> {
  const out = new Set<string>();
  for (const c of lang.customer) {
    out.add(c);
    for (const w of c.split(/\s+/)) out.add(w);
  }
  return out;
}

export function eligible(token: string, lang: Language): boolean {
  if (!/^[a-z]+$/.test(token)) return false;
  if (RESERVED.has(token)) return false;
  if (lexiconTokens(lang).has(token)) return false;
  return true;
}

/**
 * CUSTOMER only if a listed construction is the prefix after `find`.
 * A token elsewhere, including sunset in ordinary prose, is NONE.
 */
export function decodeE(utterance: string, lang: Language): EntityOrNone {
  const t = tokens(utterance);
  const i = t.indexOf(E_CUE);
  if (i < 0 || i === t.length - 1) return 'NONE';
  const rest = t.slice(i + 1);
  const listed = [...lang.customer].sort(
    (a, b) => b.split(/\s+/).length - a.split(/\s+/).length,
  );
  for (const c of listed) {
    const pat = c.split(/\s+/);
    if (pat.length <= rest.length && pat.every((w, j) => rest[j] === w)) {
      return 'CUSTOMER';
    }
  }
  return 'NONE';
}

export function promote(
  lang: Language,
  utterance: string,
  position = G_POSITION,
): HarvestResult {
  if (decodeE(utterance, lang) !== 'CUSTOMER') {
    return { language: lang, token: null, kind: 'none' };
  }
  const token = select(utterance, position);
  if (token === null || !eligible(token, lang)) {
    return { language: lang, token, kind: 'none' };
  }
  return { language: language([...lang.customer, token]), token, kind: 'harvested' };
}

export class Agent {
  language: Language;

  constructor(
    public readonly name: string,
    start: Language = L0,
  ) {
    this.language = start;
  }

  receive(utterance: string, position = G_POSITION): { entity: EntityOrNone; harvest: HarvestResult } {
    const entity = decodeE(utterance, this.language);
    const harvest = entity === 'CUSTOMER'
      ? promote(this.language, utterance, position)
      : { language: this.language, token: null, kind: 'none' as const };
    if (harvest.kind === 'harvested') this.language = harvest.language;
    return { entity, harvest };
  }
}
