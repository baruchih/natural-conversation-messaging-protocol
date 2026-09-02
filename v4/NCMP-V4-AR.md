# NCMP-V4-AR

**Status:** AR-4 locked. Vocabulary
open. Not an experiment. Not a
specification. Not NCMP/4.0.\
**Date:** September 2026\
**Parent:** Profile 0 locked for
argument transport. Publication of
v0.1 paused.\
**Scope:** Action and resource are
a fixed-width application header
on the BODY bitstream. Do not
amend `NCMP-Baseline-Protocol.md`
or `ncmp/NCMP.md` from this note.

------------------------------------------------------------------------

## 1. The hole

The application object was always
three fields:

``` text
ACTION  RESOURCE  ARGUMENT
```

Profile 0 transmits only the third.
GET and CUSTOMER are assigned at
START. A completed frame is
`GET CUSTOMER <argument>` by
construction.

That is argument transport for one
pre-agreed message type. v0.1
publication stays paused until
action and resource are recovered
from the transcript.

------------------------------------------------------------------------

## 2. Lock

AR-4.

Action and resource are transmitted
as a fixed-width application header
at the beginning of the BODY
bitstream, using the same sparse
stateful carrier as the argument.

START continues to declare
argument length. Header width and
codebook are properties of the
profile.

``` text
START
  ↓
BODY stream
  ↓
┌─────────────┬──────────────┬──────────────────┐
│ ACTION bits │ RESOURCE bits│ ARGUMENT bits    │
└─────────────┴──────────────┴──────────────────┘
  ↓
FINISH
  ↓
ACTION RESOURCE ARGUMENT
```

GET and CUSTOMER are then no more
privileged than `10111`. They are
values recovered from the
conversation.

``` text
shared state + U
        ↓
   bits + next state
```

All three application fields come
through that function. No second
decoder. No new carrier. No new
conversational mechanism.

------------------------------------------------------------------------

## 3. Rejected for v0.1

AR-1. START tokens would put type
on the wire, but START becomes a
conventional textual header.

AR-2. P7 `δ_D` / `δ_E` on an early
`U` reintroduces sentence-level
grammar. V4 moved away from that.

AR-3. Session language is a
different proposition: message
type depends on previously evolved
`Lₙ`. Interesting later. Not this
hole.

A later profile may still use
AR-2 or AR-3. Those claims are
not required to close this one.

------------------------------------------------------------------------

## 4. START declares argument length

Not total wire length.

Header width is determined by the
profile. Both parties already know
it. START vocabulary is not spent
declaring it.

The five markers keep their
meaning:

``` text
empty   →  argument has 0 bits
short   →  argument has 5 bits
tiny    →  argument has 8 bits
brief   →  argument has 24 bits
wide    →  argument has 128 bits
```

If a profile’s header were 4 bits
and START were `short`:

``` text
BODY must recover

AAA R XXXXX
│   │   │
│   │   └── 5 argument bits
│   └────── resource
└────────── action
```

Nine bits on the wire. `short`
still means 5 argument bits.

------------------------------------------------------------------------

## 5. Framing

One accumulator. Decode knows
where it is.

``` text
BODY bits
   ↓
first H bits       → ACTION / RESOURCE
remaining n bits   → ARGUMENT
```

``` text
FrameState {
    owner
    argument_bits
    mode
    accumulator
    header_remaining
    argument_remaining
}
```

`H` and the codebook are profile.
`n` is declared at START.
`application_bits = H + n` is
derived, not declared.

SKIP/DATA does not care which
part is being filled:

``` text
owner + DATA
    ↓
symbol(V)
    ↓
next unfilled application bits
```

Ownership, C6, half3, FINISH, and
prefix conformance do not change.

FINISH still requires the declared
argument to be complete. Header
must be complete before argument
bits are accepted; an incomplete
header at FINISH is incomplete.

------------------------------------------------------------------------

## 6. Codebook

Locked in `NCMP-V4-Vocab.md`.
2 × 2. All four legal.

``` text
ACTION      1 bit   GET | SET
RESOURCE    1 bit   CUSTOMER | ORDER
header      2 bits
```

Parsed as two fields, not as four
atomic message types. D6 and E1
are not imported.

------------------------------------------------------------------------

## 7. Next

AR-C1 PASS. 2×2 composes.

Do not amend v0.1 yet. Scale and
budget first.

`NCMP-V4-Vocab-Scale.md`
`NCMP-V4-AR-C2.md`
`NCMP-V4-Header-Budget.md`

------------------------------------------------------------------------

## 8. Out of scope

Do not start a cell from this
note.

Do not raise C6, change half3,
add START lengths, enlarge `k`,
or reopen Eval-C / W.

Do not amend the baseline
machine or `ncmp/NCMP.md` until
vocabulary is locked.

Do not invent NCMP/4.0.
