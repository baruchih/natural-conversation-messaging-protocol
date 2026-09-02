/**
 * Independent referee for ncmp/NCMP.md.
 * Not a copy of NCMP.process. Same document, different machine.
 */
import {
  ARGUMENT_LENGTHS,
  BASELINE_PROFILE,
  CONTROL_SEED,
  SECONDARY_MASK,
  actionWidth,
  argumentLength,
  c6,
  headerWidth,
  isAck,
  isFinish,
  isProbe,
  isStart,
  kSession32,
  parseHeader,
  profileSeed,
  resourceWidth,
  symbol,
  tokenize,
  transition,
  type ApplicationObject,
  type FrameState,
  type Outcome,
  type Profile,
  type ProtocolState,
  type Session,
  type Speaker,
} from './ncmp.ts';

export interface RefMachine {
  profile: Profile;
  session: Session;
  frame: FrameState | null;
  last_object: ApplicationObject | null;
  u_probe: string | null;
  u_ack: string | null;
  k_session: number | null;
  bits: string;
}

export function refFresh(profile: Profile = BASELINE_PROFILE): RefMachine {
  return {
    profile: {
      ...BASELINE_PROFILE,
      ...profile,
      actions: profile.actions,
      resources: profile.resources,
      control_seed: profile.control_seed ?? BASELINE_PROFILE.control_seed,
      bootstrap_hint: profile.bootstrap_hint ?? BASELINE_PROFILE.bootstrap_hint,
      session_words: profile.session_words ?? BASELINE_PROFILE.session_words,
    },
    session: 'idle',
    frame: null,
    last_object: null,
    u_probe: null,
    u_ack: null,
    k_session: null,
    bits: '',
  };
}

export function refState(m: RefMachine): ProtocolState {
  return {
    session: m.session,
    frame: m.frame === null ? null : { ...m.frame },
    last_object: m.last_object === null ? null : { ...m.last_object },
    u_probe: m.u_probe,
    u_ack: m.u_ack,
    k_session: m.k_session,
  };
}

function openFrame(speaker: Speaker, n: number, h: number): FrameState {
  return {
    owner: speaker,
    argument_bits: n,
    mode: 'SKIP',
    accumulator: '',
    header_remaining: h,
    argument_remaining: n,
  };
}

/**
 * Referee BODY path. Recomputes widths from codebook sizes, not from
 * headerWidth, and applies the document's remaining / symbol rules locally.
 */
function bodyEvent(
  m: RefMachine,
  speaker: Speaker,
  utterance: string,
): Outcome {
  const f = m.frame;
  if (f === null) return 'CHAT';
  const aw = actionWidth(m.profile);
  const rw = resourceWidth(m.profile);
  const h = aw + rw;
  const v = c6(utterance);
  const need = f.header_remaining + f.argument_remaining;
  m.bits = '';

  if (speaker === f.owner && f.mode === 'DATA' && need === 0) {
    f.mode = transition(v);
    return 'PAYLOAD_COMPLETE';
  }

  const bits = speaker === f.owner && f.mode === 'DATA' && need > 0 ? symbol(need, v) : '';
  if (bits.length > need) return 'OVERFLOW';

  f.mode = transition(v);
  if (bits !== '') {
    f.accumulator += bits;
    const filled = f.accumulator.length;
    f.header_remaining = Math.max(0, h - filled);
    f.argument_remaining = f.argument_bits - Math.max(0, filled - h);
    m.bits = bits;
    return 'BODY_DATA';
  }
  return 'BODY_SKIP';
}

export function refProcess(m: RefMachine, speaker: Speaker, utterance: string): Outcome {
  m.bits = '';
  const h = headerWidth(m.profile);
  const seed = profileSeed(m.profile);

  switch (m.session) {
    case 'idle':
      if (!isProbe(utterance, m.profile)) return 'NOT_NCMP';
      m.session = 'handshake';
      m.u_probe = utterance;
      return 'PROBE';

    case 'handshake':
      if (m.u_probe === null || !isAck(utterance, m.u_probe, m.profile)) return 'NOT_NCMP';
      m.session = 'active';
      m.u_ack = utterance;
      m.k_session = kSession32(m.u_probe, utterance, seed);
      return 'ACK';

    case 'active': {
      if (m.k_session === null || m.u_probe === null || m.u_ack === null) return 'NOT_NCMP';
      const k = m.k_session;

      if (m.frame === null) {
        if (isStart(utterance, m.u_probe, k, m.profile)) {
          const n = argumentLength(utterance, k);
          m.frame = openFrame(speaker, n, h);
          return 'START';
        }
        if (isFinish(utterance, m.u_ack, k, m.profile)) return 'NO_FRAME';
        return 'CHAT';
      }

      if (isStart(utterance, m.u_probe, k, m.profile)) return 'NEST';

      if (isFinish(utterance, m.u_ack, k, m.profile)) {
        if (speaker !== m.frame.owner) return 'NOT_OWNER';
        const need = m.frame.header_remaining + m.frame.argument_remaining;
        if (need > 0) {
          m.frame = null;
          return 'INCOMPLETE';
        }
        const fields = parseHeader(m.frame.accumulator, m.profile);
        if (fields.reserved || fields.action === null || fields.resource === null) {
          m.frame = null;
          return 'HEADER_RESERVED';
        }
        m.last_object = {
          action: fields.action,
          resource: fields.resource,
          argument: fields.argument as string,
        };
        m.frame = null;
        return 'FINISH_ARGUMENT';
      }

      return bodyEvent(m, speaker, utterance);
    }
  }
}

/** Sanity that the referee still sees tokens the way the document tokenizes. */
export function refHinted(utterance: string, hint: string): boolean {
  return tokenize(utterance).includes(hint);
}

export { ARGUMENT_LENGTHS, CONTROL_SEED, SECONDARY_MASK };
