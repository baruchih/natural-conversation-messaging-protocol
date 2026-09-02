# NCMP-V4-Geom

**Status:** Pause note plus offline score. Not a
specification. Not a chosen code.\
**Date:** August 2026\
**Parent:** `NCMP-V4-Code.md`. F6 frozen
candidate sets.\
**Scope:** Budget ≠ geometry. One predeclared
dispersed allocation. One predeclared neutral
budget. Same frozen F6 sets. No new language.
No history. There is no F7.

`NCMP-V4-Code.md` stays a pause note. No budget
is chosen because it scored well.

------------------------------------------------------------------------

## 1. Question

> Was contiguous geometry wasting the redundancy
> we already paid for?

Two questions were mixed:

``` text
budget     how many copies does each symbol get?
geometry   where do those copies sit in V-space?
```

Code fixed geometry to contiguous blocks. That
was the right first measurement. More `k₃`
eventually hurt because extra 3-bit territory
moved the contiguous regions and stole copies
from 1- and 2-bit symbols. Where a region sits
matters almost as much as how large it is.

Natural realizations cluster in residue space
(M2/M3). Four neighboring copies can be one
opportunity. Four copies on the C6 circle are
four opportunities.

``` text
contiguous   symbol 101 → {32, 33, 34, 35}
interleaved  symbol 101 → four samples around the circle
```

Redundancy should buy dispersion, not adjacency.

------------------------------------------------------------------------

## 2. Declared before scoring

**Budget.** `4/4/4`. Unremarkable. Not `4/6/4`.

**Symbols.** Width 1, then 2, then 3, binary
order. Fourteen strings. Four copies each.
Fifty-six states. Eight reserved.

``` text
0 1  00 01 10 11  000 … 111
s = 0 .. 13
```

**Interleave.**

``` text
copy_j(s) = (s + 16j) mod 64
j ∈ 0,1,2,3
```

`s ∈ 14,15` in each block of 16 is reserved:
`14,15,30,31,46,47,62,63`.

``` text
101  is s = 11
copies {11, 27, 43, 59}
```

Collision-free. Corpus-independent. Chosen
because the carrier is modular, not because a
residue rescued an F6 set.

History is not introduced. A later idea —
`H` permutes the same codebook — is not this
note.

------------------------------------------------------------------------

## 3. Measurement

Same 18 frozen F6 sets. Contiguous `4/4/4`
stays `8/18`, mean `13.39`, min `12`.

``` text
             contiguous    interleaved
4/4/4           8/18           9/18
mean            13.39          13.44
minimum            12             12
w1 full            16             17
w2 full            14             15
w3 full            13             12
```

Interleaving did not materially improve
coverage. One more complete set. The same
minimum. 3-bit full-set count moved the
wrong way.

This layout was not wasting most of the
redundancy we paid for. The remaining gap
looks like budget (and N = 18), not
contiguous clustering of the four copies.

Do not try another layout to chase 18/18.

------------------------------------------------------------------------

## 4. What this is not

- a chosen code;
- a budget selected for score;
- layout-chasing toward 18/18;
- history-dependent permutation;
- F7;
- an LM run;
- NCMP/4.0.

``` text
npm run test:v4-geom
```
