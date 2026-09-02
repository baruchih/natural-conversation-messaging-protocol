# NCMP-V4-Sparse

**Status:** Pause note. Not an experiment. Not a
specification.\
**Date:** August 2026\
**Parent:** `NCMP-V4-Rate.md`. F4 (Result #4,
PASS). F3 (Result #3, PASS).\
**Scope:** A sparse carrier stream inside a
frame. Not every body turn is payload-bearing.
There is no chosen skip/data code. Camouflage
is not claimed.

------------------------------------------------------------------------

## 1. The extra assumption

F4 treated every body turn as a payload turn.

``` text
START
  U → bits
  U → bits
  U → bits
FINISH
```

There is no reason for that. The frame can
hold an ordinary conversation and a sparse
code stream at once.

``` text
conversation:
A1 → B1 → A2 → B2 → A3 → B3 → A4 …
protocol:
      —    bits   —    —   bits   —
```

``` text
decode(Hₙ, V(Uₙ)) →
    SKIP
 or DATA(bits)
```

SKIP is deterministically observable. Both
parties see the same accepted `U` and compute
the same interpretation.

------------------------------------------------------------------------

## 2. next_mode is state

A turn can set the interpretation of the
*next* turn.

``` text
decode(Hₙ, V(Uₙ)) → {
    bits:       maybe a payload fragment
    next_mode:  DATA | SKIP
}
```

That is `decode(H, V) → (bits, next_state)`
with a job for `next_state`: decide which
later turns carry the argument.

A private coin flip is not a code. B would
not know. The schedule can look irregular
and still be a function of shared state:

``` text
next_mode = f(Hₙ, V(Uₙ))
```

or part of the codeword itself.

------------------------------------------------------------------------

## 3. The budget changes

`V` no longer spends all 64 states on payload
fragments. It can encode a transition:

``` text
SKIP_NEXT_DATA
SKIP_NEXT_SKIP
DATA_0_NEXT_DATA
DATA_0_NEXT_SKIP
…
```

Not a chosen alphabet. The shape is a
state-machine step:

``` text
(Hₙ, Vₙ)
      ↓
{ payload contribution,
  next interpretation state }
      ↓
Hₙ₊₁
```

A still simpler split: `H.mode` is CONTROL
or DATA. CONTROL spends `V` only on the next
mode. DATA spends `V` on a payload fragment
and the next mode. Some natural turns then
have no payload constraint at all.

That may leave more of the conversation on
the LM’s preferred trajectory. W5 said
forcing every turn has a modulation cost.
This is not a camouflage result.

------------------------------------------------------------------------

## 4. Do not start with irregularity

The first primitive is smaller than a
pseudo-random schedule and smaller than
`{0,10,11}`.

> Can one accepted natural turn deterministically
> tell both participants whether the next
> conversational turn is payload-bearing or not?

``` text
same Uₙ₊₁
under SKIP → no payload
under DATA → payload
```

Whether an utterance contributes application
payload can itself be conversational state
established by prior accepted traffic.

F7 (Result #7, PASS) asks only that. F8
(Result #8, PASS) runs the same rule over
twenty declared ordinary turns. Temporal
sparsity holds. Symbolic coding is
`NCMP-V4-Joint.md` `NCMP-V4-J.md`.
F9 (Result #9, PASS) is the joint machine.
F10 (Result #10, PASS) carried a declared
argument. Experiments stop.
`NCMP-V4-Architecture.md`

------------------------------------------------------------------------

## 5. What this is not

- a chosen skip/data alphabet;
- history-permuted geometry;
- F4’s `R` recalibrated;
- a UUID;
- a W result;
- NCMP/4.0.
