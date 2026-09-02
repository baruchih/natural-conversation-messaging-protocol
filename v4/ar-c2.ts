/**
 * AR-C2. 5-bit header composition. Not NCMP/4.0.
 * Does not amend baseline.ts. Scale table only.
 */
import {
  ACK_EXAMPLE,
  BIT_MARKERS,
  FINISH,
  INITIAL_MODE,
  PROBE_EXAMPLE,
  START_5,
  carrier,
  lengthMarkers,
  nextMode,
  symbol,
  type Mode,
  type Outcome,
  type Speaker,
  type Session,
} from './baseline.ts';
import { isAck, isFinish, isProbe, isStart } from './f1.ts';

export { ACK_EXAMPLE, FINISH, PROBE_EXAMPLE, START_5, carrier, nextMode, symbol };
export type { Mode, Outcome, Speaker };

export const ACTION_WIDTH = 2 as const;
export const RESOURCE_WIDTH = 3 as const;
export const HEADER_WIDTH = 5 as const;

export const ACTIONS = ['GET', 'SET', 'DELETE', 'EXECUTE'] as const;
export const RESOURCES = ['CUSTOMER', 'ORDER', 'ACCOUNT', 'INVOICE', 'PRODUCT', 'SESSION'] as const;
export type Action = (typeof ACTIONS)[number];
export type Resource = (typeof RESOURCES)[number];

export interface ApplicationObject {
  action: Action;
  resource: Resource;
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

export interface Machine {
  session: Session;
  frame: FrameState | null;
  lastObject: ApplicationObject | null;
}

export interface Snapshot {
  session: Session;
  open: boolean;
  owner: Speaker | null;
  argument_bits: number | null;
  mode: Mode | null;
  accumulator: string | null;
  header_remaining: number | null;
  argument_remaining: number | null;
  action: Action | null;
  resource: Resource | null;
  argument: string | null;
  reserved: boolean;
  outcome: Outcome | 'HEADER_RESERVED';
  bits: string;
  object: ApplicationObject | null;
}

export function tile(bits: string): string[] {
  const out: string[] = [];
  let i = 0;
  let rem = bits.length;
  while (rem > 0) {
    if (rem === 1) {
      out.push(bits[i]);
      break;
    }
    if (bits[i] === '0') {
      out.push('0');
      i += 1;
      rem -= 1;
      continue;
    }
    const pair = bits.slice(i, i + 2);
    if (pair !== '10' && pair !== '11') throw new Error(`cannot tile ${bits} at ${i}`);
    out.push(pair);
    i += 2;
    rem -= 2;
  }
  return out;
}

export function parseFields(accumulator: string): {
  action: Action | null;
  resource: Resource | null;
  argument: string | null;
  reserved: boolean;
} {
  const action =
    accumulator.length >= ACTION_WIDTH
      ? ACTIONS[Number.parseInt(accumulator.slice(0, ACTION_WIDTH), 2)]
      : null;
  let resource: Resource | null = null;
  let reserved = false;
  if (accumulator.length >= HEADER_WIDTH) {
    const code = Number.parseInt(accumulator.slice(ACTION_WIDTH, HEADER_WIDTH), 2);
    if (code < RESOURCES.length) resource = RESOURCES[code];
    else reserved = true;
  }
  const argument = accumulator.length >= HEADER_WIDTH ? accumulator.slice(HEADER_WIDTH) : null;
  return { action, resource, argument, reserved };
}

export function wireRemaining(f: FrameState): number {
  return f.header_remaining + f.argument_remaining;
}

export function fresh(): Machine {
  return { session: 'idle', frame: null, lastObject: null };
}

function applyBits(f: FrameState, bits: string): void {
  f.accumulator += bits;
  const filled = f.accumulator.length;
  f.header_remaining = Math.max(0, HEADER_WIDTH - filled);
  f.argument_remaining = f.argument_bits - Math.max(0, filled - HEADER_WIDTH);
}

function snap(m: Machine, outcome: Snapshot['outcome'], bits = ''): Snapshot {
  const f = m.frame;
  const fields = f
    ? parseFields(f.accumulator)
    : { action: null, resource: null, argument: null, reserved: false };
  return {
    session: m.session,
    open: f !== null,
    owner: f?.owner ?? null,
    argument_bits: f?.argument_bits ?? null,
    mode: f?.mode ?? null,
    accumulator: f?.accumulator ?? null,
    header_remaining: f?.header_remaining ?? null,
    argument_remaining: f?.argument_remaining ?? null,
    action: fields.action,
    resource: fields.resource,
    argument: fields.argument,
    reserved: fields.reserved,
    outcome,
    bits,
    object: m.lastObject,
  };
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
        argument_bits: n,
        mode: INITIAL_MODE,
        accumulator: '',
        header_remaining: HEADER_WIDTH,
        argument_remaining: n,
      };
      return snap(m, 'START');
    }
    if (isFinish(utterance)) return snap(m, 'NO_FRAME');
    return snap(m, 'CHAT');
  }
  if (isStart(utterance)) return snap(m, 'NEST');
  if (isFinish(utterance)) {
    if (speaker !== m.frame.owner) return snap(m, 'NOT_OWNER');
    if (wireRemaining(m.frame) > 0) {
      m.frame = null;
      return snap(m, 'INCOMPLETE');
    }
    const fields = parseFields(m.frame.accumulator);
    if (fields.reserved || fields.action === null || fields.resource === null) {
      m.frame = null;
      return snap(m, 'HEADER_RESERVED');
    }
    m.lastObject = {
      action: fields.action,
      resource: fields.resource,
      argument: fields.argument as string,
    };
    m.frame = null;
    return snap(m, 'FINISH_ARGUMENT');
  }

  const v = carrier(utterance);
  const f = m.frame;
  const need = wireRemaining(f);
  if (speaker === f.owner && f.mode === 'DATA' && need === 0) {
    f.mode = nextMode(v);
    return snap(m, 'PAYLOAD_COMPLETE');
  }
  const bits = speaker === f.owner && f.mode === 'DATA' && need > 0 ? symbol(need, v) : '';
  if (bits.length > need) return snap(m, 'OVERFLOW');
  f.mode = nextMode(v);
  if (bits !== '') applyBits(f, bits);
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

export function runTwo(turns: readonly Turn[]): { a: Snapshot[]; b: Snapshot[] } {
  return { a: run(turns), b: run(turns) };
}
