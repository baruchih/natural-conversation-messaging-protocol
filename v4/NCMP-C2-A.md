# NCMP-C2-A

**Status:** NO. One run. Do not regenerate. Not the protocol.  
**Date:** September 2026  
**Parent:** [NCMP-C2.md](NCMP-C2.md)  
**Name:** Bootstrap reachability  
**Code:** `c2a.ts` · `c2a.frozen.json` · `npm run test:v4-c2a`

This `P` / `k` cannot produce a natural `U_probe` hitting `T_probe` on the frozen job. B was not generated. That is not a rescue. C2-B stays closed.

`process` is unchanged. Do not invent NCMP/3.0 or NCMP/4.0. Do not enlarge `k`. Do not shrink `P` in this note.

------------------------------------------------------------------------

## 1. Question

> Can A deliberately produce a reasonably natural `U_probe` hitting `T_probe`, and can B then deliberately produce a reasonably natural `U_ack` hitting the derived `T_ack`, without changing the conversational purpose?

**No.**

C1 asked whether ordinary language can avoid control accidentally. Yes.  
C2-A asked whether an encoder can reach that selective space cheaply. No.

A 24-bit hash equality gives the first property and is terrible at the second.

------------------------------------------------------------------------

## 2. Frozen from C1

``` text
P              24-bit FNV-1a of exact U
control_seed   0x9CA2C1C1
T_probe        0xA2C1C1
k              50
```

------------------------------------------------------------------------

## 3. One run

`gpt-4o-mini`. Saturday-morning walk. Last: `Fine by me.` Intent: propose the walk and roughly when. Blind to `P`, seed, and hit/miss.

``` text
considered     50
legal §4       50
hits T_probe   0
U_probe        none
B generated    no
K_session      none
```

Expected hits under the C1 model: `50 / 2²⁴ ≈ 3 × 10⁻⁶`. Observed: 0. Do not regenerate.

------------------------------------------------------------------------

## 4. Close

``` text
NO    this P / k cannot produce the pair
      on the frozen job
```

What C2 still has to solve:

``` text
hard to enter accidentally     C1 YES
easy to enter deliberately     C2-A NO
```

Do not treat a larger search budget as the answer. Do not open C2-B until a later experiment writes a YES on bootstrap reachability.
