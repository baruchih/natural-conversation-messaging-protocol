/**
 * NCMP-V4-F8. Result #8, PASS, frozen.
 * Frozen F7 rule on 20 declared ordinary turns.
 * Nontrivial sparse schedule. A == B.
 * No target. No prefix alphabet. No LM.
 */
import { DINNER_BODY } from './f1.ts';
import { interpret, type Mode, type TraceStep } from './f7.ts';
import { FINISH_EXAMPLE, Participant, START_EXAMPLE, handshake, runFrame } from './f1.ts';

export { FINISH_EXAMPLE, Participant, START_EXAMPLE, handshake, interpret, runFrame };
export type { Mode, TraceStep };

/**
 * Declared before measurement. F1 dinner, F4 body, F5
 * history lines. Not chosen for V or for irregularity.
 */
export const BODY_20 = [
  ...DINNER_BODY,
  'Hey, how did dinner go last night? I’m really curious to hear about it.',
  'Pretty good, really! Just a bit frustrating with how slow the service was.',
  'Did you try anything new or stick with your favorites?',
  'The pasta was decent, not the best I’ve had, but it was alright.',
  'So, did you end up staying for long after it got crowded?',
  'As soon as the room filled up, we thought it was best to leave. The noise level was unbearable for a nice meal.',
  'Are we still heading west this weekend after work?',
  'We should pack lighter next time we go west.',
  'How was the trail once you got past the first hill?',
  'The hiking trail was quieter than I expected yesterday.',
  'Did you get soaked walking back from the station?',
] as const;

export function scheduleOf(steps: readonly TraceStep[]): Mode[] {
  return steps.map((s) => s.mode);
}

export function countMode(steps: readonly TraceStep[], mode: Mode): number {
  return steps.filter((s) => s.mode === mode).length;
}

export interface Run {
  mode: Mode;
  length: number;
}

export function runsOf(modes: readonly Mode[]): Run[] {
  if (modes.length === 0) return [];
  const out: Run[] = [{ mode: modes[0], length: 1 }];
  for (let i = 1; i < modes.length; i++) {
    if (modes[i] === out[out.length - 1].mode) out[out.length - 1].length += 1;
    else out.push({ mode: modes[i], length: 1 });
  }
  return out;
}

export function formatSchedule(modes: readonly Mode[]): string {
  return modes.map((m) => (m === 'DATA' ? 'D' : 'S')).join(' ');
}
