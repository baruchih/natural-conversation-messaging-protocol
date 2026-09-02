/**
 * NCMP-V3-H2. State-derived g. Same promote as H1.
 * No payload N. No experimenter index. No camouflage. No capacity.
 */
import { createHash } from 'node:crypto';
import { canonicalize, decode as decodeN } from '../v1-v2/p7c6.ts';
import {
  L0,
  decodeE,
  eligible,
  language,
  promote,
  tokens,
  type HarvestResult,
  type Language,
} from './h1.ts';

export { L0, decodeE, promote };

/** Ten accepted GET+CUSTOMER turns. E stays `that party`. g chooses the token. */
export const TURNS = [
  'Did we find that party before sunset after dinner last night?',
  'Did we find that party waiting near coffee during rain today?',
  'Did we find that party already seated beside windows after lunch?',
  'Did we find that party talking about weather before tomorrow morning?',
  'Did we find that party outside after music ended last evening?',
  'Did we find that party still hungry following dessert and wine?',
  'Did we find that party walking toward hotel after midnight traffic?',
  'Did we find that party asking about trains before leaving town?',
  'Did we find that party reading menus under candles after sunset?',
  'Did we find that party paying cash after coffee and pastry?',
] as const;

export interface Selection {
  position: number;
  token: string;
  seed: string;
}

export function transcriptDigest(accepted: readonly string[]): string {
  return createHash('sha256').update(accepted.map((u) => canonicalize(u)).join('\n')).digest('hex');
}

/** Hash input is L digest, prior transcript, and U. Never residue N. */
export function gSeed(lang: Language, accepted: readonly string[], utterance: string): string {
  return `${lang.digest}\n${transcriptDigest(accepted)}\n${canonicalize(utterance)}`;
}

export function selectG(lang: Language, accepted: readonly string[], utterance: string): Selection {
  const t = tokens(utterance);
  if (t.length === 0) throw new Error('empty utterance');
  const seed = gSeed(lang, accepted, utterance);
  const hex = createHash('sha256').update(seed).digest('hex').slice(0, 8);
  const position = (Number.parseInt(hex, 16) % t.length) + 1;
  return { position, token: t[position - 1], seed };
}

export interface TurnLog {
  n: number;
  utterance: string;
  position: number;
  token: string;
  kind: HarvestResult['kind'];
  residue: number;
  language: Language;
}

export function run(turns: readonly string[] = TURNS): TurnLog[] {
  let lang = L0;
  const accepted: string[] = [];
  const log: TurnLog[] = [];
  for (let n = 0; n < turns.length; n++) {
    const utterance = turns[n];
    if (decodeE(utterance, lang) !== 'CUSTOMER') {
      throw new Error(`turn ${n} not accepted under current L`);
    }
    const g = selectG(lang, accepted, utterance);
    const harvest = promote(lang, utterance, g.position);
    if (harvest.kind === 'harvested') lang = harvest.language;
    accepted.push(utterance);
    log.push({
      n,
      utterance,
      position: g.position,
      token: g.token,
      kind: harvest.kind,
      residue: decodeN(utterance),
      language: lang,
    });
  }
  return log;
}

/** Same turns, two independent languages. Must match. */
export function both(turns: readonly string[] = TURNS): { a: TurnLog[]; b: TurnLog[] } {
  return { a: run(turns), b: run(turns) };
}

export function harvested(log: readonly TurnLog[]): string[] {
  return log.filter((t) => t.kind === 'harvested').map((t) => t.token);
}

export function languageAfter(log: readonly TurnLog[]): Language {
  return log.length ? log[log.length - 1].language : language(L0.customer);
}
