# NCMP-V4-F6

**Status:** V4 Experimental Result #6 — PARTIAL, frozen\
**Date:** August 2026\
**Parent:** F5 (Result #5, PARTIAL, frozen).\
**Scope:** Independent opportunity reliability.
Not a larger payload. `R`, `π`, `accept`, and
`k = 50` are not changed.

This profile is closed. Across 18 independently
generated natural candidate sets, the frozen
coding rule found the predeclared required bin
in every case for rates 1, 2, and 3; every
candidate set also contained every bin of its
assigned rate.

`N = 6` per rate is tiny. `R` is not calibrated.
There is no F7 here.

------------------------------------------------------------------------

## 1. Question

> How often does a fresh natural candidate set fail
> to cover the required bin?

F5 could not estimate that. It reused one
50-candidate set across three payload-derived
bins.

``` text
each context
  one required symbol   declared before generation
  one fresh k = 50 set
  one HIT / NO_CANDIDATE
```

No reuse of the candidate set for other bins.
No 16-bit, 32-bit, or UUID frame.

------------------------------------------------------------------------

## 2. Frozen rule

``` text
R, π, accept, k = 50
N = 6 per rate
```

`R` stays `1 + C6(last) mod 3`. This experiment
does not recalibrate it. Coverage of all `2^r`
bins is scored offline on the same set without
changing the requested symbol.

------------------------------------------------------------------------

## 3. Declared before generation

Eighteen new contexts. Six lasts per rate. Not
F5’s lasts.

``` text
r=1  need ∈ {0,1}
r=2  need ∈ {00,01,10,11}
r=3  need ∈ {000,001,010,011,100,101}
```

------------------------------------------------------------------------

## 4. Measurement

One run. `gpt-4o-mini`. Do not regenerate. Eighteen
fresh contexts, eighteen fresh generations,
eighteen predeclared symbols.

``` text
r  opportunities  hit  miss
1  6              6    0
2  6              6    0
3  6              6    0
```

``` text
NO_CANDIDATE      0/18
examined / hit    3.50
```

First hits were usually early. The slowest were
candidate 11 (`r = 2`) and candidate 10 (`r = 3`).
None approached 50.

``` text
r  covered / bins (mean)
1  2.00 / 2
2  4.00 / 4
3  8.00 / 8
```

Every generated set contained every bin of its
rate. On this battery the `k = 50` search is not
merely lucky on the requested symbol. The sets
were broad enough under `C6 mod 2^r` to cover
the entire code alphabet for `r ≤ 3`.

That is coverage on `N = 6`, not a proof that
`r = 3` is calibrated. `R` is still a synchronized
mechanical selector. It has no relationship to
predicted linguistic opportunity.

------------------------------------------------------------------------

## 5. Verdict

PARTIAL.

Materially stronger than F5: independent
generations, not six sets rescored. Still too
small to estimate a long-frame miss rate, and
`R` remains uncalibrated.

Do not run `N = 100` next. The next question is
whether V4 should have a history-selected rate
at all. `NCMP-V4-Rate.md`

------------------------------------------------------------------------

## 6. What this does not claim

- a change to `R`;
- that `R(H) ∈ {1,2,3}` is calibrated to
  conversational opportunity;
- a long-frame success probability;
- a UUID;
- F5 regenerated;
- NCMP/4.0.

``` text
npm run test:v4-f6
```
