# NCMP-V4-J

**Status:** Pause note. Not an experiment. Not a
specification. Not a chosen map.\
**Date:** September 2026\
**Parent:** `NCMP-V4-Joint.md`. F7, F8 frozen.\
**Scope:** The maps `J_DATA` and `J_SKIP` under
one invariant. Candidate layouts and their
redundancy budgets. No F6. No LM.

------------------------------------------------------------------------

## 1. One decoder

``` text
decode(modeₙ, Vₙ) → (bitsₙ, modeₙ₊₁)
```

``` text
current_mode = SKIP
    V → next_mode
    bits = ""

current_mode = DATA
    V → (bits, next_mode)
    bits ∈ {0, 10, 11}
```

DATA is not “decode bits, then separately
calculate scheduling.” There is one
transition.

------------------------------------------------------------------------

## 2. State buys the alphabet twice

We do not split 64 into SKIP states and
DATA states.

``` text
SKIP state:   64 V values → 2 outcomes
DATA state:   same 64 V values → 6 outcomes
```

Mode is already shared decoder state. The
same residue has a different reading once
`current_mode` is known.

------------------------------------------------------------------------

## 3. The object

``` text
J_DATA : {0..63} → {
    (0,S),  (0,D),
    (10,S), (10,D),
    (11,S), (11,D)
}

J_SKIP : {0..63} → {S, D}
```

Invariant, kept unless an experiment
gives a reason not to:

``` text
next_mode of J_DATA(V)  =  J_SKIP(V)
```

Then `next_mode(V)` is a property of the
carrier, independent of current mode.
Current mode determines whether that same
`V` also yields payload.

``` text
V determines tomorrow
state determines whether V says anything today
```

That is the F7 idea, written as a pair of
maps.

------------------------------------------------------------------------

## 4. Budget, not a corpus

Equal DATA split:

``` text
64 / 6  ≈  10.7 states / DATA outcome
```

F6’s successful `r = 3` case had

``` text
64 / 8  =  8 residues / symbol
```

From the alphabet alone the joint idea is
not obviously starved. SKIP, under a 50/50
`next_mode`, has 32 residues per outcome.

Do not touch the frozen F6 sets here.

------------------------------------------------------------------------

## 5. Candidate maps

Declared before any corpus look. None
chosen. All three obey the invariant by
construction: `J_SKIP = next of J_DATA`.

``` text
half3      F7 half;  symbol = V mod 3
halfBlock  F7 half;  thirds [0,11),[11,22),[22,32)
mod6       V mod 6 → the six outcomes in order
```

`half3` and `halfBlock` keep F7’s
`V < 32 → next DATA`. `mod6` keeps only
the invariant.

``` text
          0+S  0+D  10+S  10+D  11+S  11+D     SKIP D/S
half3      11   11    10    11    11    10         32/32
halfBlock  11   11    11    11    10    10         32/32
mod6       11   11    11    11    10    10         32/32
```

Every outcome has at least 10 residues.
Where the leftover four land is a fact of
the declaration, not a preference.

------------------------------------------------------------------------

## 6. What follows, later

F9 (Result #9, PASS) used `half3` because
it changes the least from F7. F10
(Result #10, PASS) carried an argument
with it. That is not a claim that `half3`
is the best code. Experiments stop.
`NCMP-V4-Architecture.md`

------------------------------------------------------------------------

## 7. What this is not

- an experiment;
- a chosen `J`;
- a score on frozen F6;
- a change to F7;
- a return to the 14-class budget;
- NCMP/4.0.

``` text
npm run test:v4-j
```
