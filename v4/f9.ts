/**
 * NCMP-V4-F9. Result #9, PASS, frozen.
 * Joint decode(mode, V) → (bits, next_mode).
 * half3: F7 next_mode plus V mod 3. Minimal lift.
 * Do not enlarge k. Do not change the map.
 */
import { carrier } from '../v3/coding.ts';
import { parseCandidates, turnOk } from '../v3/m2.ts';
import { FINISH_EXAMPLE, Participant, START_EXAMPLE, handshake, runFrame } from './f1.ts';
import { BATCH, intentPrompt, promptIsBlind } from './f4.ts';
import { INITIAL_MODE } from './f7.ts';
import {
  DATA_OUTCOMES,
  decode,
  half3,
  jSkipFromData,
  label,
  type Bits,
  type Mode,
} from './j.ts';

export {
  BATCH,
  DATA_OUTCOMES,
  FINISH_EXAMPLE,
  INITIAL_MODE,
  Participant,
  START_EXAMPLE,
  carrier,
  decode,
  handshake,
  intentPrompt,
  parseCandidates,
  promptIsBlind,
  runFrame,
  turnOk,
};
export type { Bits, Mode };

export const MAP = half3;
export const MAP_NAME = 'half3';

export interface Target {
  mode: Mode;
  bits: '' | Bits;
  next: Mode;
}

/** Declared before generation. First body turn is SKIP. */
export const TARGETS: readonly Target[] = [
  { mode: 'SKIP', bits: '', next: 'DATA' },
  { mode: 'DATA', bits: '10', next: 'SKIP' },
  { mode: 'SKIP', bits: '', next: 'DATA' },
  { mode: 'DATA', bits: '11', next: 'DATA' },
  { mode: 'DATA', bits: '0', next: 'SKIP' },
];

export const EXPECTED_SCHEDULE: readonly Mode[] = ['SKIP', 'DATA', 'SKIP', 'DATA', 'DATA'];
export const EXPECTED_BITS = '10110';

export const INTENTS = [
  { speaker: 'A', text: 'Ask whether they still want to walk after work tonight.' },
  { speaker: 'B', text: 'Say the shorter loop is fine if it stays dry.' },
  { speaker: 'A', text: 'Ask if they should bring a jacket this time.' },
  { speaker: 'B', text: 'Say last week they were fine until the wind picked up near the hill.' },
  { speaker: 'A', text: 'Suggest meeting by the usual gate around six.' },
] as const;

export function targetsOk(): boolean {
  if (TARGETS.length !== EXPECTED_SCHEDULE.length) return false;
  if (TARGETS[0].mode !== INITIAL_MODE) return false;
  let bits = '';
  for (let i = 0; i < TARGETS.length; i++) {
    const t = TARGETS[i];
    if (t.mode !== EXPECTED_SCHEDULE[i]) return false;
    if (t.mode === 'SKIP' && t.bits !== '') return false;
    if (t.mode === 'DATA' && t.bits === '') return false;
    if (i + 1 < TARGETS.length && t.next !== TARGETS[i + 1].mode) return false;
    bits += t.bits;
  }
  return bits === EXPECTED_BITS;
}

export function matches(v: number, want: Target): boolean {
  const d = decode(want.mode, v, MAP);
  return d.bits === want.bits && d.next === want.next;
}

export interface Selection {
  considered: string[];
  legal: string[];
  chosen: string | null;
  chosenIndex: number;
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

/** First turnOk U in the declared budget that realizes the joint target. */
export function selectJoint(candidates: readonly string[], want: Target): Selection {
  const considered = uniqueInOrder(candidates).slice(0, BATCH);
  const legal = considered.filter(turnOk);
  const chosenIndex = legal.findIndex((u) => matches(carrier(u), want));
  return {
    considered,
    legal,
    chosen: chosenIndex >= 0 ? legal[chosenIndex] : null,
    chosenIndex,
  };
}

export interface TraceStep {
  utterance: string;
  mode: Mode;
  v: number;
  bits: string;
  next: Mode;
}

export function interpret(
  body: readonly string[],
  start: Mode = INITIAL_MODE,
): { bits: string; steps: TraceStep[]; final: Mode } {
  let mode = start;
  const steps: TraceStep[] = [];
  let bits = '';
  for (const utterance of body) {
    const v = carrier(utterance);
    const d = decode(mode, v, MAP);
    steps.push({ utterance, mode, v, bits: d.bits, next: d.next });
    bits += d.bits;
    mode = d.next;
  }
  return { bits, steps, final: mode };
}

export interface SetScore {
  legal: number;
  data: number;
  skip: number;
  dataLabels: string[];
  skipModes: Mode[];
}

export function scoreSet(candidates: readonly string[]): SetScore {
  const data = new Set<string>();
  const skip = new Set<Mode>();
  let legal = 0;
  for (const u of uniqueInOrder(candidates).slice(0, BATCH)) {
    if (!turnOk(u)) continue;
    legal += 1;
    const v = carrier(u);
    data.add(label(MAP(v)));
    skip.add(jSkipFromData(MAP)(v));
  }
  return {
    legal,
    data: data.size,
    skip: skip.size,
    dataLabels: [...data].sort(),
    skipModes: [...skip].sort(),
  };
}

export interface OfflineSummary {
  n: number;
  dataFull: number;
  dataMean: number;
  dataMin: number;
  skipFull: number;
}

export function summarizeOffline(sets: readonly (readonly string[])[]): OfflineSummary {
  const rows = sets.map(scoreSet);
  const n = rows.length;
  const dataFull = rows.filter((r) => r.data === 6).length;
  const skipFull = rows.filter((r) => r.skip === 2).length;
  const dataMin = n === 0 ? 0 : Math.min(...rows.map((r) => r.data));
  const dataMean = n === 0 ? 0 : rows.reduce((s, r) => s + r.data, 0) / n;
  return { n, dataFull, dataMean, dataMin, skipFull };
}

export type Encoded =
  | { kind: 'ENCODED'; body: string[]; bits: string }
  | { kind: 'NO_CANDIDATE'; index: number; want: Target; legal: number };

export function encodeFromSets(sets: readonly (readonly string[])[]): Encoded {
  const body: string[] = [];
  for (let i = 0; i < TARGETS.length; i++) {
    const want = TARGETS[i];
    const sel = selectJoint(sets[i] ?? [], want);
    if (sel.chosen === null) return { kind: 'NO_CANDIDATE', index: i, want, legal: sel.legal.length };
    body.push(sel.chosen);
  }
  return { kind: 'ENCODED', body, bits: interpret(body).bits };
}
