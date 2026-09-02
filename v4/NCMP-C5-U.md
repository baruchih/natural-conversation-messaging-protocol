# NCMP-C5-U

**Status:** Uniform two-word cues cover the C5-A misses without a single-word path. Promoted into `process`.  
**Date:** September 2026  
**Parent:** [NCMP-C5-H.md](NCMP-C5-H.md)  
**Name:** Donate what exists; derive the rest  
**Code:** `c5u.ts` · `npm run test:v4-c5u`

C5-H’s fallback reintroduced single-word frequency. This note does not try to make one word work. Every path is an ordered pair. The C5-P donated-pair rule is untouched.

Derived words and slots were not retuned after the score. The rule is now the v0.1 frame recognizer.

------------------------------------------------------------------------

## 1. Question

> If the handshake cannot donate two words, can NCMP derive only the missing material so that START and FINISH are always an ordered pair plus a session residual, without a negotiation bit?

------------------------------------------------------------------------

## 2. Declared before scoring

Same C5-A catalog. Same C4 `SESSION_WORDS`. Handshake-only.

``` text
eligible n ≥ 2     C5-P donated pair          untouched
eligible n = 1     hybrid (donated, derived₂)
eligible n = 0     derived (derived₁, derived₂)

derived_i          SESSION_WORDS[ FNV(be32(K) || tag || role) mod 32 ]
START tags         0x0A slot0, 0x0B slot1
FINISH tags        0x0C slot0, 0x0D slot1
collision          if derived equals an earlier word of this pair,
                   take the next list entry

membership         ordered pair, word-runs
                   same as C5-P
START / FINISH     pair present ∧ P_sec = T
```

Not C5-H’s single-word tags. Do not pad short handshakes. Do not lower `MIN_LEN`.

------------------------------------------------------------------------

## 3. What the rule selected

``` text
job        START                      FINISH
brief      hybrid later … simple      derived later … sweater
coffee     donated coffee … bring     derived walk … packed
train      donated                    donated
dinner     donated                    donated
movie      donated                    donated
gym        hybrid lunch … maybe       hybrid bring … around
library    donated                    derived jacket … bench
call       hybrid later … bench       donated lunch … handy
office     donated                    donated
beach      donated                    donated
pizza      donated                    donated
garden     donated                    donated
```

``` text
START    donated 9   hybrid 3   derived 0
FINISH   donated 8   hybrid 1   derived 3
pairs    24 / 24
C5-P     donated sides identical
```

------------------------------------------------------------------------

## 4. Score

Seven hybrid/derived sides. Donated sides stay C5-A.

``` text
side                       residual    mentions    accidents    bar
brief START later…simple   1           0           0            under
brief FINISH later…sweater 1           0           0            under
coffee FINISH walk…packed  0           0           0            under
gym START lunch…maybe      1           0           0            under
gym FINISH bring…around    3           3           0            under
library FINISH jacket…bench 1          0           0            under
call START later…bench     1           0           0            under
```

All seven spaces kept the pair in every cell. Coffee FINISH residual miss is the 64-cell lottery. Do not enlarge the space.

C5-H’s over-bar single words on this catalog were `coffee` (2) and `jacket` (3). Those sides are now pairs and under the bar.

------------------------------------------------------------------------

## 5. Reading

``` text
uniform          every control cue is an ordered pair
availability     12 / 12 jobs, including short ACKs
ambiguity        none; handshake decides donated / hybrid / derived
C5-P             untouched
selectivity      compositional on the fill path too
residual         6 / 7 fill sides in 64 cells
```

The list is still C4’s closed session vocabulary. It is not a rarity dictionary. Frequency is not an input.

Do not adopt a different derived word after seeing mentions. Do not fall back to one word.

------------------------------------------------------------------------

## 6. Close

``` text
YES   always a two-word cue
      C5-P donated path untouched
      hybrid/derived reuse
      accidental rates under 2⁻¹⁶
NO    coffee FINISH residual in this 64-cell space
THEN  promoted into process
```

Stronger than C5-H’s single-word fallback on this catalog. Repeated-umbrella is no longer the session control.

Shadow machine: [NCMP-C5-S.md](NCMP-C5-S.md).

Do not open C6, optimize the word list, or solve the residual lottery. Do not invent NCMP/3.0 or NCMP/4.0.
