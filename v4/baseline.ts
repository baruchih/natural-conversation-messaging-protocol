/**
 * NCMP V4 Profile 0 baseline machine.
 * Not a version. Not NCMP/4.0.
 * FRAME_ACTIVE: every non-control U is BODY. V is total.
 * turnOk is encoder hygiene, not protocol participation.
 * FINAL(V) = V mod 2. half3 otherwise. next_mode unchanged.
 */
import { tokenList } from '../v1-v2/p7c6.lm.ts';
import { ACK_EXAMPLE, PROBE_EXAMPLE, isAck, isFinish, isProbe, isStart } from './f1.ts';
import { turnOk } from '../v3/m2.ts';
import { carrier } from '../v3/coding.ts';
import { half3, type Mode } from './j.ts';

export { ACK_EXAMPLE, PROBE_EXAMPLE, carrier, half3, isAck, isFinish, isProbe, isStart, turnOk };
export type { Mode };

export type Speaker = 'A' | 'B';
export type Session = 'idle' | 'handshake' | 'active';

export const ACTION = 'GET' as const;
export const RESOURCE = 'CUSTOMER' as const;
export const INITIAL_MODE: Mode = 'SKIP';

/** Profile 0 START length markers. Conceptual fields, published words. */
export const BIT_MARKERS = { empty: 0, short: 5, tiny: 8, brief: 24, wide: 128 } as const;

export const START_5 = 'Shall we begin this short round now?';
export const START_0 = 'Shall we begin this empty round now?';
export const START_128 = 'Shall we begin this wide round now?';
export const FINISH = 'Let us close this round here.';

export type Outcome =
  | 'PROBE'
  | 'ACK'
  | 'NOT_NCMP'
  | 'START'
  | 'UNDECLARED'
  | 'CHAT'
  | 'NO_FRAME'
  | 'BODY_SKIP'
  | 'BODY_DATA'
  | 'PAYLOAD_COMPLETE'
  | 'FINISH_ARGUMENT'
  | 'INCOMPLETE'
  | 'OVERFLOW'
  | 'NEST'
  | 'NOT_OWNER'
  | 'CONTROL_ERROR';

export interface FrameState {
  owner: Speaker;
  action: typeof ACTION;
  resource: typeof RESOURCE;
  argument_bits: number;
  mode: Mode;
  accumulator: string;
  remaining: number;
}

export interface Machine {
  session: Session;
  frame: FrameState | null;
  lastArgument: string | null;
}

export interface Snapshot {
  session: Session;
  open: boolean;
  owner: Speaker | null;
  action: typeof ACTION | null;
  resource: typeof RESOURCE | null;
  argument_bits: number | null;
  mode: Mode | null;
  accumulator: string | null;
  remaining: number | null;
  outcome: Outcome;
  bits: string;
  argument: string | null;
}

export function fresh(): Machine {
  return { session: 'idle', frame: null, lastArgument: null };
}

export function lengthMarkers(utterance: string): Array<keyof typeof BIT_MARKERS> {
  const tokens = new Set(tokenList(utterance));
  return (Object.keys(BIT_MARKERS) as Array<keyof typeof BIT_MARKERS>).filter((m) => tokens.has(m));
}

export function declaredBits(utterance: string): number | null {
  if (!isStart(utterance)) return null;
  const marks = lengthMarkers(utterance);
  if (marks.length !== 1) return null;
  return BIT_MARKERS[marks[0]];
}

export function nextMode(v: number): Mode {
  return v < 32 ? 'DATA' : 'SKIP';
}

export function finalBit(v: number): '0' | '1' {
  return v % 2 === 0 ? '0' : '1';
}

export function symbol(remaining: number, v: number): string {
  if (remaining === 1) return finalBit(v);
  return half3(v).bits;
}

function snap(m: Machine, outcome: Outcome, bits = ''): Snapshot {
  const f = m.frame;
  return {
    session: m.session,
    open: f !== null,
    owner: f?.owner ?? null,
    action: f?.action ?? null,
    resource: f?.resource ?? null,
    argument_bits: f?.argument_bits ?? null,
    mode: f?.mode ?? null,
    accumulator: f?.accumulator ?? null,
    remaining: f?.remaining ?? null,
    outcome,
    bits,
    argument: m.lastArgument,
  };
}

function closeFrame(m: Machine): void {
  m.frame = null;
}

export function process(m: Machine, speaker: Speaker, utterance: string): Snapshot {
  if (m.session === 'idle') {
    if (isProbe(utterance)) {
      m.session = 'handshake';
      return snap(m, 'PROBE');
    }
    return snap(m, 'NOT_NCMP');
  }

  if (m.session === 'handshake') {
    if (isAck(utterance)) {
      m.session = 'active';
      return snap(m, 'ACK');
    }
    return snap(m, 'NOT_NCMP');
  }

  if (m.frame === null) {
    if (isStart(utterance)) {
      const marks = lengthMarkers(utterance);
      if (marks.length > 1) return snap(m, 'CONTROL_ERROR');
      if (marks.length === 0) return snap(m, 'UNDECLARED');
      const n = BIT_MARKERS[marks[0]];
      m.frame = {
        owner: speaker,
        action: ACTION,
        resource: RESOURCE,
        argument_bits: n,
        mode: INITIAL_MODE,
        accumulator: '',
        remaining: n,
      };
      return snap(m, 'START');
    }
    if (isFinish(utterance)) return snap(m, 'NO_FRAME');
    return snap(m, 'CHAT');
  }

  if (isStart(utterance)) return snap(m, 'NEST');

  if (isFinish(utterance)) {
    if (speaker !== m.frame.owner) return snap(m, 'NOT_OWNER');
    if (m.frame.remaining > 0) {
      closeFrame(m);
      return snap(m, 'INCOMPLETE');
    }
    m.lastArgument = m.frame.accumulator;
    closeFrame(m);
    return snap(m, 'FINISH_ARGUMENT');
  }

  const v = carrier(utterance);
  const f = m.frame;
  if (speaker === f.owner && f.mode === 'DATA' && f.remaining === 0) {
    f.mode = nextMode(v);
    return snap(m, 'PAYLOAD_COMPLETE');
  }

  const bits =
    speaker === f.owner && f.mode === 'DATA' && f.remaining > 0 ? symbol(f.remaining, v) : '';
  if (bits.length > f.remaining) return snap(m, 'OVERFLOW');
  f.mode = nextMode(v);
  if (bits !== '') {
    f.accumulator += bits;
    f.remaining -= bits.length;
  }
  return snap(m, bits === '' ? 'BODY_SKIP' : 'BODY_DATA', bits);
}

export interface Turn {
  speaker: Speaker;
  utterance: string;
}

export function run(turns: readonly Turn[], start: Machine = fresh()): Snapshot[] {
  const m = start;
  return turns.map((t) => process(m, t.speaker, t.utterance));
}
