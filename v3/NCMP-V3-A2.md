# NCMP-V3-A2

**Status:** V3 Experimental Result #21 — PARTIAL, frozen\
**Date:** August 2026\
**Parent:** A1 (Result #20, PARTIAL, frozen).\
**Scope:** Frozen M3 `A₂`. 32 new `B₂` replies each.
Same `V = (C6, T8)`. No target. No modulation. No new
features. Do not enlarge `REPLIES`. There is no A3.

This profile is closed. Conditioned on a specific
natural conversational turn, the next speaker still
contributes substantial new deterministic carrier
state. In this experiment, 32 natural replies provide
approximately 4.9 bits of conditional carrier entropy.

That is the per-`A₂` cell, not the under-sampled joint.
The coding problem is `NCMP-V3-Coding.md`.

------------------------------------------------------------------------

## 1. Question

> How much additional carrier information does the
> next natural conversational turn contribute after
> conditioning on the previous natural turn?

``` text
A₁  fixed
B₁  fixed
A₂  frozen M3 closer
B₂  LM reply to that exact history
```

------------------------------------------------------------------------

## 2. Declared carrier

C1’s `c6t`. Not `vec`. Not `R`.

------------------------------------------------------------------------

## 3. Measurement

1600 pairs per prefix (50 × 32), except p5 at 1599.

``` text
id    H(A)   H(B)   H(AB)  H(B|A)  I(A;B)  H(B|A₂ text)
p1    5.19   8.75   10.55   5.36    3.39          4.93
p2    5.56   8.74   10.58   5.01    3.73          4.94
p3    5.31   8.78   10.56   5.25    3.53          4.94
p4    5.25   8.75   10.57   5.32    3.43          4.95
p5    4.81   8.76   10.50   5.68    3.07          4.94
p6    5.56   8.75   10.54   4.98    3.77          4.90
```

``` text
H(V(B₂) | exact A₂ text)  ≈  4.90–4.95 bits
theoretical sample ceiling =  5.00 bits
```

Even after fixing exactly what A said, B’s natural
reply distribution nearly fills the 32-sample cell.

``` text
natural A₂  →  conversation constrains B₂  →  almost no freedom
```

is false on this corpus.

``` text
natural A₂
     ↓
natural B₂
     ↓
~another 5 observable bits
```

`H(AB) ≈ 10.50–10.58` sits on `log₂ 1600 ≈ 10.64`.
Do not read `I(A;B) ≈ 3.4`. The joint is not
identified. `H(B) ≈ 8.75` is B without an intent;
it is not a second identified channel width.

``` text
H(AB) ≈ H(A)                 no
H(AB) ≈ H(A)+H(B) ≈ 14       not visible here
H(B | A₂ text) ≈ 4.9         yes, at the cell cap
```

------------------------------------------------------------------------

## 4. Verdict

PARTIAL.

Conversational dependence does not extinguish the
next turn’s carrier freedom. That is enough to stop
asking how to force this turn to equal 42, and enough
to stop stacking A3, A4, … as further entropy
estimates.

There is a channel worth coding over. The next work
is the coding layer, not another conditional entropy.

Do not enlarge `REPLIES`. Do not open A3.

------------------------------------------------------------------------

## 5. What this does not claim

- that `I(A;B) ≈ 3.4` is a real mutual information;
- that later turns will also contribute ~5 bits;
- a forced residue;
- K5;
- a coding scheme (that is the next note);
- camouflage;
- NCMP/3.0.

``` text
npm run test:v3-a2
npm run test:v3-a2-lm
```
