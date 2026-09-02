# NCMP-V4-Code

**Status:** Pause note plus offline score. Not a
specification. Not a chosen code.\
**Date:** August 2026\
**Parent:** `NCMP-V4-Rate.md`. F6 (Result #6,
PARTIAL, frozen).\
**Scope:** How 64 carrier states are divided
among length, value, and redundancy. No new LM.
No residue fitting. There is no F7. F4’s `R` is
not changed.

Self-delimitation is easy. Self-delimitation
with enough redundancy to be naturally
encodable is the hard part.

------------------------------------------------------------------------

## 1. One question

> Given one observable carrier value `V`, how
> can A and B deterministically know where its
> codeword ends?

``` text
decode(V) → bits
```

The unit is not “states per width.” It is
states per payload symbol:

``` text
k(b) = number of V values decoding to b
Σ k(b) ≤ 64
```

over every supported bitstring `b`.

------------------------------------------------------------------------

## 2. Uniform within a width

If redundancy is constant inside each width
1–3, the whole design space is

``` text
2k₁ + 4k₂ + 8k₃ ≤ 64
```

There is no requirement that `k₁ = k₂ = k₃`.
Those are different bets about where natural
language needs copies.

Illustrative only:

``` text
k₁  k₂  k₃    cost
 4   4   4      56
 8   6   3      64
 8   4   4      64
 4   6   4      64
 4   4   5      64
```

F6’s one anchor: a 3-bit symbol with 8
residues looked extremely reachable at
`k = 50`. We did not know 4, 3, or 2.

------------------------------------------------------------------------

## 3. One allocation, then the corpus

Do not assign residues against the frozen
sets. That overfits.

Declared before scoring: contiguous regions,
width 1 then 2 then 3, `k` consecutive states
per symbol in binary order. Remainder
reserved. Corpus-independent.

``` text
frozen F6 candidate set
        ↓
contiguous (k₁,k₂,k₃)
        ↓
for every supported bitstring:
    does at least one V exist?
```

Eighteen independent frozen sets. No new
language. `npm run test:v4-code`

------------------------------------------------------------------------

## 4. Offline measurement

504 feasible budgets with `k₁,k₂,k₃ ≥ 1`.
None gave full 14-codeword coverage on all
18 sets.

``` text
k₃   best full sets / 18
7    2
6    9
5   11
4   12
3   11
2    7
1    2
```

Best observed: 12/18 complete sets, around
`k₃ = 4`, mean about 13.6 of 14 codewords.
The usual miss is one 3-bit symbol.

``` text
k₁/k₂/k₃   full    mean/14   min   w₃
4/4/4      8/18    13.39     12   13
8/6/3      8/18    13.33     12   10
8/4/4     10/18    13.44     12   14
4/4/5     11/18    13.61     13   17
4/6/4     12/18    13.56     12   14
5/5/4     12/18    13.67     13   14
```

No budget is chosen. Contiguous regions may
be a harsh layout if C6 clusters. Interleaving
is another declared rule. It is not chased
after seeing these scores.

Supporting 1–3 bit self-delimiting codes on
this alphabet is not free: opening three
widths spends the redundancy F6 used for a
single 3-bit width. Mean coverage stays high.
All-14 coverage on every frozen set does not.

------------------------------------------------------------------------

## 5. What this is not

- a chosen code;
- F7;
- residue assignment fitted to F6;
- history-dependent `decode(H, V)`;
- a recalibration of F4’s `R`;
- an LM run;
- a camouflage result;
- NCMP/3.0 or NCMP/4.0.

``` text
npm run test:v4-code
```
