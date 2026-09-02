/**
 * NCMP-P7-X1. Two independent agents, one open channel: strings only.
 * No new semantics. Uses S1 + published E1 utterance.
 */
import { Agent, type S1Result, type SessionMode } from './p7s1.ts';

export interface Turn {
  from: string;
  to: string;
  utterance: string;
  senderMode: SessionMode;
  receiverMode: SessionMode;
  sent: S1Result;
  recv: S1Result;
}

/** Deliver one ordinary-language string. Agents share no session state. */
export function deliver(from: Agent, to: Agent, utterance: string): Turn {
  const sent = from.send(utterance);
  const recv = to.receive(utterance);
  return {
    from: from.name,
    to: to.name,
    utterance,
    senderMode: from.mode,
    receiverMode: to.mode,
    sent,
    recv,
  };
}

export function formatResult(result: S1Result): string {
  if (result.kind === 'FRAME') return `FRAME ${result.d} ${result.e} ${result.n}`;
  return result.kind;
}
