# NCMP-V3-L4

**Status:** V3 Experimental Result #4 — frozen\
**Date:** August 2026\
**Parent:** V3-L3 (Result #3, frozen)\
**Scope:** Same toy `f` as L1, applied until it cannot derive.
Same `P`. Same letter-sum. No LM. No new class. No new
carrier. No automatic `C` switch.

This profile is closed. The first adaptive-capacity
hypothesis is closed with it. Do not add a fifth `HEAD` or
change `f` to chase 512. The closure is four constructions.
That is a property of the system, not an inconvenience.
There is no L5 until the V3 direction is reassessed.

------------------------------------------------------------------------

## 1. Question

L1–L3 tested one evolution. `C*` did not move. The original
V3 claim was about accumulated growth, not one extra word.

> If the same deterministic evolution mechanism is applied
> repeatedly, does accumulated language growth eventually
> move the capacity frontier?

``` text
L₀ → L₁ → L₂ → … until f cannot derive
at each n:  |Lₙ|  |Fₙ(P)|  unique sums  C*(Lₙ, P)
```

------------------------------------------------------------------------

## 2. Setup

First step is the frozen L1 utterance, so `L₀` and `L₁` must
match Results #2 and #3. Later steps use the same stem and
extra DET `the`, with remaining `HEAD`s. That is not a new
rule. It is L1’s template until `evolve` returns nothing.

`Fₙ` is the union of L2-style D1 families, one seed per
construction in `Lₙ`.

`C*` is L3’s quantity. `M` is still a measurement.

------------------------------------------------------------------------

## 3. Measurement

``` text
n   L                                         |L|   |F|     unique  C*
0   { that party }                              1   3,024     357   256
1   { that party, that holder }                 2   6,048     384   256
2   { that party, that holder, that person }    3   9,072     397   256
3   { that party, that holder, that person,
      that one }                                4  12,096     424   256
```

`f` cannot derive a fifth construction. The closed set under
this `DET`/`HEAD` and this matched-DET rule is four phrases,
all `that + HEAD`.

``` text
capacity
   │
512│
   │
256│──●────●────●────●
   │
   └─ L₀   L₁   L₂   L₃   (exhausted)
```

``` text
L₀ → L₁ → L₂ → L₃ → exhausted
|L|       1       2       3       4
|F|    3,024   6,048   9,072  12,096
unique    357     384     397     424
C*        256     256     256     256
```

`C*` did not move.

Four times as many valid realizations. The same 8 reliable
bits. The projection only reached 424 unique sums; the next
boundary needs 512. The grammar exhausted first.

This is stronger than L2/L3. Accumulated growth through the
entire reachable closure increased expressive diversity and
never increased the carrier-capacity frontier.

------------------------------------------------------------------------

## 4. What this corrects

The original V3 chain was:

``` text
conversation → language grows → more choices → more bits
```

L1–L4 say:

``` text
conversation
   ↓
language grows          YES
   ↓
more realizations       YES
   ↓
more raw decoder states YES
   ↓
more usable bits        NOT NECESSARILY
```

Every arrow can fail independently. L4 failed at the last
one. Lexicon size is not the variable. Sentence count was
not the variable in P7 either. Collisions, then coverage of
a larger codomain, are.

``` text
ΔL ≠ ΔC
capacity(Lₙ₊₁) must be measured, not assumed.
```

What failed is the stronger claim that deterministic
language growth inherently produces capacity growth. Adaptive
capacity as a V3 idea is not thereby dead. Some later `f`
might move the frontier. That would have to be measured, and
engineering a richer `f` just to reach 512 is not the next
experiment.

If additional payload bits are not automatic, the open
question is what else a dynamic `L` should buy: compression,
contextual specialization, a smaller bootstrap lexicon,
richer protocol vocabulary, session-specific serialization.
Think before writing L5.

------------------------------------------------------------------------

## 5. What this does not claim

- a better evolution rule;
- that the session should switch carrier;
- that adaptive capacity is impossible;
- NCMP/3.0.

``` text
npm run test:v3-l4
```
