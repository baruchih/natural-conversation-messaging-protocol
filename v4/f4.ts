/**
 * NCMP-V4-F4. Result #4, PASS, frozen.
 * 8-bit argument through history-derived C6 bins.
 * Unchanged LM turns. No K4. No six-bit target.
 * R, π, accept, and BATCH = 50 are frozen.
 * Do not enlarge BATCH. Do not regenerate.
 */
import { tokenList } from '../v1-v2/p7c6.lm.ts';
import { acceptBits, carrier, rate, symbolBits } from '../v3/coding.ts';
import { parseCandidates, turnOk } from '../v3/m2.ts';
import {
  FINISH_EXAMPLE,
  Participant,
  deliver,
  handshake,
  isFinish,
  isStart,
} from './f1.ts';

export {
  FINISH_EXAMPLE,
  Participant,
  acceptBits,
  carrier,
  handshake,
  isFinish,
  isStart,
  parseCandidates,
  rate,
  symbolBits,
  turnOk,
};

/** Published bit-count marker. F3's brief → 24 is not used. */
export const BIT_MARKERS = { tiny: 8 } as const;

export const ARGUMENT_BITS = 8;
export const ARGUMENT_BITS_TEXT = '10110110';
export const ARGUMENT = 0b10110110;
export const ARGUMENT_HEX = 'b6';

export const START_8 = 'Shall we begin this tiny round now?';

/** Declared before the run. Same k as M2. Do not enlarge. */
export const BATCH = 50;

/**
 * Published conversational script. Enough for 8 bits at r = 1.
 * Unused intents stay unused. Do not add intents after a miss.
 */
export const INTENTS = [
  { speaker: 'A', text: 'Ask how dinner went last night after they sat down.' },
  { speaker: 'B', text: 'Say dinner was pretty good overall though the service was a little slow.' },
  { speaker: 'A', text: 'Ask what they ended up ordering.' },
  { speaker: 'B', text: 'Mention the pasta was decent and the bread came out warm.' },
  { speaker: 'A', text: 'Ask whether they stayed long once the place filled up.' },
  { speaker: 'B', text: 'Say they left before dessert because the room got loud.' },
  { speaker: 'A', text: 'Ask if the evening was still worth it after the wait.' },
  { speaker: 'B', text: 'Say mostly yes and the coffee almost made up for it.' },
] as const;

export function declaredBits(start: string): number | null {
  if (!isStart(start)) return null;
  const tokens = new Set(tokenList(start));
  for (const [mark, n] of Object.entries(BIT_MARKERS)) {
    if (tokens.has(mark)) return n;
  }
  return null;
}

export function hexFromValue(value: number, bits: number): string {
  return value.toString(16).padStart(Math.ceil(bits / 4), '0');
}

export function intentPrompt(
  history: readonly { speaker: string; utterance: string }[],
  speaker: string,
  intent: string,
  k = BATCH,
): string {
  const soFar = history.length
    ? history.map((t) => `${t.speaker}: ${t.utterance}`).join('\n')
    : '(no turns yet)';
  return `Conversation so far:
${soFar}

${speaker}'s next conversational intent:
${intent}

Generate ${k} genuinely different, natural ways ${speaker} could continue this conversation while preserving that intent. Vary sentence structure, phrasing, discourse style, contractions, and conversational framing. Do not merely substitute synonyms into one template. One conversational turn per line. A turn may contain more than one sentence. No numbering. No quotation marks.`;
}

export function promptIsBlind(history: readonly { speaker: string; utterance: string }[], speaker: string, intent: string): boolean {
  return isBlind(intentPrompt(history, speaker, intent)) && isBlind(intent) && history.every((t) => isBlind(t.utterance));
}

function isBlind(p: string): boolean {
  const t = p.toLowerCase();
  if (t.includes('ncmp') || t.includes('residue') || t.includes('letter-sum')) return false;
  if (t.includes('encode') || t.includes('protocol') || /\b64\b/.test(t)) return false;
  return true;
}

export interface Selection {
  considered: string[];
  legal: string[];
  chosen: string | null;
  chosenIndex: number;
}

/** First turnOk U in the declared budget whose π matches. No mutation. */
export function selectAccepted(candidates: readonly string[], r: number, needBits: string): Selection {
  const considered = uniqueInOrder(candidates).slice(0, BATCH);
  const legal = considered.filter(turnOk);
  const chosenIndex = legal.findIndex((u) => acceptBits(u, r, needBits));
  return {
    considered,
    legal,
    chosen: chosenIndex >= 0 ? legal[chosenIndex] : null,
    chosenIndex,
  };
}

function uniqueInOrder(candidates: readonly string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of candidates) {
    const u = raw.trim();
    if (!u) continue;
    const key = u.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(u);
  }
  return out;
}

export type Reassembly =
  | { kind: 'UNDECLARED' }
  | { kind: 'INCOMPLETE'; have: number; need: number }
  | { kind: 'OVERFLOW'; have: number; need: number }
  | { kind: 'ARGUMENT'; bits: number; value: number; hex: string; bitsText: string };

/** FINISH reconstructs concatenated π symbols. Not K4. Not decode6. */
export function reassemble(start: string, body: readonly string[]): Reassembly {
  const need = declaredBits(start);
  if (need === null) return { kind: 'UNDECLARED' };
  let last = start;
  let remaining = need;
  let bitsText = '';
  for (const u of body) {
    const r = rate(last, remaining);
    if (r === 0) return { kind: 'OVERFLOW', have: bitsText.length, need };
    bitsText += symbolBits(carrier(u), r);
    remaining -= r;
    last = u;
  }
  if (remaining > 0) return { kind: 'INCOMPLETE', have: bitsText.length, need };
  const value = parseInt(bitsText, 2);
  return { kind: 'ARGUMENT', bits: need, value, hex: hexFromValue(value, need), bitsText };
}

export interface TraceTurn {
  speaker: string;
  intent: string;
  r: number;
  wanted: string;
  utterance: string;
  c6: number;
  pi: string;
  recovered: string;
  legal: number;
  considered: number;
  chosenIndex: number;
}

export type EncodeResult =
  | { kind: 'ENCODED'; turns: TraceTurn[]; bits: string }
  | { kind: 'NO_CANDIDATE'; turns: TraceTurn[]; intentIndex: number; r: number; wanted: string; legal: number; considered: number };

export function encodeFromSets(
  payload: string,
  start: string,
  sets: readonly (readonly string[])[],
): EncodeResult {
  let last = start;
  let remaining = payload;
  const turns: TraceTurn[] = [];
  for (let i = 0; i < INTENTS.length; i++) {
    if (remaining.length === 0) break;
    const intent = INTENTS[i];
    const r = rate(last, remaining.length);
    const wanted = remaining.slice(0, r);
    const sel = selectAccepted(sets[i] ?? [], r, wanted);
    if (sel.chosen === null) {
      return {
        kind: 'NO_CANDIDATE',
        turns,
        intentIndex: i,
        r,
        wanted,
        legal: sel.legal.length,
        considered: sel.considered.length,
      };
    }
    const c6 = carrier(sel.chosen);
    const pi = symbolBits(c6, r);
    turns.push({
      speaker: intent.speaker,
      intent: intent.text,
      r,
      wanted,
      utterance: sel.chosen,
      c6,
      pi,
      recovered: pi,
      legal: sel.legal.length,
      considered: sel.considered.length,
      chosenIndex: sel.chosenIndex,
    });
    remaining = remaining.slice(r);
    last = sel.chosen;
  }
  if (remaining.length > 0) {
    return { kind: 'NO_CANDIDATE', turns, intentIndex: INTENTS.length, r: 0, wanted: remaining, legal: 0, considered: 0 };
  }
  return { kind: 'ENCODED', turns, bits: payload };
}

export function runDeclaredFrame(
  initiator: Participant,
  responder: Participant,
  start: string,
  body: readonly string[],
) {
  const opened = deliver(initiator, responder, start);
  if (opened.left.kind !== 'START' || opened.right.kind !== 'START') {
    throw new Error('START failed');
  }
  for (const u of body) {
    const t = deliver(initiator, responder, u);
    if (t.left.kind !== 'BODY' || t.right.kind !== 'BODY') {
      throw new Error(`BODY failed: ${u}`);
    }
  }
  const closed = deliver(initiator, responder, FINISH_EXAMPLE);
  if (closed.left.kind !== 'FINISH' || closed.right.kind !== 'FINISH') {
    throw new Error('FINISH failed');
  }
  if (closed.left.kind !== 'FINISH') throw new Error('unreachable');
  if (closed.right.kind !== 'FINISH') throw new Error('unreachable');
  return { left: closed.left.frame, right: closed.right.frame };
}
