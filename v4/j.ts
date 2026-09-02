/**
 * NCMP-V4-J. Pause object, not a chosen map.
 * J_DATA and J_SKIP share next_mode(V). Same 64
 * states, two interpretations. No F6. No LM.
 */
export const ALPHABET = 64;

export type Mode = 'SKIP' | 'DATA';
export type Bits = '0' | '10' | '11';

export interface DataOutcome {
  bits: Bits;
  next: Mode;
}

export const BITS: readonly Bits[] = ['0', '10', '11'];

export const DATA_OUTCOMES: readonly DataOutcome[] = [
  { bits: '0', next: 'SKIP' },
  { bits: '0', next: 'DATA' },
  { bits: '10', next: 'SKIP' },
  { bits: '10', next: 'DATA' },
  { bits: '11', next: 'SKIP' },
  { bits: '11', next: 'DATA' },
];

export type JData = (v: number) => DataOutcome;
export type JSkip = (v: number) => Mode;

export function inAlphabet(v: number): boolean {
  return Number.isInteger(v) && v >= 0 && v < ALPHABET;
}

/** V determines tomorrow. Current mode decides whether V speaks today. */
export function jSkipFromData(jData: JData): JSkip {
  return (v) => jData(v).next;
}

export function nextModeAgrees(jData: JData, jSkip: JSkip): boolean {
  for (let v = 0; v < ALPHABET; v++) {
    if (jData(v).next !== jSkip(v)) return false;
  }
  return true;
}

export function decode(mode: Mode, v: number, jData: JData): { bits: string; next: Mode } {
  const d = jData(v);
  return { bits: mode === 'DATA' ? d.bits : '', next: d.next };
}

export function dataCounts(jData: JData): Record<string, number> {
  const out: Record<string, number> = {};
  for (const o of DATA_OUTCOMES) out[label(o)] = 0;
  for (let v = 0; v < ALPHABET; v++) out[label(jData(v))] += 1;
  return out;
}

export function skipCounts(jSkip: JSkip): Record<Mode, number> {
  const out: Record<Mode, number> = { DATA: 0, SKIP: 0 };
  for (let v = 0; v < ALPHABET; v++) out[jSkip(v)] += 1;
  return out;
}

export function label(o: DataOutcome): string {
  return `${o.bits}+${o.next === 'DATA' ? 'D' : 'S'}`;
}

function bitsFromMod3(v: number): Bits {
  return BITS[v % 3];
}

/**
 * F7 next_mode. Symbol = V mod 3.
 * F9 frozen map: the minimal lift from F7.
 * Not chosen because it scored well. Not the eventual code.
 */
export function half3(v: number): DataOutcome {
  if (!inAlphabet(v)) throw new Error('V');
  return { bits: bitsFromMod3(v), next: v < 32 ? 'DATA' : 'SKIP' };
}

/**
 * F7 next_mode. Contiguous thirds of each half:
 * [0,11) → 0, [11,22) → 10, [22,32) → 11.
 * Declared before any corpus look. Not chosen.
 */
export function halfBlock(v: number): DataOutcome {
  if (!inAlphabet(v)) throw new Error('V');
  const r = v % 32;
  const bits: Bits = r < 11 ? '0' : r < 22 ? '10' : '11';
  return { bits, next: v < 32 ? 'DATA' : 'SKIP' };
}

/**
 * V mod 6 → six outcomes in DATA_OUTCOMES order.
 * next_mode is still a function of V, not F7's half.
 * Declared before any corpus look. Not chosen.
 */
export function mod6(v: number): DataOutcome {
  if (!inAlphabet(v)) throw new Error('V');
  return DATA_OUTCOMES[v % 6];
}

export const CANDIDATES: readonly { name: string; jData: JData }[] = [
  { name: 'half3', jData: half3 },
  { name: 'halfBlock', jData: halfBlock },
  { name: 'mod6', jData: mod6 },
];
