/**
 * NCMP-V4-F7. Result #7, PASS, frozen.
 * An accepted turn sets whether the next turn
 * contributes payload. Same U, different mode,
 * different bits. Do not change next_mode.
 */
import { carrier } from '../v3/coding.ts';
import {
  DINNER_BODY,
  FINISH_EXAMPLE,
  Participant,
  START_EXAMPLE,
  handshake,
  runFrame,
} from './f1.ts';

export { DINNER_BODY, FINISH_EXAMPLE, Participant, START_EXAMPLE, carrier, handshake, runFrame };

export type Mode = 'SKIP' | 'DATA';

/** After START the first body turn is SKIP. */
export const INITIAL_MODE: Mode = 'SKIP';

/** V < 32 → next DATA. V ≥ 32 → next SKIP. */
export const DATA_NEXT_BELOW = 32;

export function nextMode(v: number): Mode {
  return v < DATA_NEXT_BELOW ? 'DATA' : 'SKIP';
}

/** Consumed only when the current mode is DATA. */
export function dataBit(v: number): '0' | '1' {
  return v % 2 === 0 ? '0' : '1';
}

export function step(mode: Mode, utterance: string): { bits: string; next: Mode; v: number } {
  const v = carrier(utterance);
  return {
    bits: mode === 'DATA' ? dataBit(v) : '',
    next: nextMode(v),
    v,
  };
}

export interface TraceStep {
  utterance: string;
  mode: Mode;
  v: number;
  bits: string;
  next: Mode;
}

export function interpret(body: readonly string[], start: Mode = INITIAL_MODE): { bits: string; steps: TraceStep[]; final: Mode } {
  let mode = start;
  const steps: TraceStep[] = [];
  let bits = '';
  for (const utterance of body) {
    const s = step(mode, utterance);
    steps.push({ utterance, mode, v: s.v, bits: s.bits, next: s.next });
    bits += s.bits;
    mode = s.next;
  }
  return { bits, steps, final: mode };
}

/** Published. V = 22 → next DATA. */
export const U_NEXT_DATA = DINNER_BODY[0];
/** Published. V = 38 → next SKIP. */
export const U_NEXT_SKIP = DINNER_BODY[1];
/** Same utterance under both modes. V = 15. */
export const U_SHARED = DINNER_BODY[3];
