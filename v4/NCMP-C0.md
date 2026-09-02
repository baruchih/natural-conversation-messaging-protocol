# NCMP-C0

**Status:** YES. Architectural witness. Not the protocol.  
**Date:** September 2026  
**Parent:** [NCMP-Control.md](NCMP-Control.md)  
**Name:** Exceptional-turn primitive  
**Code:** `c0.ts` · `npm run test:v4-c0`

An `X` exists that meets §3. The §5 observation is exhibited. Naturalness and collision are not judged. `process` is unchanged. PROBE, ACK, START, and FINISH are not designed here.

------------------------------------------------------------------------

## 1. Question

> Can `(state, U)` deterministically distinguish ordinary processing from “take the exceptional transition available in this state,” without reserving words and without consuming a BODY carrier value?

**Yes.**

------------------------------------------------------------------------

## 2. Witness

Same letter stream C6 already uses. A second projection. A target taken only from shared state.

``` text
letters(U)   C6's a-z sequence
             NFC, lowercase, a-z only, a=1 … z=26

C6(U)        Σ value(ch) mod 64
             BODY carrier. X never consults it.

P(U)         Σ i · value(chᵢ) mod 64
             i is 1-based position in letters(U)

T(state)     0..63, derived only from shared state

X(state, U)  EXCEPTIONAL  if P(U) = T(state)
             ORDINARY     otherwise
```

C0 fixture:

``` text
INACTIVE
    T = 0

FRAME_ACTIVE
    Baseline START tiny, owner A, initial SKIP
    header_remaining    = 2
    argument_remaining  = 8
    T = (2 + 8) mod 64  = 10
```

On the exceptional path, `U` still has a C6 value. That value is not consumed. On the ordinary path, `C6(U)` is unchanged.

------------------------------------------------------------------------

## 3. Requirements

1. **deterministic** — `X` is a total function of `(state, U)`.
2. **stateful** — §5.
3. **orthogonal to C6** — `X` consults `P` and `T`, never `C6(U) = x`.
4. **non-lexical** — no reserved word, phrase, or semantic construction.
5. **ordinary preservation** — every `C6` value in `0..63` remains attainable with `P(U) ≠ T(state)`.

What this does not do: reserve a subset of C6 values globally as control.

------------------------------------------------------------------------

## 4. First states

Labels only. PROBE and FINISH semantics are not tested.

``` text
INACTIVE
    exceptional → PROBE
    ordinary    → ordinary conversation

FRAME_ACTIVE
    exceptional → FINISH
    ordinary    → BODY → C6(U)
```

------------------------------------------------------------------------

## 5. Killer observation

``` text
U  = Let me know.
C6 = 54
P  = 10

INACTIVE       T = 0   → ORDINARY
FRAME_ACTIVE   T = 10  → EXCEPTIONAL
```

The reverse flip:

``` text
U  = That works for Saturday.
C6 = 27
P  = 0

INACTIVE       T = 0   → EXCEPTIONAL
FRAME_ACTIVE   T = 10  → ORDINARY
```

``` text
control status = (state, U)
control status ≠ U
```

------------------------------------------------------------------------

## 6. What this is not

C0 is not judged on naturalness or collision probability.

It is not a START-length experiment.  
It is not a handshake experiment.  
It is not an optimization of the current token recognizers.  
It is not adopted into `process`.

`T = 0` for INACTIVE is a Profile-level constant of this fixture. When a later FRAME_ACTIVE snapshot also has remaining sum `0`, those two states share a target. That does not undo §5.

------------------------------------------------------------------------

## 7. Close

``` text
YES   an X that meets §3, with the §5 observation exhibited
```

Next is selectivity: [NCMP-C1.md](NCMP-C1.md). Do not map the four controls, do not change `process`, and do not freeze v0.1.
