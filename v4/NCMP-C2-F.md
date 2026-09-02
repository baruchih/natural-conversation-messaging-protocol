# NCMP-C2-F

**Status:** First steerer YES. Not the protocol.  
**Date:** September 2026  
**Parent:** [NCMP-C2.md](NCMP-C2.md)  
**Prior:** [NCMP-C2-E.md](NCMP-C2-E.md) not YES  
**Name:** Steered residual  
**Code:** `c2f.ts` · `npm run test:v4-c2f`

The LM is not the search algorithm. One natural ACK is written. Local meaning-preserving alternatives are enumerated. The encoder picks the first realization whose 6-bit residual is the required target.

The receiver does not enumerate. It receives one sentence and computes hint + `P_sec`.

`process` is unchanged. Do not invent NCMP/3.0 or NCMP/4.0.

------------------------------------------------------------------------

## 1. Question

> Can an NCMP-aware sender construct or steer a natural, on-job sentence toward a required 6-bit residual, rather than generate 50 sentences blindly and hope one hits?

**Yes**, for this first steerer, on the C2-E derived target `0x0F`.

------------------------------------------------------------------------

## 2. Declared before scoring

``` text
base     Sounds good. I'll bring an umbrella too, just in case.

slots    Sounds good.     / That sounds good.
         I'll             / I will
         bring            / take
         an umbrella      / my umbrella
         too              / as well
         , just in case.  / , to be safe.

space    2⁶ = 64
target   T_ack = 0x0F
         derived from the C2-D U_probe
```

Slots were not chosen by looking at `P_sec`. No second LM generation. No `k = 50` set.

------------------------------------------------------------------------

## 3. Score

``` text
realizations     64
all have hint    64
unique P_sec     49
hits 0x0F        1
```

Hit:

``` text
Sounds good. I'll bring my umbrella too, just in case.
```

One word changed from the base: `an` → `my`. No nonce. No target digits. Same conversational act.

``` text
K_session = 0xDCA0B418
```

A and B compute that from `(U_probe, U_ack)` only. B does not send the slot table.

------------------------------------------------------------------------

## 4. Asymmetry

``` text
encoder    knows 0x0F
           enumerates local paraphrase space
receiver   sees one ordinary sentence
           umbrella?  yes
           P_sec      0x0F
                      → ACK
ordinary   does not enumerate
```

Blind sampling (C2-E) missed this target in 40 hinted replies. Local mutation hit it in 64 meaning-preserving variants of one reply.

------------------------------------------------------------------------

## 5. Close

``` text
YES   declared steering method
      hits a predeclared residual
      on-job, hint present
      no visible nonce or target digits
```

This is one steerer, not the last. Do not optimize it here. C2-B used it as-is: [NCMP-C2-B.md](NCMP-C2-B.md).
