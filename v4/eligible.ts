/**
 * NCMP-V4-Eligible. Grammar audit. Not a protocol change.
 * Grammar audit. turnOk is encoder hygiene.
 * Body membership is locked in NCMP-V4-Body.md.
 */
import { canonicalize, selectedLetters, wellFormed, MIN_SELECTED_LETTERS, MIN_TOKENS } from '../v1-v2/p7c6.ts';
import { isFinish, isStart } from './f1.ts';
import { carrier } from './baseline.ts';
import { turnOk } from '../v3/m2.ts';
import { FROZEN } from './uuid.frozen.ts';

export { MIN_SELECTED_LETTERS, MIN_TOKENS, carrier, turnOk, wellFormed };

/** UUID U12. Peer turn. Frozen miss. Do not regenerate. */
export const UUID_MISS = FROZEN.candidates[FROZEN.candidates.length - 1];

export function hasTerminal(u: string): boolean {
  return /[.!?]$/.test(u.trim());
}

export function tokenCountOk(u: string): boolean {
  return u.trim().split(/\s+/).filter(Boolean).length >= MIN_TOKENS;
}

export function noDigits(u: string): boolean {
  return !/[0-9]/.test(canonicalize(u));
}

export function letterCountOk(u: string): boolean {
  return selectedLetters(u).length >= MIN_SELECTED_LETTERS;
}

/** C6 single-sentence. Already dropped by turnOk. */
export function singleSentence(u: string): boolean {
  const trimmed = u.trim();
  if (!hasTerminal(trimmed)) return false;
  return !/[.!?]/.test(trimmed.slice(0, -1));
}

export function isControl(u: string): boolean {
  return isStart(u) || isFinish(u);
}

/**
 * C6 V(U) is total. Digits, punctuation, and
 * non-a-z letters are ignored, not rejected.
 * PROTOCOL_ELIGIBLE is this fact, not turnOk.
 * ENCODER_ACCEPTABLE is turnOk. Analysis only.
 */
export function vDefined(_u: string): boolean {
  return true;
}

export function encoderAcceptable(u: string): boolean {
  return turnOk(u);
}

/** Shared decode can read U. Always, because V is total. */
export function protocolDecodes(u: string): boolean {
  return vDefined(u);
}

export type Need = 'V' | 'state' | 'payload' | 'inherited' | 'control' | 'absent';

export interface Restriction {
  id: string;
  inTurnOk: boolean;
  inWellFormed: boolean;
  neededForV: boolean;
  neededForState: boolean;
  neededForPayloadDecode: boolean;
  origin: string;
  need: Need;
}

/**
 * Every Profile 0 wire restriction, classified.
 * neededFor* is about deterministic decode, not
 * encoder search or camouflage.
 */
export const RESTRICTIONS: readonly Restriction[] = [
  {
    id: 'NFC + lowercase',
    inTurnOk: true,
    inWellFormed: true,
    neededForV: true,
    neededForState: true,
    neededForPayloadDecode: true,
    origin: 'C6 canonicalization. Defines V.',
    need: 'V',
  },
  {
    id: 'selected a-z only',
    inTurnOk: false,
    inWellFormed: false,
    neededForV: true,
    neededForState: true,
    neededForPayloadDecode: true,
    origin: 'C6 alphabet. Other characters ignored, not rejected.',
    need: 'V',
  },
  {
    id: 'digits forbidden',
    inTurnOk: true,
    inWellFormed: true,
    neededForV: false,
    neededForState: false,
    neededForPayloadDecode: false,
    origin: 'C6 well_formed + encode fail. N already ignores 0-9.',
    need: 'inherited',
  },
  {
    id: 'terminal .!?',
    inTurnOk: true,
    inWellFormed: true,
    neededForV: false,
    neededForState: false,
    neededForPayloadDecode: false,
    origin: 'C6 well_formed ordinary-sentence region.',
    need: 'inherited',
  },
  {
    id: 'single sentence',
    inTurnOk: false,
    inWellFormed: true,
    neededForV: false,
    neededForState: false,
    neededForPayloadDecode: false,
    origin: 'C6 well_formed. Dropped by M2 turnOk.',
    need: 'inherited',
  },
  {
    id: `tokens ≥ ${MIN_TOKENS}`,
    inTurnOk: true,
    inWellFormed: true,
    neededForV: false,
    neededForState: false,
    neededForPayloadDecode: false,
    origin: 'C6 well_formed carrier min.',
    need: 'inherited',
  },
  {
    id: `letters ≥ ${MIN_SELECTED_LETTERS}`,
    inTurnOk: true,
    inWellFormed: true,
    neededForV: false,
    neededForState: false,
    neededForPayloadDecode: false,
    origin: 'C6 well_formed carrier min. Encoder search, not decode.',
    need: 'inherited',
  },
  {
    id: 'unicode / non-a-z',
    inTurnOk: false,
    inWellFormed: false,
    neededForV: false,
    neededForState: false,
    neededForPayloadDecode: false,
    origin: 'C6 ignores marks, spaces, punctuation. No reject gate.',
    need: 'absent',
  },
  {
    id: 'START / FINISH tokens',
    inTurnOk: false,
    inWellFormed: false,
    neededForV: false,
    neededForState: false,
    neededForPayloadDecode: false,
    origin: 'F1 control recognition. Checked before eligible(U).',
    need: 'control',
  },
  {
    id: 'D / E remnants',
    inTurnOk: false,
    inWellFormed: false,
    neededForV: false,
    neededForState: false,
    neededForPayloadDecode: false,
    origin: 'Not in Profile 0 body path.',
    need: 'absent',
  },
];

export interface GateRow {
  utterance: string;
  v: number;
  vDefined: true;
  terminal: boolean;
  tokens: boolean;
  letters: boolean;
  digits: boolean;
  single: boolean;
  turnOk: boolean;
  wellFormed: boolean;
  control: boolean;
}

export function gates(u: string): GateRow {
  return {
    utterance: u,
    v: carrier(u),
    vDefined: true,
    terminal: hasTerminal(u),
    tokens: tokenCountOk(u),
    letters: letterCountOk(u),
    digits: noDigits(u),
    single: singleSentence(u),
    turnOk: turnOk(u),
    wellFormed: wellFormed(u),
    control: isControl(u),
  };
}

/** turnOk minus the digit ban. Analysis only. */
export function turnOkIfDigitsAllowed(u: string): boolean {
  const trimmed = u.trim();
  return hasTerminal(trimmed) && tokenCountOk(trimmed) && letterCountOk(trimmed);
}

export interface SetAudit {
  n: number;
  turnOk: number;
  wellFormed: number;
  vDefined: number;
  failDigits: number;
  failDigitsOnly: number;
  wouldPassWithoutDigitBan: number;
  failTokens: number;
  failLetters: number;
  failTerminal: number;
  control: number;
}

export function auditSet(us: readonly string[]): SetAudit {
  const rows = us.map(gates);
  return {
    n: rows.length,
    turnOk: rows.filter((r) => r.turnOk).length,
    wellFormed: rows.filter((r) => r.wellFormed).length,
    vDefined: rows.length,
    failDigits: rows.filter((r) => !r.digits).length,
    failDigitsOnly: rows.filter((r) => !r.digits && r.terminal && r.tokens && r.letters).length,
    wouldPassWithoutDigitBan: us.filter(turnOkIfDigitsAllowed).length,
    failTokens: rows.filter((r) => !r.tokens).length,
    failLetters: rows.filter((r) => !r.letters).length,
    failTerminal: rows.filter((r) => !r.terminal).length,
    control: rows.filter((r) => r.control).length,
  };
}
