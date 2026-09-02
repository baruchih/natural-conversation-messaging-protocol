# NCMP-V3-K2

**Status:** V3 Experimental Result #10 — frozen\
**Date:** August 2026\
**Parent:** V3-K1 (Result #9, frozen)\
**Scope:** Same three-turn window shape. `B₁` now enters the
arithmetic. No D/E. No capacity. No camouflage.

This profile is closed. The value is jointly constituted.
Whether A can close an arbitrary `B₁` to a target is
`NCMP-V3-K3.md`.

------------------------------------------------------------------------

## 1. Question

K1 encoded 42 in `A₂ − A₁`. `B₁` was only observed.

> Can a protocol value depend irreducibly on all three
> turns, including the other participant’s response?

------------------------------------------------------------------------

## 2. Setup

``` text
N_window = (letterSum(A₂) − letterSum(A₁) + letterSum(B₁)) mod 64
```

Controls: replace `A₁`, or `B₁`, or `A₂`. The value must
move each time. No singleton is 42.

------------------------------------------------------------------------

## 3. Measurement

``` text
A₁  N=25
B₁  N=4
A₂  N=63
none = 42

N_window = (ΣA₂ − ΣA₁ + ΣB₁) mod 64 = 42

replace A₁ → 23
replace B₁ → 61
replace A₂ → 4
```

K1’s `A₂ − A₁` on this window is not 42. `B₁` is not
disposable.

> A protocol value can be jointly constituted by successive
> contributions from both conversational participants.

Do not enlarge that. These three sentences were selected to
satisfy the equation. Completing the window after an
uncontrolled `B₁` is `NCMP-V3-K3.md`.

------------------------------------------------------------------------

## 4. What this does not claim

- joint capacity;
- covertness;
- that D or E are distributed;
- NCMP/3.0.

``` text
npm run test:v3-k2
```
