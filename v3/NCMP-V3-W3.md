# NCMP-V3-W3

**Status:** V3 Experimental Result #8 — NO, frozen\
**Date:** August 2026\
**Parent:** V3-H2 (Result #7, frozen). Connects to W1 and W2.\
**Scope:** Surface distinguishability of the frozen H2
symbol table. Same observers. Corpus first. Do not change
`g`, `promote`, eligibility, the reservoir, or `L₁₀`.

This profile is closed. Dynamic terminals alone do not
reduce the W1/W2 signature while the serialization
construction stays fixed. Do not hunt better harvested
words. The next design problem is construction harvest.
It is not started.

------------------------------------------------------------------------

## 1. Question

> Does harvesting session terminals from the conversation
> itself reduce the surface signature measured in W1/W2?

Not secrecy. Not a reason to retune H2.

``` text
A  ordinary matched conversation
B  static P7                 W1 baseline
C  L4 evolved language       W2 baseline
D  H2 harvested symbol table new question
```

------------------------------------------------------------------------

## 2. Corpus first

`D` uses the frozen H2 `L` snapshots and the H1 E slot
(`find` + terminal). Length-matched GET pairs. 32 + 32.

Longitudinal `D` at `L₀, L₂, L₄, L₆, L₈, L₁₀`. Not a
detector-chasing curve.

Do not change `D` after seeing scores. `D` seeds are the
same dinner stem as A, with the H2 E slot after `find`.
H2 itself is untouched.

------------------------------------------------------------------------

## 3. Measurement

``` text
           length   NB unigram   LLM judge
A vs B       0.50      1.00       16/16
A vs C       0.50      1.00       12/16
A vs D       0.50      1.00       13/16

n    |L|   NB     LLM (8 pairs)
0      1   1.00    8/8
2      3   1.00    7/8
4      5   1.00    8/8
6      6   1.00    8/8
8      8   1.00    7/8
10    10   1.00    7/8
```

B reproduces W1. C reproduces W2.

D does not move the unigram. 1.00 at every snapshot. The
preference judge at `L₁₀` is 13/16, not better than C’s
12/16, and not chance.

``` text
                    NB     LLM
static P7          1.00    16/16
L4 constructions   1.00    12/16
H2 terminals       1.00    13/16
```

Harvested terminals did not reduce the lexical signature.
Preference camouflage was not better than L4.

``` text
dynamic terminal
      ↓
Did we find <E> …
^^^^^^^^^^^
static construction
```

The fingerprint is not primarily `CUSTOMER = that party`.
It is D + grammatical frame + E-slot + carrier structure.
The construction is the dialect.

> Session-local arbitrary terminal harvesting is
> protocolically valid, but dynamic terminals alone do not
> reduce surface distinguishability while the surrounding
> serialization construction remains fixed.

That closes the terminal hypothesis. Do not strengthen it.

------------------------------------------------------------------------

## 4. What this does not claim

- that NCMP is covert;
- a better `g` or prettier tokens;
- that constructions have been harvested;
- NCMP/3.0.

``` text
npm run test:v3-w3
npm run test:v3-w3-lm
```
