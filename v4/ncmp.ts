/**
 * Compatibility shim. The published v0.1 decoder is ncmp/reference/ncmp.ts.
 */
export {
  BASELINE_PROFILE,
  NCMP,
  actionWidth,
  c6 as carrier,
  headerCost,
  headerWidth,
  parseHeader as parseFields,
  resourceWidth,
  symbol,
  transition as nextMode,
  type ApplicationObject,
  type Mode,
  type Outcome,
  type Profile,
  type Session,
  type Speaker,
} from '../ncmp/reference/ncmp.ts';

import {
  BASELINE_PROFILE,
  EXAMPLES,
  NCMP,
  parseHeader,
  type ApplicationObject,
  type Outcome,
  type Profile,
  type Speaker,
} from '../ncmp/reference/ncmp.ts';

export const ACK_EXAMPLE = EXAMPLES.ACK;
export const PROBE_EXAMPLE = EXAMPLES.PROBE;
export const START_0 = EXAMPLES.L0;
export const START_5 = EXAMPLES.START_5;
export const FINISH = EXAMPLES.FINISH;

export interface Turn {
  speaker: Speaker;
  utterance: string;
}

export interface Snapshot {
  session: string;
  open: boolean;
  owner: Speaker | null;
  argument_bits: number | null;
  mode: string | null;
  accumulator: string | null;
  header_remaining: number | null;
  argument_remaining: number | null;
  action: string | null;
  resource: string | null;
  argument: string | null;
  reserved: boolean;
  outcome: Outcome;
  bits: string;
  object: ApplicationObject | null;
}

export function run(turns: readonly Turn[], profile: Profile = BASELINE_PROFILE): Snapshot[] {
  const ncmp = new NCMP(profile);
  return turns.map((t) => {
    const outcome = ncmp.process(t.speaker, t.utterance);
    const s = ncmp.state;
    const fields = s.frame
      ? parseHeader(s.frame.accumulator, profile)
      : { action: null, resource: null, argument: null, reserved: false };
    return {
      session: s.session,
      open: s.frame !== null,
      owner: s.frame?.owner ?? null,
      argument_bits: s.frame?.argument_bits ?? null,
      mode: s.frame?.mode ?? null,
      accumulator: s.frame?.accumulator ?? null,
      header_remaining: s.frame?.header_remaining ?? null,
      argument_remaining: s.frame?.argument_remaining ?? null,
      action: fields.action,
      resource: fields.resource,
      argument: fields.argument,
      reserved: fields.reserved,
      outcome,
      bits: ncmp.bits,
      object: s.last_object,
    };
  });
}
