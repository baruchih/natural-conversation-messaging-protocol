# NCMP-C2-E

**Status:** First run scored. Not YES. Not the protocol.  
**Date:** September 2026  
**Parent:** [NCMP-C2.md](NCMP-C2.md)  
**Prior:** [NCMP-C2-D.md](NCMP-C2-D.md) YES  
**Name:** Derived ACK and session state  
**Code:** `c2e.ts` · `npm run test:v4-c2e`

C2-D produced a real `U_probe`. This run asked whether B could hit a target derived from that exact string. One `k = 50` set. Do not regenerate. C2-B stays closed. `process` is unchanged.

------------------------------------------------------------------------

## 1. Question

> Can B produce a reasonably natural on-job `U_ack` that satisfies `T_ack = F(seed, U_probe)`, and do A and B then derive the identical `K_session`?

This run: **no.** The derived residual was not hit. No `K_session` was formed.

------------------------------------------------------------------------

## 2. Declared before the ACK search

``` text
U_probe        C2-D chosen hit
hint           umbrella
T_ack          low 6 bits of FNV-1a(seed || U_probe)
               = 0x0F
ACK iff        hint present AND P_sec(U) = T_ack
K_session      FNV-1a 32 of seed || U_probe || U_ack
k              50
```

Not a second ACK word. `T_ack` is not `T_probe`.

------------------------------------------------------------------------

## 3. Accidental ACK

Same held-out freeze as C2-D. Target is this session’s `T_ack`, not `0x01`.

``` text
N                  99434
hinted             58
accidental ACK     1
rate               1.01 × 10⁻⁵  <  2⁻¹⁶
```

Selectivity held for the derived target.

------------------------------------------------------------------------

## 4. One encoder run

`gpt-4o-mini`. History includes the exact `U_probe`. Do not regenerate.

``` text
considered         50
with hint          40
legal              40
hits T_ack         0
K_session          none
```

Expected `≥1` hit at `w = 6`, `n = 40` is about 47%. Observed 0. The encoder used the hint. It did not hit the residual. That miss is allowed. It is not a reason to rerun or shrink `w`.

------------------------------------------------------------------------

## 5. Close

``` text
NO    this derived target was not reachable
      in the one declared run
```

The cascade is still the right object. This pair did not complete it. Do not open C2-B.

ACK uses the same hint as PROBE. Only the residual changes. `0x0F` was derived from this `U_probe`. It was not agreed beforehand.

``` text
PROBE   umbrella AND secondary = 0x01
ACK     umbrella AND secondary = 0x0F
```

The hint is not the problem. B used `umbrella` in 40 of 50 replies. The 6-bit check is the problem. Blind `k = 50` sometimes hits (PROBE, 3/43) and sometimes misses (ACK, 0/40). That is luck, not a method.

Next is not a target battery. [NCMP-C2-F.md](NCMP-C2-F.md)
