# NCMP-P7-E1

**Status:** Experimental Result #3 — frozen\
**Date:** August 2026\
**Parent:** NCMP/2.0\
**Depends on:** C6 (Result #1), D1 (Result #2)\
**Scope:** One-bit entity `E` ∈ {CUSTOMER, TRANSACTION} on the
same utterance as `D` and `N`. No session. No six-opcode alphabet.

This profile is closed. Under the published P7 decoders, a
sentence can deterministically say `GET CUSTOMER 42`. That is
three primitives, not NCMP/2.0 §21. The next primitive is
session: `NCMP-P7-S1.md`. Do not enlarge `D` to six opcodes
before `S` exists.

------------------------------------------------------------------------

## 1. Purpose

D1 composed discourse with the C6 carrier by **separating mutation
spaces**. This profile adds entity class the same way, without
bringing back NCMP/1.0 magic nouns.

`customer` and `transaction` MUST NOT be the decoder.

`E` is a **reference construction**: determiner + published
nominal class. Many lexical realizations of each class. The class
is a property of the construction, not a secret word for an enum.

``` text
                 U
          /      |      \
        δ_D     δ_E     δ_N
         |       |       |
        GET   CUSTOMER    42
```

------------------------------------------------------------------------

## 2. Alphabet

``` text
D ∈ {GET, ALLOW}                 # D1
E ∈ {CUSTOMER, TRANSACTION}      # this profile
N ∈ {0, 1, …, 63}                # C6
```

`δ_D` and `δ_N` are unchanged.

------------------------------------------------------------------------

## 3. Entity decoder δ_E

Not a model. Not the literals `customer` or `transaction`.

``` text
DET    = { that, this, the }
PARTY  = { one, party, person, holder }     → CUSTOMER
EVENT  = { move, act, step, action }        → TRANSACTION
```

A hit is an adjacent pair `DET PARTY` or `DET EVENT` after
canonicalization (same token rule as C6 poles).

These words are disjoint from C6 poles, C6 glaze, and D1 cues.

``` text
δ_E(U) =
    CUSTOMER     if ≥1 DET+PARTY and 0 DET+EVENT
    TRANSACTION  if ≥1 DET+EVENT and 0 DET+PARTY
    NONE         otherwise
```

------------------------------------------------------------------------

## 4. Locked constructions, free poles

N-search may still edit only C6 poles and glaze. It MUST NOT edit
D cues, D punctuation, or the `DET + class` pair that carries `E`.

The E pair may sit after the P clause (`for that party`, `on that
move`). Optional C6 glaze may follow it. Glaze strip must not
consume the E pair.

`N` still sums the whole sentence, including D cues and E words.
Changing `party` → `holder` or `move` → `action` would change `N`
and `E` together if we allowed it. We do not. E realizations vary
across **seeds**, not inside one N-search. Multiplicity of `E` is
the published `DET × class` set used when planting the seed.

------------------------------------------------------------------------

## 5. Invariants

For each published seed in `{GET, ALLOW} × {CUSTOMER, TRANSACTION}`:

1. every legal N-edit keeps `δ_D` and `δ_E` equal to the seed;
2. all 64 residues are reachable;
3. `GET` + `CUSTOMER` + `42` has ≥5 realizations;
4. `GET` + `TRANSACTION` + `42` and both ALLOW pairs also ≥5;
5. no utterance decodes as two E classes or two D classes;
6. `customer` / `transaction` never appear as the E signal.

------------------------------------------------------------------------

## 6. GET CUSTOMER 42

If Section 5 passes, this experiment **may** exhibit an utterance
`U` such that:

``` text
δ_D(U) = GET
δ_E(U) = CUSTOMER
δ_N(U) = 42
```

That is three composed primitives on one sentence. It is **not**
the NCMP/2.0 Section 21 demonstration: no session, no integrity,
no six-opcode alphabet, no claim that `D` is open discourse.

------------------------------------------------------------------------

## 7. What this does not claim

- state-bound anaphora (`that account` → CUSTOMER from `S`);
- full orthogonality of overlapping dimensions;
- human naturalness;
- NCMP/2.0 as a finished protocol.

``` text
npm run test:e1
```

Continue in `NCMP-P7-S1.md`. `S` decides whether `U` is NCMP at all.
`D`, `E`, and `N` decide what it says. Do not expand the opcode
alphabet until that distinction exists.
