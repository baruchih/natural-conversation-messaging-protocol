# NCMP-V4-Baseline

**Status:** Closed. Profile 0 locked. Body
membership locked yes. Do not change.
Not NCMP/4.0. No version number.
Implementable text:
`NCMP-Baseline-Protocol.md`.\
**Date:** September 2026\
**Parent:** `NCMP-V4-Architecture.md`. F1–F10
frozen.\
**Scope:** The first concrete baseline, in
the order the choices constrain each
other. Robustness is later.

------------------------------------------------------------------------

## 1. Question

> What is missing to turn the demonstrated
> V4 architecture into the first concrete
> baseline protocol?

This note answers that by locking
decisions. It does not publish a version.

``` text
architecture            recorded
    ↓
baseline protocol       this note
    ↓
complete end-to-end semantics
    ↓
robustness layer        later
```

V4 assumes an ordered, lossless,
duplicate-free conversational transport.
`Transcript_A == Transcript_B` is given.

------------------------------------------------------------------------

## 2. Application object

First. Not a full NCMP/2.0 message.

``` text
ApplicationFrame {
    action
    resource
    argument: bitstring
}
```

Action, resource, and arbitrary-bitstring
argument are already demonstrated. The
baseline composes those three. It does
not import six opcodes or the NCMP/2.0
entity table.

Profile 0 uses exactly one pair:

``` text
GET CUSTOMER <bits>
```

------------------------------------------------------------------------

## 3. START declares frame metadata

START establishes what the body cannot
emit.

``` text
START {
    action
    resource
    argument_bits
}
```

Conceptually. Not necessarily literal
fields on the wire. In Profile 0, action
and resource are constant, so START’s
new job is `argument_bits`.

``` text
frame semantics     START
argument transport  BODY
completion          FINISH
```

The body has one job: argument bits.
FINISH asserts completion.

------------------------------------------------------------------------

## 4. Ownership

Either participant may START a frame.
Only the participant that STARTed it may
FINISH it. One open frame per session.
No frame id.

``` text
SESSION_ACTIVE
   │
A START
   ↓
FRAME_ACTIVE(owner=A)
   │
A/B conversational body
   │
A FINISH
   ↓
SESSION_ACTIVE
```

B START while open → `NEST`.
B FINISH on A’s frame → `NOT_OWNER`.

Frame ownership implies payload
authority.

------------------------------------------------------------------------

## 5. Payload authority

The opener is the sole sender of that
frame’s application payload. The peer
speaks in the conversation and may
change protocol state. The peer never
advances the argument cursor or the
accumulator.

``` text
owner ───── argument ─────→ peer
A ↔ B ↔ A ↔ B                 conversation
```

`DATA` / `SKIP` is mode. Payload
authority is ownership. They are not
the same. Do not add owner/peer modes.
Speaker identity is already on the
transport.

``` text
decode(state, speaker, U) → (bits, state′)

if speaker != owner:                    bits = ""
if speaker == owner && mode == DATA:    bits = symbol(V)
otherwise:                              bits = ""
```

Every non-control turn inside a frame
computes `next_state`. `eligible(U)`
is not a protocol predicate.

``` text
FRAME owner = A
turn   speaker   mode   payload     next
A1       A        S       —          D
B1       B        D       —          S
A2       A        S       —          D
B2       B        D       —          D
A3       A        D       10         S
B3       B        S       —          D
A4       A        D       11         ...
```

B can sit in DATA and contribute
nothing. `V(B)` only drives the
transition. B does not search
`{0, 10, 11}`. A adapts to the state
B leaves behind.

If B wants to send an application
object, B opens a frame after A
FINISHES.

Without this rule a peer DATA turn
would write into the opener’s
accumulator. That would let B modify
A’s `GET CUSTOMER <bits>`.

This is a protocol semantic, not an
encoder choice.

------------------------------------------------------------------------

## 6. Turn semantics

Baseline law. Once a frame is open,
every non-control utterance is BODY.
`V(U)` is total. No leftovers.

``` text
FRAME_ACTIVE:
    CONTROL(U)     → control
    otherwise:
        V = C6(U)
        decode(state, speaker, V)
```

``` text
process(state, speaker, U):
    V = carrier(U)
    bits =
        symbol(state.remaining, V)
        if speaker == owner
        && state.mode == DATA
        && state.remaining > 0
        else ""
    next_mode = transition(V)
    state.mode = next_mode
    if bits != "":
        state.accumulator += bits
    return BODY(bits, next_mode)
```

``` text
owner + DATA + remaining > 1    {0,10,11} + transition
owner + DATA + remaining = 1    final bit + transition
owner + DATA + remaining = 0    PAYLOAD_COMPLETE
owner + SKIP                    transition only
peer  + any                     transition only
```

There is no way to speak ordinary
conversation inside an active frame
without affecting protocol state,
except control messages.

``` text
outside FRAME     ordinary U → CHAT
inside FRAME      ordinary U → BODY
```

The peer can put the owner into DATA or
SKIP. That is correct. The argument is
directional. The protocol stays
conversational.

CHAT exists at session level, not
inside `FRAME_ACTIVE`.

------------------------------------------------------------------------

## 7. Lifecycle

``` text
SESSION_IDLE
   ↓ handshake
SESSION_ACTIVE
   ↓ START
FRAME_ACTIVE
   ↓ body turns
FRAME_ACTIVE
   ↓ FINISH
SESSION_ACTIVE
```

``` text
FrameState {
    owner
    action
    resource
    argument_bits
    mode
    accumulator
    remaining          // argument_bits - |accumulator|
}
```

No recovery state. No sync state. No
nested frames. No simultaneous frames.

S1 handshake stays the way into
`SESSION_ACTIVE`.

------------------------------------------------------------------------

## 8. Body membership

Locked. `NCMP-V4-Body.md`

`eligible(U)` is not in the protocol.
`turnOk` is private encoder hygiene.

``` text
CONTROL(U)              START / FINISH / handshake
PROTOCOL               V is total; decode every non-control U
ENCODER_ACCEPTABLE(U)  turnOk and any later hygiene
```

F1 treated every open-frame
non-control string as BODY. Profile 0
had briefly added `eligible(U)` and
created CHAT-inside-frame. That was a
semantic mistake: encoder hygiene used
as shared decode law. Body membership
returns to F1. Stateful decode stays.

------------------------------------------------------------------------

## 9. Exhaustive outcomes

For every accepted string, an
implementation returns exactly one
deterministic outcome. No “probably.”

Names can move. The partition cannot.

``` text
SESSION_IDLE / handshake
    PROBE
    ACK
    ACK_REQUIRED
    NOT_NCMP

SESSION_ACTIVE
    START
    CHAT
    NO_FRAME
    NOT_NCMP

FRAME_ACTIVE
    BODY_SKIP
    BODY_DATA(bits)
    PAYLOAD_COMPLETE
    FINISH_ARGUMENT
    INCOMPLETE
    OVERFLOW
    NEST
    NOT_OWNER
    CONTROL_ERROR
```

No CHAT inside `FRAME_ACTIVE`. Any
non-control body utterance produces a
BODY-family outcome.

`BODY_DATA` only when `speaker == owner`
and `mode == DATA`. A peer turn in DATA
is still zero bits.

Two implementations have the same
transition on the same
`(state, speaker, U)`.

------------------------------------------------------------------------

## 10. Profile 0, then encoder

Only after the rules above.

Profile 0 uses the mechanisms that
demonstrated V4. Not because they are
optimal. Because a baseline needs
concrete behavior.

``` text
ProtocolProfile0 {
    carrier        C6
    initial_mode   SKIP
    joint_map      half3
    alphabet       {0, 10, 11}
    final_bit      V mod 2
    eligibility    none (V is total)
    action         GET
    resource       CUSTOMER
}
```

``` text
EncoderProfile {
    LM
    k
    candidate generation
    turnOk / other hygiene
    first-legal
}
```

`k = 50` is not in the protocol profile.
The receiver neither knows nor cares
whether the sender searched 5, 50, or
50,000 candidates. Selection is private.
That split is foundational.

------------------------------------------------------------------------

## 11. Termination

Locked. `FINAL(V) = V mod 2`. Ordinary
DATA stays `{0, 10, 11}`. Empty argument
is legal. Full accumulator before FINISH
is `PAYLOAD_COMPLETE`.

`NCMP-V4-Terminate.md`

------------------------------------------------------------------------

## 12. Conformance

Given the same protocol profile and the
same ordered transcript, two independent
implementations produce identical
session state, frame state, and
application argument after every prefix.

Required traces include:

``` text
handshake
  ↓ START
  ↓ zero-payload SKIP
  ↓ DATA
  ↓ early FINISH → INCOMPLETE
  ↓ continue
  ↓ FINISH → ARGUMENT
  ↓ second START
  ↓ second frame
  ↓ FINISH
```

Plus ownership, session CHAT, NEST,
OVERFLOW, a peer turn that lands in
DATA and contributes nothing, and the
clock-time peer boundary:

``` text
FRAME_ACTIVE
peer:
Let's meet around 7:30 before the lot fills up.
    → BODY_SKIP
    → V = 14
    → bits = ""
    → next_mode = DATA
```

Two implementations must agree.

Prefix identity is `npm run test:v4-baseline`.
One canonical transcript plus the
negative traces. An independent referee
checks bits and `next_mode` on every
body turn.

That is the first concrete NCMP baseline
protocol. The implementable
specification is
`NCMP-Baseline-Protocol.md`. It is not
optimal. It assumes ordered lossless
transport. It is not a version number.

------------------------------------------------------------------------

## 13. What this is not

- a version number;
- robustness, loss, reorder, resync;
- a camouflage claim;
- a UUID;
- a recalibration of F4’s `R`;
- NCMP/3.0 or NCMP/4.0;
- an amendment to P7.

The implementable specification is
`NCMP-Baseline-Protocol.md`. This note
is the lock record. Do not amend the
specification because of a later
experiment.
