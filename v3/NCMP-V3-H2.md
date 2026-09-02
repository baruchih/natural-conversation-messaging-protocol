# NCMP-V3-H2

**Status:** V3 Experimental Result #7 — frozen\
**Date:** August 2026\
**Parent:** V3-H1 (Result #6, frozen)\
**Scope:** Replace H1’s published index with a state-derived
`g`. Ten accepted turns. Same `promote`. No camouflage.
No capacity. Payload `N` is not the index.

This profile is closed. Do not change `g`, `promote`,
eligibility, the ten-turn reservoir, or `L₁₀` to chase a
detector. Surface measurement of this frozen table is
`NCMP-V3-W3.md`.

------------------------------------------------------------------------

## 1. Question

> Can `g(frame, Sₙ, U)` deterministically select eligible
> arbitrary terminals across multiple turns, with both
> parties converging, without using payload `N` and without
> the experimenter choosing the position?

------------------------------------------------------------------------

## 2. Setup

Ten published GET+CUSTOMER utterances. E stays `that party`.
The conversation supplies tokens. `g` chooses among them.

``` text
gSeed = H(Lₙ) || transcript_digest || canonicalize(U)
M     = uint32(sha256(gSeed)) mod |tokens(U)|    (1-based)
```

`N` is not in the seed. `promote` is H1’s.

------------------------------------------------------------------------

## 3. Measurement

``` text
n  pos  token      kind         N
0  11   night      harvested    4
1   9   during     harvested   36
2   7   seated     harvested   10
3   8   weather    harvested   58
4   5   party      none        63
5  11   wine       harvested    5
6  11   traffic    harvested   46
7  11   town       harvested   25
8  10   after      harvested   29
9   7   cash       harvested    6

L₁₀ = { after, cash, during, night, seated, that party,
        town, traffic, weather, wine }
H(Lᴬ) == H(Lᴮ)
```

Nine harvests. The miss is `party`, already in `L`.
Positions are not H1’s constant 7. `N` is not the index
(`pos` and `N` do not match).

The experimenter wrote the ten sentences. `g` chose the
tokens. That is the split H1 could not make.

> Shared protocol state can deterministically select
> arbitrary conversational tokens for session-local
> assignment across multiple turns, while independent
> participants remain converged and application payload
> does not control the selection.

No more than that.

Continue in `NCMP-V3-W3.md`.

------------------------------------------------------------------------

## 4. What this does not claim

- covertness;
- capacity;
- that every turn must harvest;
- NCMP/3.0.

``` text
npm run test:v3-h2
```
