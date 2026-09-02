/**
 * NCMP-V4-F10. Result #10, PASS, frozen.
 * Sparse frame carries a declared 8-bit argument.
 * DATA consumes the next {0,10,11} prefix.
 * SKIP does not advance the cursor.
 * Do not enlarge k. Do not change half3.
 */
import { FINISH_EXAMPLE, Participant, deliver, handshake } from './f1.ts';
import {
  ARGUMENT_BITS,
  ARGUMENT_BITS_TEXT,
  BATCH,
  START_8,
  declaredBits,
  hexFromValue,
  intentPrompt,
  promptIsBlind,
  runDeclaredFrame,
} from './f4.ts';
import { INITIAL_MODE, MAP, carrier, interpret, turnOk, type Bits, type Mode, type TraceStep } from './f9.ts';

export {
  ARGUMENT_BITS,
  ARGUMENT_BITS_TEXT,
  BATCH,
  FINISH_EXAMPLE,
  INITIAL_MODE,
  MAP,
  Participant,
  START_8,
  carrier,
  declaredBits,
  handshake,
  hexFromValue,
  intentPrompt,
  interpret,
  promptIsBlind,
  runDeclaredFrame,
  turnOk,
};
export type { Bits, Mode, TraceStep };

export const ARGUMENT = 0b10110110;
export const ARGUMENT_HEX = 'b6';
export const EXPECTED_SYMBOLS: readonly Bits[] = ['10', '11', '0', '11', '0'];

/**
 * Declared before generation. Unused stay unused.
 * Length absorbs SKIP as well as DATA.
 */
export const INTENTS = [
  { speaker: 'A', text: 'Ask if they still want to go to the market in the morning.' },
  { speaker: 'B', text: 'Say the early stall is worth it if they leave before nine.' },
  { speaker: 'A', text: 'Ask whether they should pick up bread there or bake later.' },
  { speaker: 'B', text: 'Say last time the loaves were gone by the time they arrived.' },
  { speaker: 'A', text: 'Ask if they need anything else besides tomatoes.' },
  { speaker: 'B', text: 'Mention they still have rice but are out of lemons.' },
  { speaker: 'A', text: 'Ask whether they want to cook at home or eat nearby after.' },
  { speaker: 'B', text: 'Say cooking at home is fine if the kitchen is not a mess.' },
  { speaker: 'A', text: 'Ask if they should invite the others or keep it small.' },
  { speaker: 'B', text: 'Say keep it small this week and try again later.' },
  { speaker: 'A', text: 'Suggest meeting by the side entrance if it rains.' },
  { speaker: 'B', text: 'Say they will text once they find a place to park.' },
  { speaker: 'A', text: 'Ask if they want to split the shopping list tonight.' },
  { speaker: 'B', text: 'Say they can handle the fruit if the other person does the dry goods.' },
  { speaker: 'A', text: 'Mention the parking lot fills up fast on Saturday.' },
  { speaker: 'B', text: 'Say they should leave a bit earlier than last week.' },
] as const;

const PREFIXES: readonly Bits[] = ['11', '10', '0'];

export function nextPrefix(remaining: string): Bits | null {
  for (const p of PREFIXES) {
    if (remaining.startsWith(p)) return p;
  }
  return null;
}

export function parseSymbols(payload: string): Bits[] | null {
  const out: Bits[] = [];
  let rest = payload;
  while (rest.length > 0) {
    const p = nextPrefix(rest);
    if (p === null) return null;
    out.push(p);
    rest = rest.slice(p.length);
  }
  return out;
}

function uniqueInOrder(xs: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of xs) {
    const t = x.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

export interface Selection {
  considered: string[];
  legal: string[];
  chosen: string | null;
  chosenIndex: number;
}

export function selectAny(candidates: readonly string[]): Selection {
  const considered = uniqueInOrder(candidates).slice(0, BATCH);
  const legal = considered.filter(turnOk);
  return {
    considered,
    legal,
    chosen: legal[0] ?? null,
    chosenIndex: legal.length > 0 ? 0 : -1,
  };
}

/** First legal U whose DATA symbol is the next prefix. next_mode is free. */
export function selectSymbol(candidates: readonly string[], bits: Bits): Selection {
  const considered = uniqueInOrder(candidates).slice(0, BATCH);
  const legal = considered.filter(turnOk);
  const chosenIndex = legal.findIndex((u) => MAP(carrier(u)).bits === bits);
  return {
    considered,
    legal,
    chosen: chosenIndex >= 0 ? legal[chosenIndex] : null,
    chosenIndex,
  };
}

export type Reassembly =
  | { kind: 'UNDECLARED' }
  | { kind: 'INCOMPLETE'; have: number; need: number }
  | { kind: 'OVERFLOW'; have: number; need: number }
  | { kind: 'ARGUMENT'; bits: number; value: number; hex: string; bitsText: string };

export function reassemble(start: string, body: readonly string[]): Reassembly {
  const need = declaredBits(start);
  if (need === null) return { kind: 'UNDECLARED' };
  const bitsText = interpret(body).bits;
  if (bitsText.length < need) return { kind: 'INCOMPLETE', have: bitsText.length, need };
  if (bitsText.length > need) return { kind: 'OVERFLOW', have: bitsText.length, need };
  const value = parseInt(bitsText, 2);
  return { kind: 'ARGUMENT', bits: need, value, hex: hexFromValue(value, need), bitsText };
}

export interface EncodeTurn {
  speaker: string;
  intent: string;
  mode: Mode;
  bits: string;
  next: Mode;
  utterance: string;
  c6: number;
}

export type EncodeResult =
  | { kind: 'ENCODED'; body: string[]; bits: string; turns: EncodeTurn[] }
  | { kind: 'NO_CANDIDATE'; body: string[]; turns: EncodeTurn[]; index: number; mode: Mode; wanted: string }
  | { kind: 'INCOMPLETE'; body: string[]; turns: EncodeTurn[]; have: number };

export function encodeFromSets(payload: string, sets: readonly (readonly string[])[]): EncodeResult {
  let mode: Mode = INITIAL_MODE;
  let remaining = payload;
  const body: string[] = [];
  const turns: EncodeTurn[] = [];
  for (let i = 0; i < INTENTS.length; i++) {
    if (remaining.length === 0) break;
    const intent = INTENTS[i];
    const wanted = mode === 'DATA' ? nextPrefix(remaining) : '';
    if (mode === 'DATA' && wanted === null) {
      return { kind: 'NO_CANDIDATE', body, turns, index: i, mode, wanted: remaining };
    }
    const sel = mode === 'SKIP' ? selectAny(sets[i] ?? []) : selectSymbol(sets[i] ?? [], wanted as Bits);
    if (sel.chosen === null) {
      return { kind: 'NO_CANDIDATE', body, turns, index: i, mode, wanted: wanted ?? '' };
    }
    const v = carrier(sel.chosen);
    const read = interpret([sel.chosen], mode);
    const step = read.steps[0];
    body.push(sel.chosen);
    turns.push({
      speaker: intent.speaker,
      intent: intent.text,
      mode: step.mode,
      bits: step.bits,
      next: step.next,
      utterance: sel.chosen,
      c6: v,
    });
    remaining = remaining.slice(step.bits.length);
    mode = step.next;
  }
  if (remaining.length > 0) return { kind: 'INCOMPLETE', body, turns, have: payload.length - remaining.length };
  return { kind: 'ENCODED', body, bits: payload, turns };
}

export function scheduleOf(steps: readonly TraceStep[]): string {
  return steps.map((s) => (s.mode === 'DATA' ? 'D' : 'S')).join(' ');
}

export function deliverStart(from: Participant, to: Participant, start: string) {
  return deliver(from, to, start);
}
