# NCMP-V3-K3

**Status:** V3 Experimental Result #11 — frozen\
**Date:** August 2026\
**Parent:** V3-K2 (Result #10, frozen)\
**Scope:** Interactive encoder for K2’s window. A is given
a target and `A₁`. `B₁` is uncontrolled. C6-HY/D1 produces
`A₂`. No camouflage. No D/E on the window.

This profile is closed. A can close one window after B.
The closer is A. Overlapping windows and a shared clock
are `NCMP-V3-K4.md`.

------------------------------------------------------------------------

## 1. Question

K2 selected three sentences that already satisfied the
equation.

> Can one participant deterministically complete a
> conversational window to a target protocol value after
> incorporating an uncontrolled contribution from the other
> participant?

------------------------------------------------------------------------

## 2. Setup

``` text
target = 42
A₁ published
B₁ any well-formed ALLOW realization of the dinner P
need(A₂) = (target + N(A₁) − N(B₁)) mod 64
A₂ = first D1 realization of that residue
```

`N_window` is K2’s. Success is `window = 42` after an
arbitrary `B₁`.

------------------------------------------------------------------------

## 3. Measurement

``` text
A₁ N=25
K2’s B₁ N=4  → need A₂=63  generated 63  window=42

B replies     3024
B residues      64
A₂ cover     64/64
closes    3024/3024
```

Every ALLOW dinner-family reply can be closed. A solves
after seeing `B₁`. The encoder is C6-HY/D1, not a model.

> One participant can deterministically complete a
> conversational window to a target protocol value after
> incorporating an uncontrolled contribution from the other
> participant.

Do not enlarge that. This is one window. A is the closer.
Continue in `NCMP-V3-K4.md`.

------------------------------------------------------------------------

## 4. What this does not claim

- covertness;
- that B is speaking outside the dinner family;
- joint capacity;
- NCMP/3.0.

``` text
npm run test:v3-k3
```
