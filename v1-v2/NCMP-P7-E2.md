# NCMP-P7-E2

**Status:** Experimental Result #6 — frozen\
**Date:** August 2026\
**Parent:** NCMP/2.0\
**Depends on:** C6, D1, E1 (frozen). Does not amend S1 or X1.\
**Scope:** Loosen `E` only. Same alphabet `{CUSTOMER, TRANSACTION}`.
No new opcodes. No handshake change. No LM decoder.

This profile is closed. It loosened one construction into a
published grammar. It did not make English open. Generation
into that grammar is `NCMP-P7-G1.md`. The LM does not decode.

------------------------------------------------------------------------

## 1. Question

E1 made deterministic `E` easy by locking one construction:

``` text
DET + {one, party, person, holder}  →  CUSTOMER
```

That left a fair objection: P7 might only be a controlled
language with reserved pairs.

This profile asks one question:

> Can one existing locked construction be loosened substantially
> while preserving deterministic decoding, C6 coverage, and
> conversational multiplicity?

`δ_E2` MUST remain a published matcher. It MUST NOT become an
LLM semantic classifier.

------------------------------------------------------------------------

## 2. What stays frozen

``` text
C6   δ_N, poles, glaze, modulus
D1   δ_D, cues, punctuation
E1   the original decoder and X1's published sentence
S1   handshake
X1   two-agent structure
```

E2 is a second decoder for `E`. S1 and X1 still call `δ_E` from
E1. A later composition can switch them. That is not this
experiment.

------------------------------------------------------------------------

## 3. Published grammar

Not open English. Several structurally distinct forms, each a
contiguous token template over a published lexicon.

CUSTOMER:

``` text
DET PARTY                         that party          (E1, kept)
DET person involved               the person involved
whoever held it                   whoever held it     (E1 → NONE)
DET one we discussed              the one we discussed
POSS account holder               their account holder (E1 → NONE)
DET account holder                the account holder   (E1 → NONE)
those folks                       those folks          (E1 → NONE)
anyone seated                     anyone seated        (E1 → NONE)
```

TRANSACTION, same structural types:

``` text
DET EVENT                         that move           (E1, kept)
DET action taken                  the action taken
whatever went through             whatever went through
DET step we took                  the step we took
POSS latest charge                their latest charge
those charges                     those charges
anything processed                anything processed
```

``` text
DET  = {that, this, the}
POSS = {their, our}
```

``` text
δ_E2(U) =
    CUSTOMER     if ≥1 CUSTOMER form and 0 TRANSACTION forms
    TRANSACTION  if ≥1 TRANSACTION form and 0 CUSTOMER forms
    NONE         otherwise
```

A customer-like sentence that is not in this list is `NONE`.
`whoever ate there` is not `whoever held it`. That is the
difference between a grammar and a classifier.

`customer` / `transaction` still MUST NOT be the signal.

------------------------------------------------------------------------

## 4. Locked constructions, free poles

N-search may still edit only C6 poles and glaze. It MUST NOT
edit D cues or any token that belongs to the matched E2 form.

`N` still sums the whole sentence. Changing `held` → `booked`
inside `whoever held it` would be a new construction, not an
N-edit. Multiplicity of E is the published grammar, used when
planting the seed.

------------------------------------------------------------------------

## 5. Pass and fail

PASSES if:

1. E1 pair `that party` still decodes as CUSTOMER;
2. at least four CUSTOMER forms are `NONE` under E1 and
   CUSTOMER under E2;
3. each published seed covers all 64 residues, ≥5 each;
4. `GET CUSTOMER 42` exists on an E1-invisible form;
5. D never flips; E2 never flips under N-search;
6. near-miss customer-like sentences are `NONE`;
7. fragments (`whoever`, `held it`, `those`) are `NONE`;
8. both classes in one `U` → `NONE`;
9. no model is consulted.

FAILS if loosening requires a classifier, if C6 coverage
breaks, or if E1-invisible forms cannot carry 42.

------------------------------------------------------------------------

## 6. What this may claim

If Section 5 passes:

> NCMP semantics do not require a single fixed lexical
> construction; a protocol class can have multiple structurally
> distinct natural-language realizations while remaining
> deterministically decodable.

That is still a published grammar. It is not open English and
not NCMP/2.0.

If Section 5 had failed, the boundary would have been:

> deterministic interpretation may require one controlled
> construction per class.

------------------------------------------------------------------------

## 7. What this does not claim

- S1/X1 now use E2;
- D or S are loosened;
- an LM may invent constructions and have them count;
- synonymy (`guest` ≈ `person`);
- NCMP/2.0 §21.

Continue in `NCMP-P7-G1.md`. An LM may propose utterances
inside this grammar. It does not decide whether they count.

``` text
npm run test:e2
```
