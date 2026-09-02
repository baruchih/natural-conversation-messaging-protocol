# NCMP-C5-G

**Status:** Pair donation survived three predeclared jobs. Not a v0.1 change.  
**Date:** September 2026  
**Parent:** [NCMP-C5-P.md](NCMP-C5-P.md)  
**Name:** Pair donation across jobs  
**Code:** `c5g.ts` · `npm run test:v4-c5g`

C5-P worked on one handshake. This note asks whether that was that handshake, or the rule.

Same C5-P extractor, pair index, and ordered membership. `process` is unchanged. Jobs and slots were not retuned after the score.

------------------------------------------------------------------------

## 1. Question

> Does pair donation survive another handshake?

Not a second residual search. Not a rarity dictionary. Three predeclared jobs, then the frozen rule.

``` text
PROBE/ACK need ≥ 2 eligible words
derived pair must be
    naturally reusable later
    jointly uncommon
    steerable with the session residual
```

------------------------------------------------------------------------

## 2. Declared before scoring

Walk is the frozen C5-P handshake. Cafe and market are different scenes, written as complete turns before any pair or `P_sec` of those strings was computed.

``` text
walk     Saturday morning walk          C5-P U_probe / U_ack
cafe     rain, stay at the coffee shop  new exact strings
market   afternoon market               new exact strings
```

Each job uses its own exact strings:

``` text
K_session     FNV(seed || 0x00 || U_probe || 0x01 || U_ack)
T_START       FNV(K || 0x00 || "START") & 0x3F
T_FINISH      FNV(K || 0x00 || "FINISH") & 0x3F
START_PAIR    C5-P rule on U_probe
FINISH_PAIR   C5-P rule on U_ack
```

Cafe and market mention `umbrella`. They were not steered onto `T_probe` / `T_ack`. Bootstrap reachability stays C2-D / C2-F.

------------------------------------------------------------------------

## 3. What the rule selected

``` text
walk     START (saturday, morning)     FINISH (sounds, bring)
cafe     START (serious, minds)        FINISH (works, bring)
market   START (closes, clouds)        FINISH (market, bring)
```

All six sides had ≥ 2 eligible words. Do not replace a pair.

`(serious, minds)` is not a pretty collocation. The rule does not owe us one.

------------------------------------------------------------------------

## 4. Score

64-cell START/FINISH spaces, pair present in donated order, no `umbrella`:

``` text
job      START hits    FINISH hits
walk     1             1
cafe     1             1
market   3             3
```

Hits:

``` text
walk     We can set off Saturday in the morning. The park works!
         Alright, that sounds good. I'll bring the notes.
cafe     Weather is quite serious. We're of two minds on heading out!
         Alright, that works. I'll bring the notes along.
market   Let's go before the place closes. When the clouds hold we're fine.
         Alright, the market works for me. I can bring the bag!
```

Held-out corpus, N = 99434, bar `2⁻¹⁶`. All six accidental rates are 0.

``` text
job      pair                    mentions    accidents
walk     saturday … morning      5           0
         sounds … bring          0           0
cafe     serious … minds         0           0
         works … bring           0           0
market   closes … clouds         1           0
         market … bring          1           0
```

Walk reproduced C5-P. Cafe and market are not residual-valid PROBE/ACK.

------------------------------------------------------------------------

## 5. Reading

``` text
eligibility      3 / 3 jobs
reuse            3 / 3 jobs, including (serious, minds)
rarity           3 / 3 jobs under the bar
residual         3 / 3 jobs, both sides
bootstrap texts  only walk is a C2-D / C2-F handshake
```

Pair donation is not a one-handshake fluke on these three scenes. Compositional rarity still does the work. The protocol still does not need a list of good rare words.

This is not a second proof of bootstrap. Unsteered cafe and market strings did not hit `T_probe` / `T_ack`. That was not the question.

Do not drop `(serious, minds)`. Do not add a fourth job after the score. Do not change `process`.

------------------------------------------------------------------------

## 6. Close

``` text
YES   pair donation on three predeclared jobs
      START and FINISH steer
      accidental rates under 2⁻¹⁶
NOT   a new residual handshake
NOT   a v0.1 change
```

Strongest candidate architecture remains C5-P. This note says the candidate survives a small cross-job test. It does not settle control.

Availability across ordinary handshakes: [NCMP-C5-A.md](NCMP-C5-A.md).

Do not change `process`. Do not invent NCMP/3.0 or NCMP/4.0.
