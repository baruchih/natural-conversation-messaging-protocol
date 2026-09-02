# NCMP-V3-HK1

**Status:** V3 Experimental Result #13 — frozen\
**Date:** August 2026\
**Parent:** H2 (Result #7) and K4 (Result #12), both frozen.\
**Scope:** One window. Frozen `Lₙ` with harvested `sunset`.
Frozen K4 profile. No harvest in this window. No camouflage.

This profile is closed. Do not change the published window,
`windowE`, or the three controls. The next experiment is
HK2: one window mutates `L`; the next overlapping window
consumes that mutation.

------------------------------------------------------------------------

## 1. Question

> Can a terminal harvested from prior conversation
> participate in the interpretation of a later rolling-window
> frame while both participants remain synchronized?

Not: can we hide `Did we find <E>`.

------------------------------------------------------------------------

## 2. Setup

``` text
width 3   stride 1   relation K2
Lₙ.CUSTOMER = { that party, sunset }

A1 contains sunset, not find-sunset
B1 ordinary ALLOW
A2 interrogative, residue solved by K3
```

``` text
δ(A1) ≠ GET CUSTOMER 42
δ(B1) ≠ GET CUSTOMER 42
δ(A2) ≠ GET CUSTOMER 42
δ(W, Lₙ) = GET CUSTOMER 42
δ(W, L₀) → E ≠ CUSTOMER
alter one K turn → N ≠ 42
```

Window E is presence of a harvested construction in the
window, not H1’s `find` slot. Window D is the closer’s
discourse. Window N is K2.

------------------------------------------------------------------------

## 3. Measurement

``` text
A1  GET  NONE  N=1   Did sunset arrive late at the restaurant after dinner last night?
B1  ALLOW NONE N=35  Confirm the restaurant was good but service was slow around sunset.
A2  GET  NONE  N=8   Did we find the restaurant was good yet service was slow during dinner?

W   GET CUSTOMER 42
W / L₀     E = NONE
alter B1   N ≠ 42
```

``` text
A1   E=NONE   N=1
B1   E=NONE   N=35
A2   E=NONE   N=8
window:
D = GET
E = CUSTOMER     ← because "sunset" ∈ Lₙ
N = 42           ← (8 − 1 + 35) mod 64
→ GET CUSTOMER 42
```

``` text
remove evolved L → E disappears
alter B1         → 42 disappears
inspect singleton → complete frame disappears
```

H is necessary. K is necessary. The window is necessary.
That is real composition.

No singleton is GET CUSTOMER 42. No `find sunset`.

------------------------------------------------------------------------

## 4. Claim

> A previously harvested session terminal can participate
> in a later rolling-window frame, with H supplying entity
> interpretation, K supplying the relational value, and
> neither individual utterance carrying the complete frame.

No more than that. First composition of the two V3
branches.

Continue in `NCMP-V3-HK2.md`.

------------------------------------------------------------------------

## 5. What this does not claim

- camouflage;
- harvest inside this window;
- HK2;
- NCMP/3.0.

``` text
npm run test:v3-hk1
```
