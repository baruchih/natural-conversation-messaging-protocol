/**
 * NCMP-V4-F1. Result #1, PASS, frozen.
 * Variable-length START / BODY / FINISH. Do not change
 * the constructions. F2 observes the body only.
 */
import { createHash } from 'node:crypto';
import { canonicalize } from '../v1-v2/p7c6.ts';
import { tokenList } from '../v1-v2/p7c6.lm.ts';
import {
  ACK_EXAMPLE,
  PROBE_EXAMPLE,
  isAck,
  isProbe,
  step as sessionStep,
  type SessionMode,
} from '../v1-v2/p7s1.ts';

export { ACK_EXAMPLE, PROBE_EXAMPLE, isAck, isProbe };
export type { SessionMode };

export const START_TOKENS = ['begin', 'round', 'now'] as const;
export const FINISH_TOKENS = ['close', 'round', 'here'] as const;

export const START_EXAMPLE = 'Shall we begin this round now?';
export const FINISH_EXAMPLE = 'Let us close this round here.';

export const BODY_LENGTHS = [1, 4, 9] as const;

export type FrameMode = 'none' | 'open';

export type F1Result =
  | { kind: 'PROBE' }
  | { kind: 'ACK' }
  | { kind: 'NOT_NCMP' }
  | { kind: 'START' }
  | { kind: 'BODY' }
  | { kind: 'FINISH'; frame: Frame }
  | { kind: 'NO_FRAME' }
  | { kind: 'NEST' }
  | { kind: 'CHAT' }
  | { kind: 'CONTROL_ERROR' };

export interface Frame {
  start: string;
  body: readonly string[];
  finish: string;
}

function hasAll(utterance: string, required: readonly string[]): boolean {
  const tokens = new Set(tokenList(utterance));
  return required.every((t) => tokens.has(t));
}

export function isStart(utterance: string): boolean {
  return hasAll(utterance, START_TOKENS) && !hasAll(utterance, FINISH_TOKENS);
}

export function isFinish(utterance: string): boolean {
  return hasAll(utterance, FINISH_TOKENS) && !hasAll(utterance, START_TOKENS);
}

export function frameDigest(frame: Frame): string {
  const text = [frame.start, ...frame.body, frame.finish].map((u) => canonicalize(u)).join('\n');
  return createHash('sha256').update(text).digest('hex');
}

export function framesEqual(a: Frame, b: Frame): boolean {
  return frameDigest(a) === frameDigest(b);
}

export class Participant {
  session: SessionMode = 'idle';
  frame: FrameMode = 'none';
  private start: string | null = null;
  private body: string[] = [];
  completed: Frame[] = [];

  constructor(public readonly name: string) {}

  send(utterance: string): F1Result {
    return this.apply('send', utterance);
  }

  receive(utterance: string): F1Result {
    return this.apply('recv', utterance);
  }

  private apply(direction: 'send' | 'recv', utterance: string): F1Result {
    if (this.session !== 'active') {
      const next = sessionStep(this.session, direction, utterance);
      this.session = next.mode;
      if (next.result.kind === 'PROBE' || next.result.kind === 'ACK' || next.result.kind === 'NOT_NCMP') {
        return { kind: next.result.kind };
      }
      return { kind: 'NOT_NCMP' };
    }
    return this.frameApply(utterance);
  }

  private frameApply(utterance: string): F1Result {
    const start = isStart(utterance);
    const finish = isFinish(utterance);
    if (start && finish) return { kind: 'CONTROL_ERROR' };

    if (start) {
      if (this.frame === 'open') return { kind: 'NEST' };
      this.frame = 'open';
      this.start = utterance;
      this.body = [];
      return { kind: 'START' };
    }

    if (finish) {
      if (this.frame !== 'open' || this.start === null) return { kind: 'NO_FRAME' };
      const done: Frame = { start: this.start, body: [...this.body], finish: utterance };
      this.completed.push(done);
      this.frame = 'none';
      this.start = null;
      this.body = [];
      return { kind: 'FINISH', frame: done };
    }

    if (this.frame === 'open') {
      this.body.push(utterance);
      return { kind: 'BODY' };
    }
    return { kind: 'CHAT' };
  }
}

export interface Turn {
  utterance: string;
  left: F1Result;
  right: F1Result;
}

/** One string on the channel. Participants share no memory. */
export function deliver(from: Participant, to: Participant, utterance: string): Turn {
  return {
    utterance,
    left: from.send(utterance),
    right: to.receive(utterance),
  };
}

export function handshake(initiator: Participant, responder: Participant): void {
  deliver(initiator, responder, PROBE_EXAMPLE);
  deliver(responder, initiator, ACK_EXAMPLE);
}

export const DINNER_BODY = [
  'How was dinner last night after you sat down?',
  'Pretty good overall though the service was a little slow.',
  'What did you end up ordering in the end?',
  'The pasta was decent and the bread came out warm.',
  'Did you two stay long once the place filled up?',
  'We left before dessert because the room got loud.',
  'Was the evening still worth it after the wait?',
  'Mostly yes and the coffee almost made up for it.',
  'Should we try that place again sometime next week?',
] as const;

export function runFrame(initiator: Participant, responder: Participant, body: readonly string[]): Frame {
  const opened = deliver(initiator, responder, START_EXAMPLE);
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
  return closed.left.frame;
}
