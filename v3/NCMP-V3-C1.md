# NCMP-V3-C1

**Status:** V3 Experimental Result #19 — PARTIAL, frozen\
**Date:** August 2026\
**Parent:** M3 (Result #18, PARTIAL, frozen).\
**Scope:** The 300 frozen M3 turns. No new LM calls. No
new sentences. Carrier declared first, then scored.
Do not retune features. Do not fold `R` into the
carrier. Do not hunt the missing bit inside the
sentence.

P7 C6 is not amended. This does not raise the C6
modulus.

This profile is closed. Letter-sum discards
deterministic surface information available in natural
conversational realizations. Token count recovers some
of it. The declared composite adds only a fraction of
a bit on this corpus.

A1 asks whether carrier state accumulates across turns.
Not another feature. Not another generation strategy.

------------------------------------------------------------------------

## 1. Question

M3 found ~5 bits of C6 residue under a fixed intent,
with 42–50 unique turns. That is the entropy of

``` text
N(U) = letterSum(U) mod 64
```

not a proof that the realization manifold has only five
bits.

> Are there deterministic surface features, independent
> of semantics, that distinguish natural realizations
> which collide under letter-sum?

No K3 target. No hit table.

------------------------------------------------------------------------

## 2. Declared features

Mechanical. No lexicon. No syntactic parse.

``` text
C6   letterSum mod 64
T    token count
Λ    selected-letter count
P    terminal punct      . = 0  ? = 1  ! = 2
I    internal .!? count, capped at 3
A    first selected letter
Z    last selected letter
R    length-parity of the first six tokens (diagnostic)
T8   T mod 8
```

Declared carriers, fixed before scoring:

``` text
c6     C6
c6p    (C6, P)
c6t    (C6, T8)
c6i    (C6, I)
vec    (C6, P, T8, I)
```

`A`, `Z`, and `R` are collision diagnostics only.

------------------------------------------------------------------------

## 3. Measurement

``` text
id   c6/H      c6p/H     c6t/H     c6i/H     vec/H
p1   32/4.82   32/4.82   40/5.19   34/4.93   40/5.19
p2   35/4.98   37/5.08   48/5.56   37/5.08   48/5.56
p3   29/4.69   29/4.69   42/5.31   32/4.83   43/5.35
p4   33/4.88   33/4.88   41/5.25   38/5.11   41/5.25
p5   29/4.61   30/4.65   33/4.81   29/4.61   33/4.81
p6   34/4.93   36/5.02   48/5.56   37/5.06   48/5.56
```

C6 collision classes that split:

``` text
id   P      T8      I      A      Z      R
p1   0/13   8/13    2/13   7/13   5/13   9/13
p2   2/11  11/11    2/11   8/11   9/11  10/11
p3   0/14  10/14    3/14   5/14  10/14   5/14
p4   0/13   7/13    5/13   0/13   1/13   6/13
p5   1/11   4/11    0/11   1/11   3/11   1/11
p6   2/11  10/11    3/11   6/11   8/11   6/11
```

``` text
natural realization U
       │
       ├── letter sum ─────────── ~4.6–5.0 bits
       │
       └── token count ──┐
                         ↓
                    ~4.8–5.6 bits
punctuation ─────────── almost nothing
clause count ────────── little
```

`vec` ≈ `c6t`. P and I do not add a second bit once
T8 is present.

``` text
H(C6)     4.61–4.98
H(vec)    4.81–5.56
ΔH        +0.20–+0.66
```

p2 and p6: H(vec) = 5.56 with 50 observations.
`log₂(50) ≈ 5.64`. The composite already distinguishes
nearly everything this sample gives.

There is not one forgotten feature that cleanly turns
this into six reliable bits. `R` splits many collisions
and stays diagnostic.

------------------------------------------------------------------------

## 4. Verdict

PARTIAL.

Letter-sum does discard deterministic surface
information. Token count recovers some of it. The
declared composite still does not produce a uniform
six-bit channel.

Stop looking for the missing bit inside the sentence.

``` text
M1   can force six bits; sounds worse
M2/M3  preserve language; not full six-bit support
C1   extracts more; still not a 6-bit channel
```

------------------------------------------------------------------------

## 5. What this does not claim

- that `vec` is the next carrier;
- an amendment to P7 C6;
- a larger C6 modulus;
- target recovery;
- multi-turn accumulation (that is A1);
- camouflage;
- NCMP/3.0.

``` text
npm run test:v3-c1
```
