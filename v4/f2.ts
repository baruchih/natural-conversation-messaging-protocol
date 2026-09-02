/**
 * NCMP-V4-F2. Result #2, PASS, frozen.
 * A variable-length frame accumulates the same ordered
 * K4 observations at both participants. START/FINISH
 * are outside the carrier stream. F3 reassembles bits.
 */
import { A1, B1, WINDOW_PROFILE, decodeFrames, run } from '../v3/k4.ts';
import {
  FINISH_EXAMPLE,
  Participant,
  START_EXAMPLE,
  framesEqual,
  handshake,
  isFinish,
  isStart,
  runFrame,
} from './f1.ts';

export {
  FINISH_EXAMPLE,
  START_EXAMPLE,
  WINDOW_PROFILE,
  decodeFrames,
  framesEqual,
  handshake,
  isFinish,
  isStart,
  runFrame,
};
export { A1, B1 };

/** Frozen K4 targets, then three more published residues for the 9-turn body. */
export const K4_TARGETS = [42, 17, 63, 5] as const;
export const EXTRA_TARGETS = [11, 28, 51] as const;
export const CLOSER_TARGETS = [...K4_TARGETS, ...EXTRA_TARGETS] as const;

export const BODY_LENGTHS = [1, 2, 3, 4, 6, 9] as const;

export function expectedObservations(bodyTurns: number, width = WINDOW_PROFILE.width): number {
  return Math.max(0, bodyTurns - width + 1);
}

/** Body is a K4 transcript prefix. Not START. Not FINISH. */
export function k4Body(n: number): string[] {
  if (n < 1) return [];
  if (n === 1) return [A1];
  const targets = CLOSER_TARGETS.slice(0, n - 2);
  const turns = run(targets).turns;
  if (turns.length !== n) throw new Error(`k4Body ${n}: got ${turns.length}`);
  return turns;
}

/** Carrier observations from body only. Control tokens are excluded. */
export function accumulate(body: readonly string[]): number[] {
  return decodeFrames(body);
}

export interface FramedStream {
  body: string[];
  frameBody: readonly string[];
  accumulator: number[];
}

export function runFramed(n: number): FramedStream {
  const body = k4Body(n);
  const left = new Participant('A');
  const right = new Participant('B');
  handshake(left, right);
  const frame = runFrame(left, right, body);
  if (!framesEqual(left.completed[0], right.completed[0])) {
    throw new Error('participants disagreed on the frame');
  }
  const a = accumulate(left.completed[0].body);
  const b = accumulate(right.completed[0].body);
  if (a.join(',') !== b.join(',')) throw new Error('accumulators diverged');
  return { body, frameBody: frame.body, accumulator: a };
}
