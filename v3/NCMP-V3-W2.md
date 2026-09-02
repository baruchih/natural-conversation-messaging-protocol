# NCMP-V3-W2

**Status:** V3 Experimental Result #5 — MIXED, frozen\
**Date:** August 2026\
**Parent:** V3-L4 (Result #4, frozen). Connects to P7-W1
(Result #8, frozen). Does not amend W1 or invent L5.\
**Scope:** Surface distinguishability after the L4 closure.
Same dinner `P`. Same GET. Same W1 observers. Corpus first.
No detector-aware evolution. No new `f`. No fifth `HEAD`.

This profile is closed. Dynamic `L` did not solve W1’s
lexical detectability. A preference judge moved 16/16 →
12/16. That is MIXED, not YES. Do not design the next `f`
to beat Naive Bayes. What an evolution rule is for is
`NCMP-V3-Direction.md`.

------------------------------------------------------------------------

## 1. Question

L1–L4 closed the first adaptive-capacity hypothesis. Extra
payload bits are not an automatic consequence of `ΔL`.

W1 failed because a static grammar left a repeated lexical
signature (`for` / `that` / `anyone` / `seated` vs ordinary
glaze). That is a different possible use of dynamic `L`:

> Does deterministic session-specific language evolution
> reduce the surface distinguishability that caused the
> fixed-language protocol to fail W1?

Not secrecy. An observer who knows `L₀` and `evolve` can
compute `Lₙ`. The question is distributional camouflage
without the profile.

``` text
A  ordinary conversation
B  static P7 language          ← reproduce W1
C  evolved V3 language         ← L4 closure
```

``` text
A vs B   W1 baseline
A vs C   V3 question
```

------------------------------------------------------------------------

## 2. Corpus first

`C` is the L4 closure, not a covertness grammar.

``` text
L₃.CUSTOMER = { that party, that holder, that person, that one }
```

Those four phrases are already E2 `det_party`. This `f` does
not invent ordinary-looking replacements. It permutes one
obvious family. That is the honest test, including the
prediction that it may buy little.

32 + 32 exact-length GET pairs per contrast. Same `P`. Cheat
`δ` must score 1.0. Labels stripped.

Longitudinal slice: the same pairing at `L₀`, `L₁`, `L₂`,
`L₃`. Accuracy by language, not a detector-chasing curve.

Do not change `C` after seeing classifier output.

------------------------------------------------------------------------

## 3. Detectors (after the corpus)

Same as W1. No grammar list.

1. Length only. Control.
2. Naive Bayes unigrams, 4-fold.
3. LLM judge, forced choice, later. No NCMP / no `δ`.
4. Humans, later. Not run here.

A move from 1.00 toward chance is a finding even if it does
not reach 0.50. 1.00 remaining 1.00 is also a finding.

------------------------------------------------------------------------

## 4. Measurement

Corpus: 32 + 32 GET questions per contrast, same `P`, exact
token-count match (14.0 / 14.0). Cheat `δ` = 1.00. Length
only = 0.50.

``` text
           length   NB unigram   LLM judge     top protocol words
A vs B       0.50      1.00       16/16        for that anyone seated
A vs C       0.50      1.00       12/16        for that one person holder party

n   L                                      NB
0   { that party }                        1.00
1   { that party, that holder }           1.00
2   { that party, that holder, that person } 1.00
3   { that party, that holder, that person, that one } 1.00
```

``` text
                    static P7       evolved V3
NB unigram             1.00             1.00
LLM preference         16/16            12/16
length                 0.50             0.50
```

**MIXED.** Dynamic `L` did not solve W1’s main statistical
detectability problem. A unigram learner still separates
protocol from ordinary language perfectly, at every stage of
evolution.

Something moved. The grammar-blind LLM’s ability to pick the
ordinary sentence fell 100% → 75%. That is not covert. It is
not nothing.

The two detectors measure different properties.

``` text
lexical detectability      unchanged     Does this population
                                         have a learnable dialect?
preference camouflage      improved      Which sounds more like
                         somewhat        something someone would say?
```

This was almost the worst dynamic language for a unigram
test: every evolution keeps `for that …` and rotates the
head. Dynamic language alone does not imply reduced
detectability. Evolution must diversify the observable
distribution before lexical distinguishability can move.

Do not refit `C` to enlarge the 12/16 gap. Do not write an
`f` that beats Naive Bayes.

------------------------------------------------------------------------

## 5. What this does not claim

- cryptographic secrecy;
- that the wire is covert;
- that evolution should chase a detector;
- a new derivation rule;
- NCMP/3.0.

Continue in `NCMP-V3-Direction.md`.

``` text
npm run test:v3-w2
npm run test:v3-w2-lm
```
