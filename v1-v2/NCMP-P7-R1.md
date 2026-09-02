# NCMP-P7-R1

**Status:** Experimental Result #10 — frozen — NO\
**Date:** August 2026\
**Parent:** NCMP/2.0\
**Depends on:** C6, D1, E1, I1 (frozen). Does not amend W1.\
**Scope:** Rewriting robustness. An intermediary who does not
know NCMP paraphrases a valid `U`. `δ` judges the result.

This profile is closed. Do not try to make the wire
paraphrase-robust. Opcode expansion, if any, is
`NCMP-P7-D6.md`. It does not reopen R1.

------------------------------------------------------------------------

## 1. Question

I1 showed that the sentence *is* the wire format. This profile
asks whether semantic preservation is enough:

> If an ordinary intermediary paraphrases a valid utterance
> without changing its meaning, does the protocol frame
> survive?

``` text
U  = valid GET CUSTOMER …
        │
        ▼
“Paraphrase this naturally without changing its meaning.”
        │  no NCMP
        ▼
       U′
        │
   ┌────┼────┐
   ↓    ↓    ↓
  δ_D  δ_E  δ_N
```

The intermediary is not given constructions, poles, residues,
or session state.

------------------------------------------------------------------------

## 2. Source

The published I1 first frame:

``` text
Did we find the restaurant was good yet service was sluggish
for that party this evening?
```

Identity must preserve `D`, `E`, and `N`. That is the control.

------------------------------------------------------------------------

## 3. Live run (gpt-4o-mini, 8 independent paraphrases)

``` text
D  7/8     questions mostly remain questions
E  1/8     “that party” → “that group” except once
N  0/8
full frame 0/8
I1 payload ≠ 42 on 8/8
```

Typical rewrite:

``` text
Did we determine that the restaurant was good, although
the service was slow for that group tonight?
```

`δ_D` still GET. `δ_E` is NONE. `δ_N` is not the source.
I1 does not recover 42.

A one-word pole swap in the offline control keeps D and E
and still breaks N. Letter-sum is that brittle.

------------------------------------------------------------------------

## 4. What this shows

That is what happened.

> NCMP currently requires a text-preserving transport path.
> Semantic preservation by an intermediary is insufficient
> for protocol preservation.

The natural language is the wire format, not merely the
semantic content. TCP does not survive rewritten bytes
either. That is a boundary, not a defect to patch tonight.

------------------------------------------------------------------------

## 5. Pass and fail

The **pipeline** PASSES if identity keeps the frame and a
published ordinary paraphrase does not.

The **live** run reports rates. A zero full-frame survival is
a valid finding.

FAILS if the intermediary is given the grammar, or if `δ` is
not the judge.

------------------------------------------------------------------------

## 6. What this does not claim

- a transport recommendation;
- that every paraphrase fails;
- covertness;
- NCMP/2.0 §21.

The wire is a serialization. Continue in `NCMP-P7-D6.md`.

``` text
npm run test:r1
npm run test:r1-lm
```
