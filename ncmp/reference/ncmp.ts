/**
 * NCMP v0.1 reference decoder.
 * Implements the machine in ../NCMP.md. Does not define it.
 * Encoder, search, and surface hygiene are out of scope.
 */

export type Speaker = 'A' | 'B';
export type Session = 'idle' | 'handshake' | 'active';
export type Mode = 'SKIP' | 'DATA';

export type Outcome =
  | 'PROBE'
  | 'ACK'
  | 'NOT_NCMP'
  | 'START'
  | 'UNDECLARED'
  | 'CHAT'
  | 'NO_FRAME'
  | 'CONTROL_ERROR'
  | 'BODY_SKIP'
  | 'BODY_DATA'
  | 'PAYLOAD_COMPLETE'
  | 'FINISH_ARGUMENT'
  | 'INCOMPLETE'
  | 'HEADER_RESERVED'
  | 'OVERFLOW'
  | 'NEST'
  | 'NOT_OWNER';

export interface Profile {
  actions: readonly string[];
  resources: readonly string[];
  control_seed?: number;
  bootstrap_hint?: string;
  session_words?: readonly string[];
}

/** Example Baseline Profile. Not the NCMP vocabulary. */
export const CONTROL_SEED = 0x9ca2c1c1;
export const BOOTSTRAP_HINT = 'umbrella';
export const SECONDARY_MASK = 0x3f;
export const ARGUMENT_LENGTHS = [0, 5, 8, 24, 128] as const;

/**
 * Closed session vocabulary. Used only to fill a missing pair word.
 * Not a rarity list. Not umbrella.
 */
export const SESSION_WORDS = [
  'along',
  'around',
  'bench',
  'bottle',
  'bread',
  'bridge',
  'coffee',
  'corner',
  'early',
  'enough',
  'extra',
  'flask',
  'gate',
  'jacket',
  'later',
  'market',
  'maybe',
  'mostly',
  'packed',
  'park',
  'pasta',
  'path',
  'ridge',
  'shops',
  'simple',
  'sweater',
  'trail',
  'turn',
  'view',
  'walk',
  'weather',
  'window',
] as const;

/** Closed function words, length ≥ 5. Not taken from a handshake. */
export const STOP = new Set([
  'about',
  'after',
  'again',
  'because',
  'before',
  'being',
  'between',
  'could',
  'every',
  'first',
  'going',
  'having',
  'might',
  'other',
  'rather',
  'shall',
  'should',
  'since',
  'still',
  'their',
  'there',
  'these',
  'those',
  'though',
  'through',
  'under',
  'until',
  'where',
  'which',
  'while',
  'would',
  'without',
  'within',
]);

export const MIN_WORD = 5;

export const BASELINE_PROFILE: Profile = {
  actions: ['GET', 'SET'],
  resources: ['CUSTOMER', 'ORDER'],
  control_seed: CONTROL_SEED,
  bootstrap_hint: BOOTSTRAP_HINT,
  session_words: SESSION_WORDS,
};

export const LENGTH_MARKERS = {
  empty: 0,
  short: 5,
  tiny: 8,
  brief: 24,
  wide: 128,
} as const;

export type LengthMarker = keyof typeof LENGTH_MARKERS;

/** Demonstrated handshake and frame strings. Exact UTF-8, including punctuation. */
export const EXAMPLES = {
  PROBE:
    'Thinking we could walk Saturday morning—what do you say? I’ll pack an umbrella, just to be on the safe side!',
  ACK: "Sounds good. I'll bring my umbrella too, just in case.",
  START_5: 'We can set off Saturday in the morning. The park works!',
  L0: "Yeah, I guess let's head out in the morning. I'll grab the umbrella too!",
  L8: "Yeah, I guess let's head out in the morning. I'll have an umbrella as well!",
  L128: "Yeah, I guess we can set off Saturday morning. I'll grab an umbrella too.",
  FINISH: "Alright, that sounds good. I'll bring the notes.",
} as const;

export interface ApplicationObject {
  action: string;
  resource: string;
  argument: string;
}

export interface FrameState {
  owner: Speaker;
  argument_bits: number;
  mode: Mode;
  accumulator: string;
  header_remaining: number;
  argument_remaining: number;
}

export interface ProtocolState {
  session: Session;
  frame: FrameState | null;
  last_object: ApplicationObject | null;
  u_probe: string | null;
  u_ack: string | null;
  k_session: number | null;
}

export function tokenize(utterance: string): string[] {
  return utterance
    .normalize('NFC')
    .toLowerCase()
    .split(/\s+/)
    .map((part) => part.replace(/[^a-z]/g, ''))
    .filter((part) => part.length > 0);
}

export function c6(utterance: string): number {
  const nfc = utterance.normalize('NFC').toLowerCase();
  let sum = 0;
  for (const ch of nfc) {
    const code = ch.codePointAt(0);
    if (code !== undefined && code >= 97 && code <= 122) sum += code - 96;
  }
  return sum % 64;
}

export function transition(v: number): Mode {
  return v < 32 ? 'DATA' : 'SKIP';
}

export function symbol(remaining: number, v: number): string {
  if (remaining <= 0) return '';
  if (remaining === 1) return v % 2 === 0 ? '0' : '1';
  const r = v % 3;
  if (r === 0) return '0';
  if (r === 1) return '10';
  return '11';
}

export function actionWidth(profile: Profile): number {
  return profile.actions.length <= 1 ? 0 : Math.ceil(Math.log2(profile.actions.length));
}

export function resourceWidth(profile: Profile): number {
  return profile.resources.length <= 1 ? 0 : Math.ceil(Math.log2(profile.resources.length));
}

export function headerWidth(profile: Profile): number {
  return actionWidth(profile) + resourceWidth(profile);
}

export function headerCost(actionCount: number, resourceCount: number): number {
  const a = actionCount <= 1 ? 0 : Math.ceil(Math.log2(actionCount));
  const r = resourceCount <= 1 ? 0 : Math.ceil(Math.log2(resourceCount));
  return a + r;
}

export function parseHeader(
  acc: string,
  profile: Profile,
): { action: string | null; resource: string | null; argument: string | null; reserved: boolean } {
  const aw = actionWidth(profile);
  const rw = resourceWidth(profile);
  const h = aw + rw;
  let action: string | null = null;
  let resource: string | null = null;
  let reserved = false;
  if (acc.length >= aw) {
    const code = aw === 0 ? 0 : Number.parseInt(acc.slice(0, aw), 2);
    if (code < profile.actions.length) action = profile.actions[code];
    else reserved = true;
  }
  if (acc.length >= h) {
    const code = rw === 0 ? 0 : Number.parseInt(acc.slice(aw, h), 2);
    if (code < profile.resources.length) resource = profile.resources[code];
    else reserved = true;
  }
  return {
    action,
    resource,
    argument: acc.length >= h ? acc.slice(h) : null,
    reserved,
  };
}

const FNV_OFFSET = 2166136261;
const FNV_PRIME = 16777619;
const utf8 = new TextEncoder();

/** FNV-1a 32 of exact UTF-8. Control identity. Not C6. */
export function fnv1a32(bytes: Uint8Array): number {
  let h = FNV_OFFSET;
  for (const b of bytes) {
    h ^= b;
    h = Math.imul(h, FNV_PRIME) >>> 0;
  }
  return h >>> 0;
}

export function profileSeed(profile: Profile): number {
  return profile.control_seed ?? CONTROL_SEED;
}

export function profileHint(profile: Profile): string {
  return profile.bootstrap_hint ?? BOOTSTRAP_HINT;
}

export function hasHint(utterance: string, hint: string = BOOTSTRAP_HINT): boolean {
  return tokenize(utterance).includes(hint);
}

export function pSec(utterance: string): number {
  return fnv1a32(utf8.encode(utterance)) & SECONDARY_MASK;
}

function seedPrefixed(seed: number, tag: number): Uint8Array {
  return Uint8Array.of((seed >>> 24) & 0xff, (seed >>> 16) & 0xff, (seed >>> 8) & 0xff, seed & 0xff, tag);
}

function concatBytes(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a);
  out.set(b, a.length);
  return out;
}

export function tProbe(seed: number = CONTROL_SEED): number {
  return seed & SECONDARY_MASK;
}

export function tAck(uProbe: string, seed: number = CONTROL_SEED): number {
  return fnv1a32(concatBytes(seedPrefixed(seed, 0x00), utf8.encode(uProbe))) & SECONDARY_MASK;
}

export function kSession32(uProbe: string, uAck: string, seed: number = CONTROL_SEED): number {
  const a = utf8.encode(uProbe);
  const b = utf8.encode(uAck);
  const bytes = new Uint8Array(5 + a.length + 1 + b.length);
  bytes.set(seedPrefixed(seed, 0x00));
  bytes.set(a, 5);
  bytes[5 + a.length] = 0x01;
  bytes.set(b, 5 + a.length + 1);
  return fnv1a32(bytes);
}

export function tState(label: 'START' | 'FINISH', session: number): number {
  return fnv1a32(concatBytes(seedPrefixed(session, 0x00), utf8.encode(label))) & SECONDARY_MASK;
}

export function argumentLength(utterance: string, session: number): number {
  return ARGUMENT_LENGTHS[fnv1a32(concatBytes(seedPrefixed(session, 0x02), utf8.encode(utterance))) % ARGUMENT_LENGTHS.length];
}

export function isProbe(utterance: string, profile: Profile = BASELINE_PROFILE): boolean {
  return hasHint(utterance, profileHint(profile)) && pSec(utterance) === tProbe(profileSeed(profile));
}

export function isAck(
  utterance: string,
  uProbe: string,
  profile: Profile = BASELINE_PROFILE,
): boolean {
  return hasHint(utterance, profileHint(profile)) && pSec(utterance) === tAck(uProbe, profileSeed(profile));
}

export function profileWords(profile: Profile = BASELINE_PROFILE): readonly string[] {
  return profile.session_words ?? SESSION_WORDS;
}

/** Maximal [a-z]+ runs after NFC lowercase. Frame-cue words, not hint tokens. */
export function words(utterance: string): string[] {
  return utterance.normalize('NFC').toLowerCase().match(/[a-z]+/g) ?? [];
}

export function eligibleWords(utterance: string, profile: Profile = BASELINE_PROFILE): string[] {
  const hint = profileHint(profile);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const w of words(utterance)) {
    if (w.length < MIN_WORD) continue;
    if (w === hint) continue;
    if (STOP.has(w)) continue;
    if (seen.has(w)) continue;
    seen.add(w);
    out.push(w);
  }
  return out;
}

export type Pair = readonly [string, string];

export function eligiblePairs(utterance: string, profile: Profile = BASELINE_PROFILE): Pair[] {
  const elig = eligibleWords(utterance, profile);
  const out: Pair[] = [];
  for (let i = 0; i < elig.length; i += 1) {
    for (let j = i + 1; j < elig.length; j += 1) out.push([elig[i], elig[j]]);
  }
  return out;
}

function selectDonatedPair(utterance: string, tag: number, profile: Profile = BASELINE_PROFILE): Pair | null {
  const pairs = eligiblePairs(utterance, profile);
  if (pairs.length === 0) return null;
  const seed = profileSeed(profile);
  const prefix = seedPrefixed(seed, tag);
  const body = utf8.encode(utterance);
  const bytes = new Uint8Array(prefix.length + body.length);
  bytes.set(prefix);
  bytes.set(body, prefix.length);
  return pairs[fnv1a32(bytes) % pairs.length];
}

export function derivedWord(
  session: number,
  role: 'START' | 'FINISH',
  slot: 0 | 1,
  exclude: string | null = null,
  profile: Profile = BASELINE_PROFILE,
): string {
  const list = profileWords(profile);
  const tag = (role === 'START' ? 0x0a : 0x0c) + slot;
  const prefix = seedPrefixed(session, tag);
  const label = utf8.encode(role);
  const bytes = new Uint8Array(prefix.length + label.length);
  bytes.set(prefix);
  bytes.set(label, prefix.length);
  const i = fnv1a32(bytes) % list.length;
  const word = list[i];
  if (exclude !== null && word === exclude) return list[(i + 1) % list.length];
  return word;
}

export function completePair(
  utterance: string,
  session: number,
  role: 'START' | 'FINISH',
  profile: Profile = BASELINE_PROFILE,
): Pair {
  const donated = selectDonatedPair(utterance, role === 'START' ? 0x06 : 0x07, profile);
  if (donated !== null) return donated;
  const elig = eligibleWords(utterance, profile);
  if (elig.length === 1) {
    return [elig[0], derivedWord(session, role, 1, elig[0], profile)];
  }
  const first = derivedWord(session, role, 0, null, profile);
  return [first, derivedWord(session, role, 1, first, profile)];
}

export function hasOrderedPair(utterance: string, pair: Pair): boolean {
  const ws = words(utterance);
  const ia = ws.indexOf(pair[0]);
  const ib = ws.indexOf(pair[1]);
  return ia >= 0 && ib >= 0 && ia < ib;
}

export function isStart(
  utterance: string,
  uProbe: string,
  session: number,
  profile: Profile = BASELINE_PROFILE,
): boolean {
  return (
    hasOrderedPair(utterance, completePair(uProbe, session, 'START', profile)) &&
    pSec(utterance) === tState('START', session)
  );
}

export function isFinish(
  utterance: string,
  uAck: string,
  session: number,
  profile: Profile = BASELINE_PROFILE,
): boolean {
  return (
    hasOrderedPair(utterance, completePair(uAck, session, 'FINISH', profile)) &&
    pSec(utterance) === tState('FINISH', session)
  );
}

function tokens(utterance: string): Set<string> {
  return new Set(tokenize(utterance));
}

function hasAll(set: Set<string>, words: readonly string[]): boolean {
  return words.every((w) => set.has(w));
}

/** Historical P7 phrases. Not Baseline control. */
export function isLexicalProbe(utterance: string): boolean {
  return hasAll(tokens(utterance), ['compare', 'notes', 'usual']);
}

export function isLexicalAck(utterance: string): boolean {
  return hasAll(tokens(utterance), ['aligned', 'briefing']);
}

export function isLexicalStart(utterance: string): boolean {
  const t = tokens(utterance);
  return hasAll(t, ['begin', 'round', 'now']) && !hasAll(t, ['close', 'round', 'here']);
}

export function isLexicalFinish(utterance: string): boolean {
  const t = tokens(utterance);
  return hasAll(t, ['close', 'round', 'here']) && !hasAll(t, ['begin', 'round', 'now']);
}

function copyFrame(frame: FrameState | null): FrameState | null {
  return frame === null ? null : { ...frame };
}

export class NCMP {
  readonly profile: Profile;
  private session: Session = 'idle';
  private frame: FrameState | null = null;
  private last_object: ApplicationObject | null = null;
  private u_probe: string | null = null;
  private u_ack: string | null = null;
  private k_session: number | null = null;
  private lastBits = '';

  constructor(profile: Profile = BASELINE_PROFILE) {
    this.profile = {
      ...BASELINE_PROFILE,
      ...profile,
      actions: profile.actions,
      resources: profile.resources,
      control_seed: profile.control_seed ?? BASELINE_PROFILE.control_seed,
      bootstrap_hint: profile.bootstrap_hint ?? BASELINE_PROFILE.bootstrap_hint,
      session_words: profile.session_words ?? BASELINE_PROFILE.session_words,
    };
  }

  get state(): ProtocolState {
    return {
      session: this.session,
      frame: copyFrame(this.frame),
      last_object: this.last_object === null ? null : { ...this.last_object },
      u_probe: this.u_probe,
      u_ack: this.u_ack,
      k_session: this.k_session,
    };
  }

  get bits(): string {
    return this.lastBits;
  }

  process(speaker: Speaker, utterance: string): Outcome {
    this.lastBits = '';
    const h = headerWidth(this.profile);

    if (this.session === 'idle') {
      if (isProbe(utterance, this.profile)) {
        this.session = 'handshake';
        this.u_probe = utterance;
        return 'PROBE';
      }
      return 'NOT_NCMP';
    }

    if (this.session === 'handshake') {
      if (this.u_probe !== null && isAck(utterance, this.u_probe, this.profile)) {
        this.session = 'active';
        this.u_ack = utterance;
        this.k_session = kSession32(this.u_probe, utterance, profileSeed(this.profile));
        return 'ACK';
      }
      return 'NOT_NCMP';
    }

    const session = this.k_session;
    const uProbe = this.u_probe;
    const uAck = this.u_ack;
    if (session === null || uProbe === null || uAck === null) return 'NOT_NCMP';

    if (this.frame === null) {
      if (isStart(utterance, uProbe, session, this.profile)) {
        const n = argumentLength(utterance, session);
        this.frame = {
          owner: speaker,
          argument_bits: n,
          mode: 'SKIP',
          accumulator: '',
          header_remaining: h,
          argument_remaining: n,
        };
        return 'START';
      }
      if (isFinish(utterance, uAck, session, this.profile)) return 'NO_FRAME';
      return 'CHAT';
    }

    if (isStart(utterance, uProbe, session, this.profile)) return 'NEST';

    if (isFinish(utterance, uAck, session, this.profile)) {
      if (speaker !== this.frame.owner) return 'NOT_OWNER';
      const need = this.frame.header_remaining + this.frame.argument_remaining;
      if (need > 0) {
        this.frame = null;
        return 'INCOMPLETE';
      }
      const fields = parseHeader(this.frame.accumulator, this.profile);
      if (fields.reserved || fields.action === null || fields.resource === null) {
        this.frame = null;
        return 'HEADER_RESERVED';
      }
      this.last_object = {
        action: fields.action,
        resource: fields.resource,
        argument: fields.argument as string,
      };
      this.frame = null;
      return 'FINISH_ARGUMENT';
    }

    const v = c6(utterance);
    const f = this.frame;
    const need = f.header_remaining + f.argument_remaining;

    if (speaker === f.owner && f.mode === 'DATA' && need === 0) {
      f.mode = transition(v);
      return 'PAYLOAD_COMPLETE';
    }

    const bits = speaker === f.owner && f.mode === 'DATA' && need > 0 ? symbol(need, v) : '';
    if (bits.length > need) return 'OVERFLOW';

    f.mode = transition(v);
    if (bits !== '') {
      f.accumulator += bits;
      const filled = f.accumulator.length;
      f.header_remaining = Math.max(0, h - filled);
      f.argument_remaining = f.argument_bits - Math.max(0, filled - h);
      this.lastBits = bits;
      return 'BODY_DATA';
    }
    return 'BODY_SKIP';
  }
}
