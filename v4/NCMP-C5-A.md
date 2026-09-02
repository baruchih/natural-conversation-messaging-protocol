# NCMP-C5-A

**Status:** Donation is not yet reliable on ordinary short handshakes. Not a v0.1 change.  
**Date:** September 2026  
**Parent:** [NCMP-C5-G.md](NCMP-C5-G.md)  
**Name:** Availability of donated pairs  
**Code:** `c5a.ts` · `npm run test:v4-c5a`

C5-P / C5-G established the candidate: bootstrap hint for handshake, donated ordered pairs for frames, session residuals as the second factor. This note asks whether that candidate is available on ordinary handshake texts.

Same C5-P rule. `process` is unchanged. Catalog, STOP, and slots were not retuned after the score. No C6 / C7 architecture.

------------------------------------------------------------------------

## 1. Question

> Across ordinary handshakes, how often can both sides donate a reusable ordered pair?

Collision is no longer the open risk. Availability is.

------------------------------------------------------------------------

## 2. Declared before scoring

Twelve new jobs, written as complete ordinary turns before any eligibility of these strings was computed. Mix of short and medium. Not C5-G’s cafe/market. Not steered onto `T_probe` / `T_ack`.

The frozen C2-F ACK space is a second population: 64 ordinary paraphrases of one short ACK.

Reuse is scored only when both sides donate. One 64-cell space per donated side, pair in order, no `umbrella`.

------------------------------------------------------------------------

## 3. Donation

``` text
catalog          12 jobs
probe ≥ 2        9
ack ≥ 2          8
both donate      7
```

Misses, all short ordinary turns:

``` text
brief      Walk later? I'll pack an umbrella.
           Okay, umbrella too.
           later | (none)

coffee     Yes. I've got an umbrella.
           (none)

gym        Gym before lunch? I'll toss the umbrella in my bag.
           See you there. I'll bring the umbrella just in case.
           lunch | bring

library    Fine by me. Umbrella in my bag.
           (none)

call       Can you call later? I'll stay in with the umbrella by the door.
           later | lunch, handy
```

C2-F ACK population:

``` text
n                  64
donate a pair      32
pair               (sounds, bring)   32
null               32
```

The null half is `bring` → `take`. `take` is length 4. Do not lower `MIN_LEN`.

------------------------------------------------------------------------

## 4. Reuse and residual

The seven jobs that donated both pairs:

``` text
train     (catch, train)        (works, bring)
dinner    (carry, station)      (bring, outside)
movie     (tonight, bring)      (movie, jacket)
office    (today, either)       (works, bring)
beach     (beach, morning)      (bring, extra)
pizza     (pizza, place)        (place, bring)
garden    (bring, forecast)     (bring, gloves)
```

All fourteen spaces kept the pair in every cell.

``` text
job       START hits    FINISH hits
train     0             1
dinner    0             1
movie     2             0
office    0             1
beach     2             0
pizza     0             1
garden    0             2
```

Both-side residual in this 64-cell space: 0 / 7. That is the known lottery, not a reuse failure. Do not enlarge the spaces.

Held-out corpus: every donated pair’s accidental START/FINISH rate is 0, under `2⁻¹⁶`. `place … bring` had 7 mentions and still 0 accidents.

------------------------------------------------------------------------

## 5. Reading

``` text
C5-G                 3 / 3 longer handshake texts
C5-A catalog         7 / 12 ordinary texts
C5-A short ACKs      often zero eligible words
C2-F ACK space       32 / 64  (bring vs take)

reuse given donate   7 / 7
residual both sides  0 / 7 in 64 cells
collision            under the bar
```

The candidate fails on short ordinary handshakes because they do not name two reusable words. When they do, the pair is easy to carry later. Selectivity stays compositional.

Do not pad the misses. Do not drop `later` from eligibility. Do not add `take` by shrinking `MIN_LEN`. Do not invent another control architecture.

------------------------------------------------------------------------

## 6. Close

``` text
YES   reuse and collision when a pair is donated
NO    donation on 5 / 12 ordinary catalog jobs
      both-side residual in this 64-cell space
NOT   a v0.1 change
```

The candidate is still the right architecture. It is not yet reliably available. Repeated-umbrella in v0.1 stays.

Pair / fallback hierarchy: [NCMP-C5-H.md](NCMP-C5-H.md).

Do not change `process`. Do not invent NCMP/3.0 or NCMP/4.0.
