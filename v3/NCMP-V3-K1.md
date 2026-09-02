# NCMP-V3-K1

**Status:** V3 Experimental Result #9 — frozen\
**Date:** August 2026\
**Parent:** V3-W3 (Result #8, frozen). New branch. Does not
amend H2 or W3.\
**Scope:** One value. One published relation. Three turns.
No D/E. No capacity. No camouflage. No harvest.

This profile is closed. 42 belongs to the transition, not
either endpoint. `B₁` is observational only. Whether the
other party’s reply participates in the value is
`NCMP-V3-K2.md`.

------------------------------------------------------------------------

## 1. Question

W3 located the fingerprint in a single-sentence
construction. This profile asks whether a protocol value
can leave that sentence.

> Can one deterministic protocol value be encoded in a
> relation across a three-turn conversational window, where
> no individual utterance alone carries that value?

``` text
A₁ → B
B₁ → A
A₂ → B

N(U₁) ≠ 42
N(U₂) ≠ 42
N(U₃) ≠ 42
N_window(U₁, U₂, U₃) = 42
```

------------------------------------------------------------------------

## 2. Setup

``` text
window = { previous outbound, previous inbound, current outbound }

N_window = (letterSum(A₂) − letterSum(A₁)) mod 64
```

`B₁` is in the window. Both sides must observe it. This
profile’s arithmetic does not use it. That is intentional
and small.

No model. Same `(U₁, U₂, U₃)` → same `N`.

------------------------------------------------------------------------

## 3. Measurement

``` text
A₁  N=25  Did we find the kitchen was decent although service was delayed after we sat?
B₁  N=4   Confirm the kitchen was decent although service was delayed around sunset after we sat.
A₂  N=3   Did we find the kitchen was decent although wait was sluggish once we arrived?

N(A₁)=25 ≠ 42
N(B₁)=4  ≠ 42
N(A₂)=3  ≠ 42
N_window = (Σ(A₂) − Σ(A₁)) mod 64 = 42
```

Replacing `A₂` with `A₁` loses the target. Both sides
compute the same window.

> Protocol information can live in the relationship
> between conversational turns rather than in a single
> natural-language string.

Do not enlarge that. `B₁` did not enter the arithmetic.

Continue in `NCMP-V3-K2.md`.

------------------------------------------------------------------------

## 4. What this does not claim

- that D or E have been distributed;
- that `B₁` participates in the value;
- usable joint capacity;
- covertness;
- NCMP/3.0.

``` text
npm run test:v3-k1
```
