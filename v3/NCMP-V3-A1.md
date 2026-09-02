# NCMP-V3-A1

**Status:** V3 Experimental Result #20 — PARTIAL, frozen\
**Date:** August 2026\
**Parent:** C1 (Result #19, PARTIAL, frozen). M3 corpus
frozen. K4 is the rolling architecture; this is not K5.\
**Scope:** The 300 frozen M3 conversations. No new LM
calls. No new features. `V = (C6, T8)` as C1 left it.
No K3 target.

This profile is closed. Natural carrier state
accumulates across independent conversational
realizations, but the recorded rolling windows
measured here contain only one free natural turn.
Their additional entropy is prefix identity plus the
closer, not two independently varying turns.

A2 asks for the real conversational number: two
consecutive free LM turns, `H(V(B₂) | A₂)`.

------------------------------------------------------------------------

## 1. Question

> Does natural carrier information accumulate across
> turns?

``` text
V(U) = (C6, T8)

same-intent independent pair
   (V, V') ~ p̂(V) p̂(V')

actual rolling window
   A₁, B₁, U
```

M3 draws of `U` are independent given the prefix. The
same-intent pair is the product of that empirical
closer, not a recorded two-U dialogue.

------------------------------------------------------------------------

## 2. Declared carrier

C1’s `c6t`. Not `vec`. Not `R`.

------------------------------------------------------------------------

## 3. Measurement

Same-intent product. `H(V,V') = 2 H(V)` by construction.

``` text
id   |supp V|  H(V)   coll   |supp V,V'|  H(V,V')
p1       40    5.19   0.031       1600     10.38
p2       48    5.56   0.022       2304     11.13
p3       42    5.31   0.027       1764     10.62
p4       41    5.25   0.029       1681     10.51
p5       33    4.81   0.042       1089      9.63
p6       48    5.56   0.022       2304     11.13
```

``` text
one free realization      ≈ 4.8–5.6 bits
two independent draws     ≈ 9.6–11.1 bits
collision                 2–4%
```

Information can accumulate if successive natural
choices contribute, rather than one turn hitting an
externally specified six-bit target.

The recorded rolling corpus does not demonstrate that:

``` text
A₁  fixed
B₁  fixed
U   free
→ ~7.87 bits pooled

~2.58 bits = which conversation / prefix
~5.29 bits = natural closer
```

``` text
                 |supp|    H     coll
V(U)                214   7.58   0.006
(A₁, B₁)              6   2.58   0.167
(A₁, B₁, U)         252   7.87   0.005
```

------------------------------------------------------------------------

## 4. Verdict

PARTIAL.

The independent-product result is an upper-ish
reference: about ten bits for two free realizations.
The actual windows are prefix plus one free turn.

Do not treat 2H as spoken-dialogue independence.
Do not open K5. Do not add features.

------------------------------------------------------------------------

## 5. What this does not claim

- that two spoken turns in one dialogue are independent;
- K5;
- a new surface feature;
- a forced six-bit closer;
- camouflage;
- NCMP/3.0.

``` text
npm run test:v3-a1
```
