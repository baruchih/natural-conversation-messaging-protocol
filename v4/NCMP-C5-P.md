# NCMP-C5-P

**Status:** Ordered-pair donation works on this handshake. Not a v0.1 change.  
**Date:** September 2026  
**Parent:** [NCMP-C5-E.md](NCMP-C5-E.md)  
**Name:** Handshake-donated ordered-pair hints  
**Code:** `c5p.ts` · `npm run test:v4-c5p`

C5-E showed that a single donated word can be a real word and still be too common. This note keeps the C5-E extractor and donates an ordered pair instead.

`process` is unchanged. Pair rule and slots were not retuned after the score.

------------------------------------------------------------------------

## 1. Question

> Can PROBE/ACK donate a deterministic two-word ordered hint whose joint natural frequency is low enough for the 6-bit residual, while later START/FINISH can naturally carry both words?

The architecture is unchanged: PROBE donates START_HINT, ACK donates FINISH_HINT, residual stays the second factor. The hint is now a pair.

------------------------------------------------------------------------

## 2. Declared before scoring

Same `eligible(U)` as C5-E. New domain: first-seen-order pairs. New tags.

``` text
eligible(U)        C5-E word runs
                   first-seen, length ≥ 5
                   not bootstrap_hint, not STOP

pairs(U)           (eligible[i], eligible[j])
                   for i < j
                   order is handshake order
                   empty if fewer than two eligible words

START_PAIR         pairs(U_probe)[ FNV(seed || 0x06 || U_probe) mod C(n,2) ]
FINISH_PAIR        pairs(U_ack)[   FNV(seed || 0x07 || U_ack)   mod C(m,2) ]

membership         both words occur as word-runs
                   first occurrence of the first word
                   precedes first occurrence of the second
                   adjacency is not required
```

Same frozen `U_probe` and `U_ack`. No second handshake. Do not require exact `"saturday morning"`.

------------------------------------------------------------------------

## 3. What the rule selected

``` text
eligible(U_probe)    thinking, saturday, morning
pairs(U_probe)       (thinking, saturday)
                     (thinking, morning)
                     (saturday, morning)

eligible(U_ack)      sounds, bring
pairs(U_ack)         (sounds, bring)

START_PAIR           (saturday, morning)
FINISH_PAIR          (sounds, bring)
```

ACK has one pair, so FINISH is forced. Do not replace either pair.

------------------------------------------------------------------------

## 4. Score

START space, every realization has `saturday` before `morning`, 64 cells:

``` text
hinted pair            64
unique P_sec           42
hits 0x25              1
```

Hit:

``` text
We can set off Saturday in the morning. The park works!
```

FINISH space, every realization has `sounds` before `bring`, 64 cells:

``` text
hinted pair            64
unique P_sec           44
hits 0x08              1
```

Hit:

``` text
Alright, that sounds good. I'll bring the notes.
```

Held-out corpus, N = 99434, bar `2⁻¹⁶`:

``` text
saturday … morning     5
sounds … bring         0
accidental START       0                      under
accidental FINISH      0                      under
```

Expected START accidents ≈ 5/64 ≈ 0.08. The freeze had 0.

------------------------------------------------------------------------

## 5. Reading

``` text
C5-E                 thinking is a word
                     thinking is too common
                     13 accidental START

C5-P                 (saturday, morning) is ordinary
                     joint frequency is 5
                     0 accidental START
                     residual hit without adjacency

FINISH               (sounds, bring) is unused in the
                     held-out corpus
                     still steerable in 64 cells
```

Compositional rarity does the work. Neither word had to be rare, and the protocol does not need a list of good rare words. The conversation still names the later cue.

Ordered pair, not exact phrase: the START hit is `Saturday in the morning`, not `Saturday morning`. Reverse order does not count.

Do not adopt `(thinking, morning)` after seeing the list. Do not require adjacency after seeing a non-adjacent hit. Do not enlarge the space.

------------------------------------------------------------------------

## 6. Close

``` text
YES   donated ordered pair + residual
      START and FINISH both steer
      accidental rates under 2⁻¹⁶
NOT   a v0.1 change
```

Provenance is stronger than C4’s list. Selectivity is stronger than C5-E’s single word. Prefer this shape over C4 if a later note integrates it. Cross-job check: [NCMP-C5-G.md](NCMP-C5-G.md).

Do not change `process`. Do not invent NCMP/3.0 or NCMP/4.0.
