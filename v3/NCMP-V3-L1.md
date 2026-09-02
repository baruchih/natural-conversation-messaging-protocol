# NCMP-V3-L1

**Status:** V3 Experimental Result #1 — frozen\
**Date:** August 2026\
**Parent:** V3 thesis. Does not amend P7 or NCMP/2.0.\
**Scope:** One class. One deterministic evolution. Two
participants. No LM. No capacity claim. No recursive growth.

This profile is closed. Protocol language can itself be
deterministic session state. Whether that bought capacity is
`NCMP-V3-L2.md`.

------------------------------------------------------------------------

## 1. Question

> Can one accepted natural-language frame deterministically
> expand one protocol class such that two independent
> participants converge on the same new language, and a
> subsequent utterance becomes valid only because that
> evolution occurred?

------------------------------------------------------------------------

## 2. Core

Convergence is protocol correctness.

``` text
Sₙ = { mode, language: Lₙ, language_digest: H(Lₙ), … }

δ(U, Sₙ)           →  frame | error
evolve(Lₙ, U, Sₙ)  →  Lₙ₊₁
```

Every `evolve` recomputes `H(canonical(L))`. Silent fork is
failure. The digest does not cross the wire in L1.

``` text
evolve_A(Lₙ, U, Sₙ)  =  evolve_B(Lₙ, U, Sₙ)
```

No interpretation. No similarity. No model deciding what B
meant. Same deterministic transition, or V3 has failed.

`U` is not `frame + explicit lexicon_delta`. That would be a
codebook on the wire. The same linguistic choices that made
`U` valid imply what becomes newly valid afterward. Evolution
is a protocol side effect, not another field.

------------------------------------------------------------------------

## 3. Bootstrap

One class. One construction.

``` text
L₀.CUSTOMER = { "that party" }
```

`δ_E(U, L₀)` is CUSTOMER only if that exact construction
appears. Nothing else.

`Y` MUST NOT already appear in `U` as a complete construction.
Otherwise L1 can pass by transmitting a dictionary.

``` text
Transmission     U contains Y          → add Y     not interesting
Derivation       U contains X          → Y = f(X,Lₙ)   this profile
Interpretation   a model infers Y      → add Y     invalid
```

L1 implements one toy derivation, not a recommended grammar.

``` text
DET  = { that, this, the }
HEAD = { party, person, holder, one }

L₀.CUSTOMER = { "that party" }
```

If `U` is CUSTOMER under `L` and also contains an adjacent
`DET HEAD` pair that is not itself in `L.CUSTOMER`, then:

``` text
Y = DET of the matched L construction
  + HEAD of the first extra DET+HEAD pair
```

If `Y` occurs verbatim in `U`, that is transmission: `L` does
not grow. If `Y` is new and absent from `U`, add it.

Example: `… that party … the holder …` derives `that holder`.
`that holder` never crossed the wire as a lexicon entry.

``` text
npm run test:v3-l1
```

------------------------------------------------------------------------

## 4. Killer test

``` text
δ(U₂, S₀)  →  NONE
δ(U₂, S₁)  →  CUSTOMER
```

`U₂` uses `Y`. It is not CUSTOMER under `L₀`. It is CUSTOMER
only after `U₁` evolved the language. Traffic changed the
language.

That is the V3 equivalent of P7’s first `GET CUSTOMER 42`.

------------------------------------------------------------------------

## 5. Negative control

Give A and B different priors:

``` text
A: L₀
B: L₀′
```

Feed both the same `U`. They MUST either detect the mismatch
before evolving, or derive different language digests and
refuse the next turn. Silent fork is failure.

``` text
language_digest = H(canonical(Lₙ))
H(Lₙᴬ) == H(Lₙᴮ)
```

The digest is an internal definition of convergence. Whether
it ever appears on the wire is a later information-budget
question. It is not in L1.

------------------------------------------------------------------------

## 6. What to measure later, not now

If Section 4 passes, then measure:

``` text
|F₀(P)|   |F₁(P)|
C(L₀, P)  C(L₁, P)
```

Language growth without capacity growth is a finding. Both
growing is the first evidence for adaptive capacity. L1 does
not claim either.

Recursive evolution, multiple classes, and a capacity ceiling
are later profiles. `evolve` should eventually stop when
marginal capacity is not worth grammar, collisions,
generation cost, surface signature, and sync risk. Not here.

------------------------------------------------------------------------

## 7. What this does not claim

- NCMP/3.0;
- that this toy `f` is the V3 evolution rule;
- more bits on turn 2;
- an LM lexicon;
- covertness;
- that P7’s `L` is obsolete.

P7 remains the frozen proof that a fixed language can be a
deterministic wire. L1 showed the language can grow by use.
Capacity is `NCMP-V3-L2.md`.
