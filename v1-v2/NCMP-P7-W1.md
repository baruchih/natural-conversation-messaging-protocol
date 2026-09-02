# NCMP-P7-W1

**Status:** Experimental Result #8 — frozen\
**Date:** August 2026\
**Parent:** NCMP/2.0\
**Depends on:** D1, E2, C6 (frozen). Does not amend S1, X1, or G1.\
**Scope:** Surface distinguishability. Not secrecy of `N`.
The observer is not given the P7 grammar.

This profile is closed. It is a negative result. Do not start
an optimization loop to hide the grammar. Integrity and replay,
not covertness, are next: `NCMP-P7-I1.md`.

------------------------------------------------------------------------

## 1. Question

G1 showed that ordinary instruction does not land in E2, and
that a listed grammar can be spoken. The original intuition
was different:

> the wire looks like ordinary conversation.

This profile asks that, not “can someone who knows `δ_N` read
42?” That is trivial.

> Given only surface text, and without the P7 grammar, can an
> observer distinguish P7-valid utterances from ordinary
> semantically equivalent utterances?

The metric is `P(NCMP | surface text)` versus chance.

------------------------------------------------------------------------

## 2. Corpus first

No detector is designed before the items exist.

``` text
A  ordinary GET questions about P
B  P7-valid GET realizations of the same P
```

`P` is the dinner proposition. Both classes are questions
with `δ_D = GET`, so the test is not “question vs statement.”
Class A has `δ_E2 = NONE`. Class B has a published E2
construction. Lengths are matched.

32 + 32 items. 32 forced-choice pairs. Labels stripped for
judges. A seeded shuffle produces the blind list.

A cheating oracle that runs `δ` must score 1.0. That checks
the corpus, not distinguishability.

------------------------------------------------------------------------

## 3. Detectors (after the corpus)

None of these receive the E2 grammar as a feature list.

1. **Length only.** Control. Should be near chance if matching
   worked.
2. **Naive Bayes unigrams.** Trained on labels, 4-fold. May
   discover a lexical signature. That is a finding, not a
   designed rule.
3. **LLM judge.** Forced choice: which sentence is more like
   ordinary conversation? No NCMP, no `δ`, no constructions.
4. **Humans.** Same forced-choice protocol, later. Not run
   here.

------------------------------------------------------------------------

## 4. Live measurements

Corpus: 32 + 32 GET questions, same `P`, exact token-count
match (mean 14.0 / 14.0). Cheat `δ` = 1.00. Length-only
control = 0.50.

Naive Bayes unigrams, 4-fold, no grammar list: **1.00**.
Words that tilt toward P7: `for`, `that`, `anyone`, `seated`.
Words that tilt toward ordinary: glaze (`once`, `after`,
`when`, `sat`).

Blinded LLM judge (gpt-4o-mini, 16 forced-choice pairs, no
NCMP / no `δ` / no constructions): **16/16**.

The judge consistently preferred time glaze (`once we
arrived`, `when we went`) over an E2 tail (`for those folks`,
`for anyone seated`, `for that party`).

Humans have not been run.

------------------------------------------------------------------------

## 5. Pass and fail

The **corpus** PASSES if it is balanced, length-matched, A is
not P7-valid, B is P7-valid, and the blind list has no labels.

A **surface result** is reported, not forced. This run is
well above chance on both the unigram classifier and the
blinded judge.

> Length-matched ordinary GET questions about the same dinner
> are distinguishable from P7-valid realizations of that
> dinner without the P7 grammar. The wire has a visible
> signature.

That is not secrecy of 42. It is the original “ordinary
conversation” claim, tested and not supported on this corpus.

FAILS if the primary judge is given the grammar, or if the
task is decoding 42.

------------------------------------------------------------------------

## 6. What this does not claim

- cryptographic secrecy;
- that humans have been tested;
- open English;
- NCMP/2.0 §21.

W1 stays a failure. Continue in `NCMP-P7-I1.md`.

``` text
npm run test:w1
npm run test:w1-lm
```
