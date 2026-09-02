# NCMP-V4-Body

**Status:** Locked. Yes. Not a
specification.\
**Date:** September 2026\
**Parent:** `NCMP-V4-Eligible.md`.
Installed in Profile 0.
`NCMP-V4-Baseline.md`\
**Scope:** Body membership inside an
active frame. No second UUID run.
No larger `k`. No change to `half3`.

------------------------------------------------------------------------

## 1. Question

> Once a frame is open, is every
> non-control utterance a BODY event?

**Yes.**

------------------------------------------------------------------------

## 2. Why

The grammar audit showed `V(U)` is
total. Payload decode and state
transition both need only `V`.
`NCMP-V4-Eligible.md`

`PAYLOAD_ELIGIBLE ⊂ STATE_ELIGIBLE`
is not the lock. Mechanically there
is no extra decode requirement for
owner DATA. The digit ban, token min,
letter min, and terminal punctuation
are encoder hygiene.

Three concepts:

``` text
CONTROL(U)
    START / FINISH / handshake

PROTOCOL
    V is total
    decode every non-control U

ENCODER_ACCEPTABLE(U)
    sender hygiene (today: turnOk)
```

That is the architecture:

> Encoding choices are private;
> decoding state is shared.

`NCMP-V4-Architecture.md`

The receiver of

``` text
Let's meet around 7:30 before the lot fills up.
```

computes `V = 14` and `next_mode`.
Nothing is ambiguous. Returning CHAT
was a semantic mistake: a private
encoder constraint used as shared
decode law.

------------------------------------------------------------------------

## 3. Locked rule

``` text
outside FRAME     ordinary U → CHAT
inside FRAME      ordinary U → BODY
```

``` text
FRAME_ACTIVE:
    CONTROL(U)     → control
    everything else:
        V = C6(U)
        decode(state, speaker, V)
```

Consequence, also locked: there is
no way to speak ordinary conversation
inside an active frame without
affecting protocol state, except
control messages. All three of

``` text
The food was great.
Yeah, but parking was awful.
Let's meet there around 7:30 next time.
```

are protocol events. They need not
carry payload. They all advance the
machine.

CHAT remains at session level. Inside
a frame it does not exist.

Sparse payload already separates:

``` text
BODY    transition only      peer / SKIP
BODY    transition + bits    owner DATA
```

F1 already did this for membership.
Profile 0 had added `eligible(U)` and
created CHAT-inside-frame. Body
membership returns to F1. Stateful
decode stays. `eligible(U)` is not
in the protocol. `turnOk` remains
private encoder hygiene.

The UUID run is not regenerated. It
stays `NO_CANDIDATE` at U12 under
the Profile 0 that then used
`eligible(U)`. The audit explains
why. This lock corrects the
protocol/encoder boundary. It does
not rewrite that result.

------------------------------------------------------------------------

## 4. What this does not do

- change `half3` or `k`;
- regenerate the UUID run;
- write a specification;
- measure distinguishability;
- harden the transport.

``` text
npm run test:v4-baseline
```
