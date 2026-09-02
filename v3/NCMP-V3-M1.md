# NCMP-V3-M1

**Status:** V3 Experimental Result #16 — PASS, frozen\
**Date:** August 2026\
**Parent:** W4 (Result #15, frozen). K3 residue solve unchanged.\
**Scope:** LM proposes the next turn. Code searches a nearby
neighborhood for the required residue. No NCMP in the
proposer prompt. No dinner-seed fallback.

This profile is closed. Do not change `ADJUNCTS`,
`STARTERS`, `SWAPS`, normalize, or the ranking rule.
W5 measures this neighborhood. There is no M2 until W5
is measured.

------------------------------------------------------------------------

## 1. Question

> Can an LM-generated natural next turn be constrained
> into a valid K3 window by a small deterministic
> modulation of that sentence?

``` text
conversation
      ↓
LM: "What would I naturally say next?"
      ↓
natural U
      ↓
protocol state determines needed residue
      ↓
deterministic local search
      ↓
nearby U'
      ↓
rolling frame closes
```

The LM does not encode. K3 tells code the residue.

------------------------------------------------------------------------

## 2. Neighborhood

Published starters, synonym swaps of words already in `U`,
and optional adjuncts. Not restaurant poles. Not `A2_SEED`.

A mechanical normalize strips a leading `A:`, keeps the
last sentence, and replaces dashes. Jaccard is against the
normalized proposal.

------------------------------------------------------------------------

## 3. Measurement

Six frozen live proposals. Prompts contain no residue.

``` text
id  need  seedN  hit  win  depth  jac
p1   26     24   yes  42     2    0.67
p2   34      7   yes  42     1    0.82
p3   39     42   yes  42     1    0.90
p4   18     36   yes  42     1    0.89
p5    1      3   yes  42     2    0.78
p6   17      0   yes  42     1    0.73
```

``` text
raw proposals already correct:  0/6
successful modulation:          6/6
mean edit depth:               1.33
mean Jaccard:                  0.80
```

The modulation layer is doing actual work. `for now` and
`in a quiet way` are valuable failures: distortion is now
the research object, not a defect to hide.

``` text
cost(U → U') =
    lexical distance
  + semantic drift
  + naturalness loss
```

M1 measures the first component.

------------------------------------------------------------------------

## 4. Claim

> An LM-generated natural next turn can be deterministically
> modulated into a valid rolling-window target without the
> LM knowing the protocol value or acting as the decoder.

No more than that. This is the architecture W1–W4 did not
test: natural conversation first, protocol modulation
second, deterministic decoder last.

Continue in `NCMP-V3-W5.md`.

------------------------------------------------------------------------

## 5. What this does not claim

- camouflage;
- that adjuncts are ordinary English;
- HK2 harvest inside this window;
- NCMP/3.0.

``` text
npm run test:v3-m1
npm run test:v3-m1-lm
```
