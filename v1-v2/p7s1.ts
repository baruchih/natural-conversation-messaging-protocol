/**
 * NCMP-P7-S1. S decides whether to decode. D/E/N decide what it says.
 * Handshake is asymmetric. Detectors must not call δ_N.
 */
import { decode as decodeN } from './p7c6.ts';
import { tokenList } from './p7c6.lm.ts';
import { decodeD, type Discourse } from './p7d1.ts';
import { decodeE, type EntityClass } from './p7e1.ts';

export const PROBE_TOKENS = ['compare', 'notes', 'usual'] as const;
export const ACK_TOKENS = ['aligned', 'briefing'] as const;

export const PROBE_EXAMPLE = 'Shall we compare notes on the usual matter?';
export const ACK_EXAMPLE = 'Yes we are aligned on that briefing.';

export type SessionMode = 'idle' | 'ack_wait' | 'ack_required' | 'active';
export type Direction = 'send' | 'recv';

export type S1Result =
  | { kind: 'PROBE' }
  | { kind: 'ACK' }
  | { kind: 'NOT_NCMP' }
  | { kind: 'DECODE_ERROR' }
  | { kind: 'FRAME'; d: Discourse; e: EntityClass; n: number };

function hasAll(utterance: string, required: readonly string[]): boolean {
  const tokens = new Set(tokenList(utterance));
  return required.every((t) => tokens.has(t));
}

/** Construction only. Must not consult residue. */
export function isProbe(utterance: string): boolean {
  return hasAll(utterance, PROBE_TOKENS);
}

export function isAck(utterance: string): boolean {
  return hasAll(utterance, ACK_TOKENS);
}

function decodeFrame(utterance: string): S1Result {
  if (isProbe(utterance) || isAck(utterance)) return { kind: 'DECODE_ERROR' };
  const d = decodeD(utterance);
  const e = decodeE(utterance);
  if (d === 'NONE' || e === 'NONE') return { kind: 'DECODE_ERROR' };
  return { kind: 'FRAME', d, e, n: decodeN(utterance) };
}

/**
 * Asymmetric handshake. Unsolicited ACK does not activate.
 *
 *   idle --send probe--> ack_wait --recv ACK--> active
 *   idle --recv probe--> ack_required --send ACK--> active
 */
export function step(
  mode: SessionMode,
  direction: Direction,
  utterance: string,
): { mode: SessionMode; result: S1Result } {
  if (mode === 'idle') {
    if (direction === 'send' && isProbe(utterance)) {
      return { mode: 'ack_wait', result: { kind: 'PROBE' } };
    }
    if (direction === 'recv' && isProbe(utterance)) {
      return { mode: 'ack_required', result: { kind: 'PROBE' } };
    }
    return { mode: 'idle', result: { kind: 'NOT_NCMP' } };
  }

  if (mode === 'ack_wait') {
    if (direction === 'recv' && isAck(utterance)) {
      return { mode: 'active', result: { kind: 'ACK' } };
    }
    return { mode: 'ack_wait', result: { kind: 'NOT_NCMP' } };
  }

  if (mode === 'ack_required') {
    if (direction === 'send' && isAck(utterance)) {
      return { mode: 'active', result: { kind: 'ACK' } };
    }
    if (direction === 'send') {
      return { mode: 'ack_required', result: { kind: 'DECODE_ERROR' } };
    }
    return { mode: 'ack_required', result: { kind: 'NOT_NCMP' } };
  }

  return { mode: 'active', result: decodeFrame(utterance) };
}

/** Independent participant. Shares published decoders only, never session state. */
export class Agent {
  mode: SessionMode = 'idle';

  constructor(public readonly name: string) {}

  send(utterance: string): S1Result {
    const next = step(this.mode, 'send', utterance);
    this.mode = next.mode;
    return next.result;
  }

  receive(utterance: string): S1Result {
    const next = step(this.mode, 'recv', utterance);
    this.mode = next.mode;
    return next.result;
  }
}
