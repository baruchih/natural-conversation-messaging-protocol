# NCMP-P7-D1

**Status:** Experimental Result #2 — frozen\
**Date:** August 2026\
**Parent:** NCMP/2.0\
**Depends on:** NCMP-P7-C6 (Experimental Result #1, frozen)\
**Scope:** One-bit discourse `D` ∈ {GET, ALLOW} composed with C6 `N`
on the same utterance. No entity. No session.

This profile is closed. It proved **composition with separated
mutation spaces**, not free orthogonality of arbitrary linguistic
dimensions. Entity class is the next primitive: `NCMP-P7-E1.md`.

------------------------------------------------------------------------

## 1. Purpose

C6 showed that a fixed proposition can carry six deterministic bits
via letter-sum modulation. This profile asks the next question:

> Can a second, independently computed decoder share the same
> sentence without the two dimensions destroying each other?

Not `GET CUSTOMER 42`. Only:

``` text
D(U) = GET | ALLOW
N(U) = 0..63
P(U) preserved
```

If both decoders stay deterministic and edits that hit `N` never
flip `D` (and reserved `D` cues never become the `N` channel), then
composition has started. That is the first step from a carrier to
protocol semantics.

------------------------------------------------------------------------

## 2. Alphabet

``` text
D ∈ {GET, ALLOW}     # one bit
N ∈ {0, 1, …, 63}    # C6, unchanged
```

`δ_N` is exactly NCMP-P7-C6. This document does not redefine it.

------------------------------------------------------------------------

## 3. Discourse decoder δ_D

`δ_D` is a total function of `U`. It is not a model.

Reserved cue lexicons — these words are **not** in the C6 pole or
glaze lists and MUST NOT be edited by the N-search:

``` text
GET_CUES    = { did, whether, what }
ALLOW_CUES  = { confirm, approved, authorized, granted }
```

Terminal punctuation is part of `D`, not of `N` (C6 ignores it).

``` text
δ_D(U) =
    GET    if U has ≥1 GET_CUE, no ALLOW_CUE, and ends with ?
    ALLOW  if U has ≥1 ALLOW_CUE, no GET_CUE, and ends with . or !
    NONE   otherwise
```

Conflict (both cue sets present) is `NONE`. Missing cues is `NONE`.
A valid protocol utterance for this experiment MUST have
`δ_D ∈ {GET, ALLOW}`.

------------------------------------------------------------------------

## 4. Locked stem, free poles

The N-editor from C6-HY may substitute C6 poles and glaze only. It
MUST leave every GET/ALLOW cue token in place and MUST restore the
seed's terminal `?` or `.`/`!`.

``` text
                    U
               ┌────┴────┐
               ↓         ↓
            δ_D(U)     δ_N(U)
               ↓         ↓
          GET|ALLOW     0..63
```

`D` lives in reserved cues + terminal punct. `N` lives in letter
values of the whole sentence, **including the letters in the D
cue**. A GET `did` and an ALLOW `confirm` shift the starting sum.
N-search compensates on poles and glaze. That is constraint
composition, not slot concatenation (`[D word][N rest]`).

They share `U` but not the same **editable** set. Non-interference
is guaranteed structurally:

``` text
D-owned:   did / whether / what / confirm / … / ? / .
N-editable: C6 poles / glaze
```

Call this **composition**. Do not call it full orthogonality.
We have not shown that two freely overlapping linguistic
dimensions can coexist. The next profile (`E`) must pass the same
honesty test: class is a property of a reference construction, not
a secret synonym for a machine enum.

------------------------------------------------------------------------

## 5. Pass and fail

PASSES if, for published GET and ALLOW seeds that already satisfy
C6 poles and `P`:

1. every legal N-edit keeps `δ_D` equal to the seed's `D`;
2. both families cover all 64 residues;
3. `GET` + `N=42` and `ALLOW` + `N=42` each have ≥5 realizations;
4. no utterance is classified as both GET and ALLOW;
5. `δ_N` on those utterances is still C6 (letters only).

FAILS if hitting a residue flips `D`, if reserved cues are used as
the N codebook, or if only one discourse class can reach 42.

------------------------------------------------------------------------

## 6. What this does not claim

- full orthogonality of unseparated linguistic dimensions;
- entity (`E` / CUSTOMER);
- the six-opcode alphabet;
- session or integrity;
- `GET CUSTOMER 42`;
- open-English `D`;
- human naturalness.

NCMP/2.0 remains frozen. Continue in `NCMP-P7-E1.md`.

``` text
npm run test:d1
```
