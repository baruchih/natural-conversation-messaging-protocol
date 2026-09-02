# NCMP-C2-D

**Status:** YES. Held-out composed bootstrap. Not the protocol.  
**Date:** September 2026  
**Parent:** [NCMP-C2.md](NCMP-C2.md)  
**Prior:** [NCMP-C2-C.md](NCMP-C2-C.md) first witness not YES  
**Name:** Composed bootstrap, held-out  
**Code:** `c2d.ts` · `npm run test:v4-c2d`

A declared hint plus a 6-bit secondary met accidental PROBE `≤ 2⁻¹⁶` on a held-out corpus and produced a `k = 50` on-job hit. C2-B stays closed. ACK / `K_session` is not scored here.

`process` is unchanged. Do not invent NCMP/3.0 or NCMP/4.0.

------------------------------------------------------------------------

## 1. Question

> On a held-out ordinary corpus, can a declared hint plus a 5–6 bit secondary meet accidental PROBE `≤ 2⁻¹⁶` and a `k = 50` on-job hit?

**Yes.**

------------------------------------------------------------------------

## 2. Declared before scoring

``` text
bootstrap_hint     umbrella
secondary          low 6 bits of FNV-1a 32 on exact U
secondary width    6
control_seed       0x9CA2C1C1
T_sec              0x01
corpus             fresh Gutenberg freeze
                   not C1-D
job                Saturday morning walk;
                   bringing an umbrella is on-purpose
k                  50
```

`umbrella` was not chosen by counting any corpus. `bakery` was not reused.

------------------------------------------------------------------------

## 3. Held-out corpus

``` text
N                  99434
hinted             58
q                  58/99434 ≈ 1/1714
accidental PROBE   1
rate               1/99434 ≈ 1.01 × 10⁻⁵
bar                2⁻¹⁶ ≈ 1.53 × 10⁻⁵
```

`q × 2⁻⁶ ≈ 9.1 × 10⁻⁶`, also under the bar. One composite hit occurred. The bar still holds.

------------------------------------------------------------------------

## 4. One encoder run

`gpt-4o-mini`. Last: `Fine by me.` Intent includes the umbrella. Blind to `P_sec` and hit/miss. Do not regenerate.

``` text
considered         43
with hint          43
legal              43
hits T_sec         3
```

Chosen hit:

``` text
Thinking we could walk Saturday morning—what do you say?
I’ll pack an umbrella, just to be on the safe side!
```

The hint was easy. The 6-bit residual was reachable.

------------------------------------------------------------------------

## 5. What this shows

``` text
ordinary speaker
    almost never has the hint
    and almost never hits the residual
aware encoder
    uses the hint on purpose
    searches only 6 bits
```

That is the C2 asymmetry. It is not a reserved PROBE phrase.

------------------------------------------------------------------------

## 6. Close

``` text
YES   accidental ≤ 2⁻¹⁶ on the held-out freeze
      one k = 50 set contains a legal on-job hit
```

Do not open C2-B in this note. Session ACK / `K_session` is the next lifecycle question, not START/FINISH.
