# NCMP-V3-L3

**Status:** V3 Experimental Result #3 — frozen\
**Date:** August 2026\
**Parent:** V3-L2 (Result #2, frozen)\
**Scope:** Capacity frontier of the same `L₀`/`L₁` and `P`.
No new evolve. No new class. Letter-sum unchanged. `M` is a
measurement, not a published carrier change.

This profile is closed. Language evolution increased degrees
of freedom and unique sums; `C*` stayed 256. Accumulated
growth through the same `f` is Result #4 (`NCMP-V3-L4.md`).
Do not raise the published modulus here.

------------------------------------------------------------------------

## 1. Question

L2 showed unique sums 357 → 384 while `C64` stayed 64/64.
Those extra sums are latent. They are not automatically more
protocol bits.

> Did deterministic language evolution increase the maximum
> carrier width for which the full decoder state space remains
> reachable?

``` text
C*(L, P) = max M in {64, 128, 256, 512, 1024}
           such that { letterSum(U) mod M : U ∈ F(L, P) }
           covers all M states
```

Distribution matters. 384 unique sums can still fail `mod 128`.

------------------------------------------------------------------------

## 2. Setup

Exact L2 families. Languages held fixed.

``` text
          L₀          L₁
C6
C7   (M=128)
C8   (M=256)
C9   (M=512)
C10  (M=1024)
```

PASS means hit = `M`. This does not adopt a wider `δ_N` as
the protocol. P7 still forbids raising the published modulus
to fake a win.

------------------------------------------------------------------------

## 3. Measurement

``` text
             L₀        L₁
|F|        3,024     6,048
unique       357       384
C6          PASS      PASS
C7          PASS      PASS
C8          PASS      PASS
C9          FAIL      FAIL
C*           256       256

C6     64/64         64/64
C7    128/128       128/128
C8    256/256       256/256
C9    357/512       384/512
C10   357/1024      384/1024
```

The frontier did not move.

`L₀` already covered every residue through `M = 256`. The
27 new unique sums sit between 256 and 512. `L₁` still has
only 384 distinct letter-sums, so `M = 512` is unreachable
by the pigeonhole principle. Evolution did not cross a
capacity boundary.

L2’s `C64` saturation was therefore not a 6-bit ceiling. It
was the published decoder sitting below a frontier that was
already at 8 reliable bits for this `P`.

------------------------------------------------------------------------

## 4. What this does not claim

- that the session should now use 7 bits;
- automatic `C6 → C7` on lexicon growth;
- NCMP/3.0.

An automatic rule `if |L| grew, widen the carrier` is
wrong. So is `if unique sums grew, widen the carrier`.
`L₁` has 384 distinct letter-sums; 384 < 512, so `C9` is
unreachable for this exact `F` no matter the residue
distribution. The only defensible widen condition is actual
coverage under the candidate `M`.

Continue in `NCMP-V3-L4.md`.

``` text
npm run test:v3-l3
```
