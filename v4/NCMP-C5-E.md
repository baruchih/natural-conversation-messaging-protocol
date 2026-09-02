# NCMP-C5-E

**Status:** Extractor works. This handshake donated a common START word. Not a v0.1 change.  
**Date:** September 2026  
**Parent:** [NCMP-C5.md](NCMP-C5.md)  
**Name:** Eligible control-hint words  
**Code:** `c5e.ts` · `npm run test:v4-c5e`

C5 reused the protocol tokenizer and selected `morningwhat`. This note defines a separate extractor for reusable conversational words, then applies the same hash-derived index to the same frozen handshake.

`process` is unchanged. STOP, `MIN_LEN`, and slots were not retuned after the score.

------------------------------------------------------------------------

## 1. Question

> Can we deterministically extract a small ordered set of actual reusable words from `U_probe` / `U_ack`, then select one using the same hash-derived index?

The architecture is unchanged: PROBE donates START_HINT, ACK donates FINISH_HINT, residual stays the second factor.

------------------------------------------------------------------------

## 2. Declared before scoring

Not `tokenize`. Word runs, then a closed filter.

``` text
words(U)           NFC, lowercase
                   maximal [a-z]+ runs

eligible(U)        first-seen words(U)
                   length ≥ 5
                   not bootstrap_hint
                   not STOP

STOP               closed function-word list, length ≥ 5
                   written as ordinary English auxiliaries
                   not taken from this handshake

START_HINT         eligible(U_probe)[ FNV(seed || 0x04 || U_probe) mod n ]
FINISH_HINT        eligible(U_ack)[   FNV(seed || 0x05 || U_ack)   mod n ]

membership         words(U) contains the hint
                   same extractor, not tokenize
```

Same frozen `U_probe` and `U_ack` as C5. No second handshake.

------------------------------------------------------------------------

## 3. What the rule selected

``` text
eligible(U_probe)    thinking, saturday, morning
eligible(U_ack)      sounds, bring

START_HINT           thinking
FINISH_HINT          sounds
```

`morning—what` is now two runs. `morning` is eligible. `could` is STOP. The index then chose `thinking`, not `morning`. Do not replace it.

------------------------------------------------------------------------

## 4. Score

START space, every realization contains `thinking`, 64 cells:

``` text
hinted thinking        64
unique P_sec           40
hits 0x25              0
```

FINISH space, every realization contains `sounds`, 64 cells:

``` text
hinted sounds          64
unique P_sec           42
hits 0x08              1
```

Hit:

``` text
Alright, it sounds good. See you later.
```

Held-out corpus, N = 99434, bar `2⁻¹⁶`:

``` text
thinking mentioned     622
sounds mentioned       88
accidental START       13     1.31 × 10⁻⁴     over
accidental FINISH      0                      under
```

`q(thinking) × 2⁻⁶ ≈ 9.7` expected START accidents. The freeze had 13. The word is too common for a 6-bit residual.

------------------------------------------------------------------------

## 5. Reading

``` text
C5 error             protocol tokenizer ≠ word extractor
C5-E extractor       candidates are actual words
                     later sentences can contain them

this handshake       START_HINT = thinking
                     steerable as a word
                     not rare enough
                     residual miss in 64 cells

FINISH               sounds still works
                     same as C5, now under the word-run
                     definition of membership
```

Provenance is still stronger than C4’s list: the conversation named the later hints. Frequency is whatever the handshake said. A common donated word fails the C2-D composition.

Do not adopt `morning` after seeing the list. Do not enlarge the START space. Do not drop `thinking` from STOP’s complement. The pair rule is the next note: [NCMP-C5-P.md](NCMP-C5-P.md).

------------------------------------------------------------------------

## 6. Close

``` text
YES   extractor yields reusable words
      FINISH hint + residual
NO    START residual in this 64-cell space
      accidental START ≤ 2⁻¹⁶ for thinking
NOT   a v0.1 change
```

Do not change `process`. Do not invent NCMP/3.0 or NCMP/4.0.
