/**
 * NCMP-P7-I1. Replay vs fresh frame. Strings-only wire.
 * No session_id, nonce, or sequence token in U. S1/X1 stay frozen.
 */
import { decode as decodeN, letterSum } from './p7c6.ts';
import { decodeD } from './p7d1.ts';
import { decodeE, e1For } from './p7e1.ts';
import { step, type S1Result, type SessionMode } from './p7s1.ts';

export type I1Result = S1Result | { kind: 'REPLAY' };

export function transcriptBind(utterances: readonly string[]): number {
  return letterSum(utterances.join(' ')) % 64;
}

export function surfaceTarget(payload: number, transcript: readonly string[]): number {
  return (payload + transcriptBind(transcript)) % 64;
}

export function recoverPayload(utterance: string, transcript: readonly string[]): number {
  return (decodeN(utterance) - transcriptBind(transcript) + 64) % 64;
}

export function encodeBound(
  seed: string,
  payload: number,
  transcript: readonly string[],
  exclude: ReadonlySet<string> = new Set(),
): string | null {
  const target = surfaceTarget(payload, transcript);
  return e1For(seed, target).find((c) => !exclude.has(c.utterance))?.utterance ?? null;
}

function recordHandshake(kind: S1Result['kind'], utterance: string, transcript: string[]): void {
  if (kind === 'PROBE' || kind === 'ACK') transcript.push(utterance);
}

function decodeBoundFrame(
  utterance: string,
  transcript: string[],
  seen: Set<string>,
): I1Result {
  if (seen.has(utterance)) return { kind: 'REPLAY' };
  const d = decodeD(utterance);
  const e = decodeE(utterance);
  if (d === 'NONE' || e === 'NONE') return { kind: 'DECODE_ERROR' };
  const n = recoverPayload(utterance, transcript);
  seen.add(utterance);
  transcript.push(utterance);
  return { kind: 'FRAME', d, e, n };
}

/** Independent participant. Wire still carries U only. */
export class I1Agent {
  mode: SessionMode = 'idle';
  readonly transcript: string[] = [];
  readonly seen = new Set<string>();

  constructor(public readonly name: string) {}

  send(utterance: string): I1Result {
    if (this.mode === 'active') return decodeBoundFrame(utterance, this.transcript, this.seen);
    const next = step(this.mode, 'send', utterance);
    this.mode = next.mode;
    recordHandshake(next.result.kind, utterance, this.transcript);
    return next.result;
  }

  receive(utterance: string): I1Result {
    if (this.mode === 'active') return decodeBoundFrame(utterance, this.transcript, this.seen);
    const next = step(this.mode, 'recv', utterance);
    this.mode = next.mode;
    recordHandshake(next.result.kind, utterance, this.transcript);
    return next.result;
  }
}

export function deliverI1(from: I1Agent, to: I1Agent, utterance: string): {
  from: string;
  to: string;
  utterance: string;
  sent: I1Result;
  recv: I1Result;
} {
  return {
    from: from.name,
    to: to.name,
    utterance,
    sent: from.send(utterance),
    recv: to.receive(utterance),
  };
}

export function formatI1(result: I1Result): string {
  if (result.kind === 'FRAME') return `FRAME ${result.d} ${result.e} ${result.n}`;
  return result.kind;
}
