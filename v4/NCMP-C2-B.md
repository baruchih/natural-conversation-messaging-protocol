# NCMP-C2-B

**Status:** YES. Not the protocol.  
**Date:** September 2026  
**Parent:** [NCMP-C2.md](NCMP-C2.md)  
**Prior:** [NCMP-C2-F.md](NCMP-C2-F.md) first steerer YES  
**Name:** Derived START / FINISH  
**Code:** `c2b.ts` · `npm run test:v4-c2b`

Given `K_session` and shared protocol state, START and FINISH residuals are derived. The sender uses the same C2-F steerer. The same Profile hint. No new pre-agreed word. No reserved control phrase.

State names the event. `K_session + state` names the 6-bit residual.

`process` is unchanged. Do not invent NCMP/3.0 or NCMP/4.0.

------------------------------------------------------------------------

## 1. Question

> Given `K_session` and shared protocol state, can START and FINISH targets be derived and deliberately reached using the same control mechanism, without introducing new pre-agreed hints or control phrases?

**Yes.** START first. FINISH second. Same steerer as C2-F. Slots were not retuned after residuals were seen.

------------------------------------------------------------------------

## 2. Declared before scoring

``` text
K_session   0xDCA0B418
            from exact U_probe and U_ack

T_START     FNV-1a32(session_bytes || 0x00 || "START")  & 0x3F
            = 0x25
T_FINISH    FNV-1a32(session_bytes || 0x00 || "FINISH") & 0x3F
            = 0x08

hint        umbrella
            same Profile hint as PROBE and ACK
```

START base and slots:

``` text
base     Let's head out Saturday morning. I'll have the umbrella.

slots    Let's              / We can
         head out           / set off
         Saturday morning.  / in the morning.
         I'll have          / I'll grab
         the umbrella       / an umbrella
         .                  / !

space    2⁶ = 64
target   T_START = 0x25
```

FINISH base and slots:

``` text
base     Alright, that covers it. I'll keep the umbrella handy.

slots    Alright,           / Okay,
         that covers it.    / that's the plan.
         I'll keep          / I'll hold
         the umbrella       / my umbrella
         handy              / with me
         .                  / !

space    2⁶ = 64
target   T_FINISH = 0x08
```

Slots were written before any `P_sec` of a combination was computed. No second hint. No `begin+round+now`. No `close+round+here`. The steerer was not enlarged or retuned after the score.

------------------------------------------------------------------------

## 3. Score

START:

``` text
realizations     64
all have hint    64
unique P_sec     46
hits 0x25        1
```

Hit:

``` text
We can set off Saturday morning. I'll have an umbrella!
```

FINISH:

``` text
realizations     64
all have hint    64
unique P_sec     34
hits 0x08        3
```

First hit:

``` text
Alright, that's the plan. I'll keep the umbrella handy!
```

The receiver does not need the slot table. It sees one sentence, the hint, and `P_sec`. State says whether that exceptional event is START or FINISH.

------------------------------------------------------------------------

## 4. Cascade

``` text
control_seed
  ↓
PROBE     umbrella + 0x01
  ↓ exact U_probe
T_ack = 0x0F
  ↓
ACK       umbrella + 0x0F
  ↓ exact U_ack
K_session = 0xDCA0B418
  ↓
START     umbrella + 0x25
  ↓
FINISH    umbrella + 0x08
```

No new pre-agreed initiator. Selectivity remains hint × 6-bit residual, the C2-D composition. The new fact is that session-derived targets are reachable the same way the ACK residual was.

------------------------------------------------------------------------

## 5. Close

``` text
YES   K_session + state derives T_START and T_FINISH
      same hint, same steerer
      START hit 0x25
      FINISH hit 0x08
      no new pre-agreed phrase
      no visible nonce or target digits
```

Do not optimize the steerer. C3 (START length) is next: [NCMP-C3.md](NCMP-C3.md). Do not change `process` here.
