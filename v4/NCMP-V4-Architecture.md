# NCMP-V4-Architecture

**Status:** Architecture note. Closed.
Not NCMP/4.0. Baseline protocol:
`NCMP-Baseline-Protocol.md`.\
**Date:** September 2026\
**Parent:** F1–F10 frozen. P7 and NCMP/2.0 are
not amended. V3 remains paused.\
**Scope:** What V4 is. The architecture is no
longer hypothetical.

There is no F11.

------------------------------------------------------------------------

## 1. Conclusion

NCMP can treat an ordinary natural-language
conversation as a deterministic stateful
transport, where shared conversational
state determines which utterances carry
application data, how that data is decoded,
and how successive fragments reconstruct a
framed machine message.

That is what V4 is.

Whether it can become robust, hard to
distinguish, efficient, and useful is the
next phase.

------------------------------------------------------------------------

## 2. The abstraction

V4 is no longer primarily an “encoding
natural language” idea.

NCMP is a stateful conversational
transport in which natural-language turns
have ordinary semantic meaning while also
driving a deterministic protocol state
machine that can sparsely carry
application data.

The protocol object is the conversation,
not the individual sentence.

``` text
shared state
     +
accepted natural-language turn
     ↓
deterministic transition
     ↓
optional payload fragment
     +
new shared state
```

``` text
decode(stateₙ, Uₙ) → (bitsₙ, stateₙ₊₁)
```

The SKIP/DATA machine is one realization
of that abstraction, not the final
machine. C6, `half3`, and `{0, 10, 11}`
are implementation choices. They are not
the architecture.

``` text
SESSION
   ↓
FRAME START
   ↓
natural conversation
   │
   ├── turn → state transition
   ├── turn → state transition + payload
   ├── turn → state transition
   ├── ...
   ↓
FRAME FINISH
   ↓
APPLICATION MESSAGE
```

------------------------------------------------------------------------

## 3. Four foundational properties

**Framing is independent of turn count.**
An application message is
START → BODY → FINISH. Its size
determines how long the frame may need to
remain open.

**Interpretation is stateful.** The same
utterance need not have the same protocol
interpretation in different protocol
states. That lineage goes back to S1, H,
and K. V4 makes it operational.

**Payload is sparse.** Not every turn has
to pay an encoding cost. Some turns only
evolve protocol state.

**Encoding choices are private; decoding
state is shared.** The sender may use an
LM, 50 candidates, 5,000 candidates, or
eventually no LM at all. None of that is
protocol state. The receiver sees the
accepted `U` and shared state and
deterministically gets the same result.

------------------------------------------------------------------------

## 4. Transport assumption

V4 assumes an ordered, lossless,
duplicate-free conversational transport.

``` text
A sends Uₙ
    ↓
B receives exactly Uₙ
    ↓
exactly once
    ↓
in order
```

`Transcript_A == Transcript_B` is an
assumption, not a guarantee.

This is frozen for the V4 baseline. It
lets the next work ignore missing turns,
duplicates, reordering, crash recovery,
state commitments, sequence numbers,
replay repair, and resynchronization.

The problem is not deleted. It is a
post-baseline requirement.

``` text
architecture            we are here
    ↓
baseline protocol
    ↓
complete end-to-end semantics
    ↓
robustness layer
    ├── synchronization
    ├── loss
    ├── duplication
    ├── ordering
    ├── repair
    ├── resync
    └── integrity / replay
```

Designing recovery now would mean
designing it for today’s experimental
choices. Once a concrete baseline exists,
it will be clear what state must survive,
what can be recomputed, what a checkpoint
is, what replay means, and what is safe
to discard.

------------------------------------------------------------------------

## 5. What NCMP is not

Not a cipher where words secretly mean
numbers.

Not steganography using sentences.

Not “encode a machine command into
natural language.”

Those were useful ways into the problem.
V4 has moved past them.

A better model: two machines run the same
deterministic protocol state machine
alongside an ordinary conversation. The
conversation is the shared event stream
driving that machine. Some events produce
application data. Some only transition
state.

``` text
English layer:    "The pasta was pretty good."
Protocol layer:   DATA("10"), next=SKIP
```

They coexist without claiming that pasta
means 10. Protocol meaning comes from
`(state, exact utterance)`, not from
English semantics.

------------------------------------------------------------------------

## 6. The demonstrated chain

``` text
natural language
      ↓
deterministic carrier
      ↓
shared conversational state
      ↓
variable-length framing
      ↓
sparse payload-bearing turns
      ↓
variable-length codewords
      ↓
reconstructed application argument
```

``` text
V2 / P7   a string can be a deterministic
          protocol object

V3        conversation and language can
          become protocol state

V4        a sparse, stateful conversation
          can carry an argument without
          every turn hitting an exact
          residue
```

``` text
F1   variable-length framing                 PASS
F2   deterministic accumulation              PASS
F3   declared-length reassembly              PASS
F4   natural-language argument coding        PASS
F5   initial reliability                     PARTIAL
F6   independent opportunity reliability     PARTIAL
F7   payload-bearing status becomes state    PASS
F8   sparse schedule over conversation       PASS
F9   payload + scheduling become one decoder PASS
F10  complete sparse argument                PASS
```

The specific carrier and code used to
demonstrate the chain are not the
architecture.

------------------------------------------------------------------------

## 7. Experimental choices

These worked in the recorded runs. They
are not claimed as the protocol.

``` text
carrier          C6, modulus 64
realization      SKIP / DATA
first body mode  SKIP
next_mode        V < 32 → DATA, else SKIP
DATA alphabet    {0, 10, 11} via V mod 3
map              half3
selection        first legal U in k = 50
declared length  tiny → 8
argument         10110110
```

F4’s `R`, `π`, `accept`, and `k = 50`
remain a frozen natural-coding mechanism.
F10 does not use `R`. `half3` is the
minimal lift from F7, not a scored
optimum.

------------------------------------------------------------------------

## 8. Open problems

The architecture exists. It is not yet a
specification. Several fundamental
choices remain experimental.

The next question is not robustness.

> What is missing to turn the
> demonstrated V4 architecture into the
> first concrete baseline protocol?

Those decisions are recorded in
`NCMP-V4-Baseline.md`. Frame ownership
implies payload authority. Profile 0 final bit is `V mod 2`.
Prefix conformance is
`npm run test:v4-baseline`. No version
number.

After a baseline, robustness: detect
divergence, repair missing history,
resynchronize, integrity and replay.

Engineering questions that do not
reshape the architecture first:

- whether `half3` is a good code;
- long-frame reliability;
- a UUID or any large argument;
- distinguishability of an F10
  conversation (W);
- whether F4’s history-derived `R` and
  F9’s joint map should meet.

Do not open F11 to chase any of these
from this note.

------------------------------------------------------------------------

## 9. What this note is not

- a specification;
- NCMP/3.0 or NCMP/4.0;
- a camouflage result;
- a claim that every natural conversation
  can carry an argument;
- an amendment to P7 or NCMP/2.0.

`NCMP-V4-Direction.md` stays the path
that got here. This note is what V4 is.
