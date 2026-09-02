# NCMP-V3-L2

**Status:** V3 Experimental Result #2 — frozen\
**Date:** August 2026\
**Parent:** V3-L1 (Result #1, frozen)\
**Scope:** Capacity after one evolution. Language held fixed.
No second evolve. No LM. No new class. Same C6 carrier.

This profile is closed. `|F|` grew; `C64` did not. Whether
the extra raw sums moved the capacity frontier is
`NCMP-V3-L3.md`. Do not raise the published modulus here.

------------------------------------------------------------------------

## 1. Question

L1 showed that an accepted `U` can change `L`. It did not
claim that bought capacity.

> Did one deterministic language evolution increase the
> effective encoding capacity of the next turn?

``` text
conversation
     ↓
language evolves          ← L1
     ↓
degrees of freedom increase
     ↓
future carrier capacity increases
```

L2 tests the last two arrows. `C` is distinguishable `δ_N`
states, not `|F|`.

------------------------------------------------------------------------

## 2. Setup

Languages are the L1 pair, frozen. They are not evolved here.

``` text
L₀.CUSTOMER = { that party }
L₁.CUSTOMER = { that party, that holder }
P           = The restaurant was good, but service was slow.
```

`F₀` is the C6-HY GET family of the `that party` seed, kept
only if `δ_E(U, L₀) = CUSTOMER`.

`F₁` is that family plus the C6-HY GET family of the
`that holder` seed, kept if `δ_E(U, L₁) = CUSTOMER`.

``` text
C(L, P) = |{ δ_N(U) : U ∈ F(L, P) }|     (mod 64)
```

Unique letter-sums are reported as extra distinguishability.
They are not a new carrier.

------------------------------------------------------------------------

## 3. Three possible results

``` text
1  |F₁| > |F₀|  and  C₁ > C₀     evolution bought capacity
2  |F₁| > |F₀|  and  C₁ = C₀     more sentences, same 6-bit C
3  neither grew materially       protocolic, economically idle
```

Do not raise the modulus to force result 1.

------------------------------------------------------------------------

## 4. Measurement

``` text
L₀  |F| 3024   C64 64/64   ≥5 64   unique sums 357
L₁  |F| 6048   C64 64/64   ≥5 64   unique sums 384
```

Result 2. Realization space doubled. Unique letter-sums rose
27. The published 6-bit carrier was already saturated under
`L₀`, so `C` could not grow.

L1’s evolution is protocolically real. Under this `P` and
this carrier it did not buy another decoder state.

------------------------------------------------------------------------

## 5. What this does not claim

- recursive evolution;
- adaptive session capacity as a finished mechanism;
- NCMP/3.0.

Continue in `NCMP-V3-L3.md`.

``` text
npm run test:v3-l2
```
