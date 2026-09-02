# NCMP-V4-F8

**Status:** V4 Experimental Result #8 — PASS, frozen\
**Date:** August 2026\
**Parent:** F7 (Result #7, PASS, frozen).\
**Scope:** The frozen F7 transition on twenty
declared ordinary turns. No target schedule.
No prefix alphabet. No LM.

This profile is closed. A deterministic state
transition can produce a nontrivial sparse
DATA/SKIP schedule over ordinary
conversational turns while both participants
remain synchronized.

------------------------------------------------------------------------

## 1. Question

> Can this deterministic state transition produce
> a longer irregular DATA/SKIP schedule over
> ordinary conversational turns while both
> participants remain synchronized?

Irregular here means nontrivial and not
target-designed. No statistical or randomness
claim.

Two sparsities stay separate.

``` text
temporal    which turns carry anything      this note
symbolic    what DATA turns carry           not here
```

Do not attach `{0, 10, 11}`.

------------------------------------------------------------------------

## 2. Declared body

Twenty published turns, listed before
measurement: F1 dinner body, F4 frozen body,
five F5 history lines. Not chosen for `V`.
Not chosen for irregularity.

F7’s rule is unchanged.

``` text
next_mode(V) = DATA  if V < 32
             = SKIP  if V ≥ 32
DATA bit     = V mod 2
first turn   = SKIP
```

------------------------------------------------------------------------

## 3. Measurement

Both participants compute the same schedule.
No private coin. Distribution not optimized.

``` text
schedule   S D S S D S D D D S D S S S S D D S D S
DATA       9
SKIP       11
runs       S1 D1 S2 D1 S1 D3 S1 D1 S4 D2 S1 D1 S1
bits       011101101
```

Nine DATA / eleven SKIP and varied run
lengths are enough to show that the
mechanism does not inherently collapse into
always-DATA or a trivial alternating pattern
on this sequence.

The toy rule did not collapse to `D D D D …`.
It also was not aimed at this pattern.

------------------------------------------------------------------------

## 4. Verdict

PASS.

Temporal sparsity is a primitive. The body
is a state machine: current mode decides
whether the turn contributes bits; every
turn establishes `next_mode`. Symbolic
coding remains untouched.

``` text
FRAME BODY
turn
 ↓
current mode
 ↓
┌──────────────┐
│ SKIP         │ → 0 payload bits
│ DATA         │ → symbolic codeword
└──────────────┘
 ↓
next_mode
```

------------------------------------------------------------------------

## 5. What this does not claim

- a prefix code;
- a useful argument;
- camouflage;
- a statistical or randomness property;
- a change to F7;
- NCMP/4.0.

``` text
npm run test:v4-f8
```
