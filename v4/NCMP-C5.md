# NCMP-C5

**Status:** Right idea. This eligibility did not produce two usable words. Not a v0.1 change.  
**Date:** September 2026  
**Parent:** [NCMP-Control.md](NCMP-Control.md)  
**Prior:** [NCMP-C4.md](NCMP-C4.md) session-derived list  
**Name:** Handshake-derived hints  
**Code:** `c5.ts` · `npm run test:v4-c5`

C4 derived one session word from `K_session` and a pre-agreed list. This note asks whether PROBE and ACK can instead donate the later hints from their own tokens.

`process` is unchanged. Eligibility was not retuned after the words were seen.

------------------------------------------------------------------------

## 1. Question

> Can PROBE and ACK deterministically select later START/FINISH hints from their own text, with usable natural-language frequency, without the sender contorting the handshake or the later controls?

The residual stays the second factor. The handshake word is only the hint.

------------------------------------------------------------------------

## 2. Declared before scoring

``` text
tokenize           existing Baseline tokens
                   NFC, lowercase, split on whitespace,
                   then drop non a–z from each part

eligible(U)        first-seen tokens
                   length ≥ 5
                   not bootstrap_hint

START_HINT         eligible(U_probe)[ FNV(seed || 0x04 || U_probe) mod n ]
FINISH_HINT        eligible(U_ack)[   FNV(seed || 0x05 || U_ack)   mod n ]
```

The list is not C4’s `SESSION_WORDS`. No word was reserved after inspection.

Frozen handshake:

``` text
U_probe    Thinking we could walk Saturday morning—what do you say? I’ll pack an umbrella, just to be on the safe side!
U_ack      Sounds good. I'll bring my umbrella too, just in case.
```

------------------------------------------------------------------------

## 3. What the rule selected

``` text
eligible(U_probe)    thinking, could, saturday, morningwhat
eligible(U_ack)      sounds, bring

START_HINT           morningwhat
FINISH_HINT          sounds
```

`morning—what` is one whitespace field. Tokenize then strips the dash and glues the letters. `morning` is not an eligible token. That is the declared tokenizer, not a surprise to be patched in this score.

------------------------------------------------------------------------

## 4. Score

Natural START space using the word a reader sees (`morning`), 64 realizations:

``` text
hinted morningwhat     0
hits T_START           0
```

Counterfactual only: if the hint had been `morning`, the same space would have had 3 residual hits. That word was not selected. Do not adopt it.

FINISH space carrying `sounds`, 64 realizations:

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
morningwhat mentioned     0
sounds mentioned          86
accidental START          0
accidental FINISH         0
```

`morningwhat` is selective because it is not a word. `sounds` had 86 mentions and no residual hit on this freeze.

------------------------------------------------------------------------

## 5. Reading

``` text
architecture     PROBE donates START_HINT
                 ACK donates FINISH_HINT
                 residual remains the second factor
                 nicer provenance than C4’s list

this rule        START_HINT is not a conversational word
                 later START cannot carry it without
                 repeating the glued token
                 FINISH_HINT = sounds is usable

do not           split on punctuation after the fact
                 pretend the hint was morning
                 change process
```

C4’s `bench` was a usable word from a list. C5’s handshake-token rule, on these exact strings and this tokenizer, did not give START a usable word. The word extractor is the next rule: [NCMP-C5-E.md](NCMP-C5-E.md).

------------------------------------------------------------------------

## 6. Close

``` text
YES   FINISH from U_ack token + residual, no umbrella
NO    START from this U_probe under this eligibility
      without contortion
NOT   a v0.1 change
```

Do not retune tokenize. Do not change `process`. Do not invent NCMP/3.0 or NCMP/4.0.
