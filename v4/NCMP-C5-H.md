# NCMP-C5-H

**Status:** Receiver can decide pair vs fallback from the handshake. Fallback reintroduces single-word frequency. Not a v0.1 change.  
**Date:** September 2026  
**Parent:** [NCMP-C5-A.md](NCMP-C5-A.md)  
**Name:** Pair / session-word hierarchy  
**Code:** `c5h.ts` · `npm run test:v4-c5h`

C5-A showed donated pairs are selective and reusable when they exist, and often do not exist on short ordinary handshakes. This note does not fix eligibility. It asks whether a deterministic fallback can cover those misses without a negotiation bit.

`process` is unchanged. C4’s `SESSION_WORDS` and C5-P’s pair rule are held fixed. Words and slots were not retuned after the score.

------------------------------------------------------------------------

## 1. Question

> Can NCMP use handshake-donated ordered pairs when available and deterministically fall back to session-derived control cues when they are not, without creating ambiguity for the receiver?

------------------------------------------------------------------------

## 2. Declared before scoring

Decision is a function of the handshake only. Later `U` is not an input.

``` text
START_HINT(K, U_probe)
    if pairs(U_probe) nonempty:
         C5-P START_PAIR
    else:
         SESSION_WORDS[ FNV(be32(K) || 0x08 || "START") mod 32 ]

FINISH_HINT(K, U_ack)
    if pairs(U_ack) nonempty:
         C5-P FINISH_PAIR
    else:
         SESSION_WORDS[ FNV(be32(K) || 0x09 || "FINISH") mod 32 ]

match(U, hint)
    pair  → ordered pair, word-runs
    word  → word-run membership
            not tokenize

START     match(U, START_HINT)  ∧  P_sec = T_START
FINISH    match(U, FINISH_HINT) ∧  P_sec = T_FINISH
```

Same C5-A catalog. Same C4 list. New tags, so START and FINISH fallbacks may differ. Receiver and sender compute the same eligibility from the exact strings.

Do not OR pair and word. Do not decide from the later utterance.

------------------------------------------------------------------------

## 3. What the rule selected

``` text
job        START                    FINISH
brief      word shops               word bridge
coffee     pair coffee … bring      word coffee
train      pair catch … train       pair works … bring
dinner     pair carry … station     pair bring … outside
movie      pair tonight … bring     pair movie … jacket
gym        word market              word jacket
library    pair library … afternoon word ridge
call       word jacket              pair lunch … handy
office     pair                     pair
beach      pair                     pair
pizza      pair                     pair
garden     pair                     pair
```

``` text
START pair 9   word 3
FINISH pair 8  word 4
covered    12 / 12
```

`coffee` is both the first START-pair word and the FINISH fallback. Residuals differ (`0x2E` / `0x29`). Do not replace it.

------------------------------------------------------------------------

## 4. Ambiguity

``` text
same handshake → same hints     12 / 12
T_START ≠ T_FINISH              12 / 12
unused session-word cue
  on pair-mode sides            rejected 7 / 7
```

The unused cue is the word that would have been selected if the rule always fell back. Pair-mode START/FINISH do not fire on that word alone. `The coffee is ready.` is not coffee START: the pair still needs `bring`.

The receiver does not need a negotiation bit.

------------------------------------------------------------------------

## 5. Fallback score

Seven word-mode sides. Pair-mode sides stay C5-A.

``` text
side                residual    hinted    accidents    bar
brief START shops   1           28        0            under
brief FINISH bridge 1           76        1            under
coffee FINISH coffee 0          96        2            over
gym START market    0           83        0            under
gym FINISH jacket   1           48        3            over
library FINISH ridge 0          10        0            under
call START jacket   1           48        0            under
```

All seven spaces kept the word in every cell. Residual misses are the 64-cell lottery. `coffee` and `jacket` fail the accidental bar. That is C4’s single-word frequency, back on the fallback path.

------------------------------------------------------------------------

## 6. Reading

``` text
availability     hierarchy covers the C5-A misses
ambiguity        none, if the decision is handshake-only
reuse            fallback words are easy to carry
selectivity      pair path stays compositional
                 word path is C4 again
```

Do not lower `MIN_LEN` so short ACKs donate. Do not pad handshake text. Do not replace `coffee` or `jacket`. Do not enlarge the spaces.

------------------------------------------------------------------------

## 7. Close

``` text
YES   handshake-only pair-or-fallback
      no receiver ambiguity
      12 / 12 catalog sides have a hint
YES   fallback reuse
NO    fallback selectivity on coffee / jacket
      fallback residual in this 64-cell space
NOT   a v0.1 change
```

The hierarchy is the right shape for availability. It does not make the fallback as selective as a donated pair. Repeated-umbrella in v0.1 stays.

Uniform two-word fill: [NCMP-C5-U.md](NCMP-C5-U.md).

Do not change `process`. Do not invent NCMP/3.0 or NCMP/4.0.
