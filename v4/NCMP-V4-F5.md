# NCMP-V4-F5

**Status:** V4 Experimental Result #5 — PARTIAL, frozen\
**Date:** August 2026\
**Parent:** F4 (Result #4, PASS, frozen).\
**Scope:** Reliability of the frozen coding rule.
Not a larger payload. Not a UUID. `R`, `π`,
`accept`, and `k = 50` are not changed.

This profile is closed. Across the declared F5
battery, the frozen coding rule found an
acceptable unchanged natural realization for
every tested 1-, 2-, and 3-bit bin opportunity,
and all six new 8-bit frames completed
successfully.

That is exactly measured. It is not a long-frame
success probability.

------------------------------------------------------------------------

## 1. Question

> How often does a natural conversational
> opportunity contain an acceptable realization at
> the history-derived rate?

F4 answered whether the architecture can work.
This asked whether it is viable over many turns.

``` text
If each turn succeeds with probability p,
a 50-turn frame succeeds with roughly p^50.
```

An 8-bit success at `k = 50` does not establish
that. This battery does not estimate `p`.

------------------------------------------------------------------------

## 2. Frozen rule

``` text
R, π, accept, k = 50
```

Do not enlarge `k`. Do not mutate. Do not change
`r`. Do not regenerate after a miss.
`NO_CANDIDATE` remains a failure.

Payloads stay 8 bits. Not `10110110`. Not 128
bits.

``` text
11001010
00110101
11100011
```

------------------------------------------------------------------------

## 3. Declared before generation

Six new contexts. Two lasts per rate. Not the F4
dinner script.

``` text
id  r  last
t1  1  We should pack lighter next time we go west.
h1  1  The hiking trail was quieter than I expected yesterday.
w1  2  The wind picked up right after we left the station.
s1  2  Did the tests pass once you restarted the runner?
w2  3  I think the train was late because of the weather.
s2  3  That build failed again after the last merge landed.
```

Each context × each payload is one opportunity
(18). The same 50-candidate set is scored against
all three payloads. That is three bins, one
generation.

Three new scripts (weather, travel, software),
six intents each, two payloads: six 8-bit frames
for bits carried before first failure.

------------------------------------------------------------------------

## 4. Measurement

One run. `gpt-4o-mini`. Do not regenerate. Do not
enlarge `k`. Six generations, each scored on three
payloads. That is 18 opportunities, not 18
independent samples.

``` text
r  attempts  successes
1  6         6
2  6         6
3  6         6
```

``` text
NO_CANDIDATE      0/18
examined / hit    3.33
```

Hits were often early. A few `r = 2` and `r = 3`
bins were reached on the 7th or 8th legal
candidate. None came close to exhausting 50.

``` text
script    payload    result     bits
weather   11001010   ARGUMENT   8
weather   00110101   ARGUMENT   8
travel    11001010   ARGUMENT   8
travel    00110101   ARGUMENT   8
software  11001010   ARGUMENT   8
software  00110101   ARGUMENT   8
```

No frame hit `NO_CANDIDATE`. Bits carried before
first failure, on this battery, is 8 in every
frame. That is not a long-frame rate.

`18/18` must not be turned into an empirical
per-turn `p` and then into `p^50`. Six 8-bit
frames only say that success through this short
battery looked good.

------------------------------------------------------------------------

## 5. Verdict

PARTIAL.

The architecture can find lower-rate bins in
natural 50-candidate sets. After M2/M3, exact
6-bit targeting covered about half of 64
residues. Here `r = 3` asks for one of eight
bins, and every tested required bin was present.

Not proven generally. Demonstrated beyond the
single F4 dinner run.

The remaining question is not “can natural
conversation carry an argument?” F4 answered
yes. It is becoming: can the shared rate rule
predict a conservative coding rate reliably
enough for long framed conversations?

Do not send 16, 32, or 128 bits next. That would
be endurance, not this measurement.

------------------------------------------------------------------------

## 6. What this does not claim

- an independent per-turn success probability;
- that a 50-turn frame is safe;
- a UUID;
- a change to `R`, `π`, `accept`, or `k`;
- that `R(H) ∈ {1,2,3}` is calibrated to
  conversational opportunity;
- F4 regenerated;
- NCMP/4.0.

``` text
npm run test:v4-f5
```
