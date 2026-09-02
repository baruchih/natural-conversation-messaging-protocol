/**
 * NCMP-C5-S. C5-U shadow machine beside v0.1 process.
 * Bootstrap is unchanged. Frame cues are uniform ordered pairs.
 * Not the protocol. Does not change process.
 */
import {
  BASELINE_PROFILE,
  argumentLength,
  c6,
  headerWidth,
  isAck,
  isProbe,
  kSession32,
  parseHeader,
  pSec,
  profileSeed,
  symbol,
  tState,
  transition,
  type ApplicationObject,
  type FrameState,
  type Outcome,
  type Profile,
  type Session,
  type Speaker,
} from '../ncmp/reference/ncmp.ts';
import { finishCueFrom, startCueFrom } from './c5u.ts';
import { hasOrderedPair, type Pair } from './c5p.ts';

export interface ShadowState {
  session: Session;
  frame: FrameState | null;
  last_object: ApplicationObject | null;
  u_probe: string | null;
  u_ack: string | null;
  k_session: number | null;
}

function copyFrame(frame: FrameState | null): FrameState | null {
  return frame === null ? null : { ...frame };
}

export function isStartS(utterance: string, uProbe: string, session: number): boolean {
  return hasOrderedPair(utterance, startCueFrom(uProbe, session).pair) && pSec(utterance) === tState('START', session);
}

export function isFinishS(utterance: string, uAck: string, session: number): boolean {
  return hasOrderedPair(utterance, finishCueFrom(uAck, session).pair) && pSec(utterance) === tState('FINISH', session);
}

export function startPairS(uProbe: string, session: number): Pair {
  return startCueFrom(uProbe, session).pair;
}

export function finishPairS(uAck: string, session: number): Pair {
  return finishCueFrom(uAck, session).pair;
}

export class Shadow {
  readonly profile: Profile;
  private session: Session = 'idle';
  private frame: FrameState | null = null;
  private last_object: ApplicationObject | null = null;
  private u_probe: string | null = null;
  private u_ack: string | null = null;
  private k_session: number | null = null;
  private lastBits = '';

  constructor(profile: Profile = BASELINE_PROFILE) {
    this.profile = {
      ...BASELINE_PROFILE,
      ...profile,
      actions: profile.actions,
      resources: profile.resources,
      control_seed: profile.control_seed ?? BASELINE_PROFILE.control_seed,
      bootstrap_hint: profile.bootstrap_hint ?? BASELINE_PROFILE.bootstrap_hint,
    };
  }

  get state(): ShadowState {
    return {
      session: this.session,
      frame: copyFrame(this.frame),
      last_object: this.last_object === null ? null : { ...this.last_object },
      u_probe: this.u_probe,
      u_ack: this.u_ack,
      k_session: this.k_session,
    };
  }

  get bits(): string {
    return this.lastBits;
  }

  /** Test helper. Catalog handshakes that are not residual-valid PROBE/ACK. */
  installHandshake(uProbe: string, uAck: string): void {
    this.session = 'active';
    this.u_probe = uProbe;
    this.u_ack = uAck;
    this.k_session = kSession32(uProbe, uAck, profileSeed(this.profile));
    this.frame = null;
    this.last_object = null;
    this.lastBits = '';
  }

  process(speaker: Speaker, utterance: string): Outcome {
    this.lastBits = '';
    const h = headerWidth(this.profile);

    if (this.session === 'idle') {
      if (isProbe(utterance, this.profile)) {
        this.session = 'handshake';
        this.u_probe = utterance;
        return 'PROBE';
      }
      return 'NOT_NCMP';
    }

    if (this.session === 'handshake') {
      if (this.u_probe !== null && isAck(utterance, this.u_probe, this.profile)) {
        this.session = 'active';
        this.u_ack = utterance;
        this.k_session = kSession32(this.u_probe, utterance, profileSeed(this.profile));
        return 'ACK';
      }
      return 'NOT_NCMP';
    }

    const session = this.k_session;
    const uProbe = this.u_probe;
    const uAck = this.u_ack;
    if (session === null || uProbe === null || uAck === null) return 'NOT_NCMP';

    if (this.frame === null) {
      if (isStartS(utterance, uProbe, session)) {
        const n = argumentLength(utterance, session);
        this.frame = {
          owner: speaker,
          argument_bits: n,
          mode: 'SKIP',
          accumulator: '',
          header_remaining: h,
          argument_remaining: n,
        };
        return 'START';
      }
      if (isFinishS(utterance, uAck, session)) return 'NO_FRAME';
      return 'CHAT';
    }

    if (isStartS(utterance, uProbe, session)) return 'NEST';

    if (isFinishS(utterance, uAck, session)) {
      if (speaker !== this.frame.owner) return 'NOT_OWNER';
      const need = this.frame.header_remaining + this.frame.argument_remaining;
      if (need > 0) {
        this.frame = null;
        return 'INCOMPLETE';
      }
      const fields = parseHeader(this.frame.accumulator, this.profile);
      if (fields.reserved || fields.action === null || fields.resource === null) {
        this.frame = null;
        return 'HEADER_RESERVED';
      }
      this.last_object = {
        action: fields.action,
        resource: fields.resource,
        argument: fields.argument as string,
      };
      this.frame = null;
      return 'FINISH_ARGUMENT';
    }

    const v = c6(utterance);
    const f = this.frame;
    const need = f.header_remaining + f.argument_remaining;

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
      this.lastBits = bits;
      return 'BODY_DATA';
    }
    return 'BODY_SKIP';
  }
}
