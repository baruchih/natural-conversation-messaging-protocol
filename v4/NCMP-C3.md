# NCMP-C3

**Status:** YES. Not the protocol.  
**Date:** September 2026  
**Parent:** [NCMP-Control.md](NCMP-Control.md)  
**Prior:** [NCMP-C2-B.md](NCMP-C2-B.md) YES  
**Name:** START length  
**Code:** `c3.ts` · `npm run test:v4-c3`

A START turn is already named by state plus the session-derived residual. This note asks whether that same utterance can also declare an argument length, without a reserved length word and without folding length into the START discriminator.

`process` is unchanged. Do not invent NCMP/3.0 or NCMP/4.0.

------------------------------------------------------------------------

## 1. Question

> Can a START turn simultaneously satisfy the session-derived START discriminator and deterministically carry a length value, while keeping control identity and length declaration separate?

**Yes.** Tiny first. Length is a second function of `(K_session, U)`. START identity does not read it.

------------------------------------------------------------------------

## 2. Two functions

``` text
START identity     hint ∧ P_sec(U) = T_START
                   T_START = 0x25
                   unchanged from C2-B

LENGTH             L(K_session, U)
                   FNV-1a32(session_bytes || 0x02 || U)  mod 5
                   →  { empty 0, short 5, tiny 8, brief 24, wide 128 }

ordinary U         LEN may be computed
                   it is not a declaration
START U            LEN is the argument length
```

`P_sec` hashes `U` only. `L` hashes `K_session` then `U`. Neither function consults the other. Neither looks for `tiny`, `short`, `empty`, `brief`, or `wide`.

The receiver does not need the slot table. If the turn is START, it computes `L`. If the turn is ordinary, it does not declare a frame length.

------------------------------------------------------------------------

## 3. Declared before scoring

``` text
base     Yeah, I think we can head out Saturday morning. I'll have the umbrella too.

slots    Yeah,               / Well,
         I think             / I guess
         we can              / let's
         head out            / set off
         Saturday morning.   / in the morning.
         I'll have           / I'll grab
         the umbrella        / an umbrella
         too                 / as well
         .                   / !

space    2⁹ = 512
first    tiny → 8
second   brief → 24
```

The extra slots enlarge the joint search. They do not retune the C2-F / C2-B steerer. No `begin+round+now`. No length names.

------------------------------------------------------------------------

## 4. Score

``` text
realizations     512
all have hint    512
START hits       8
unique P_sec     64
```

Among those 8 START turns:

``` text
empty  0     2
short  5     0
tiny   8     4
brief  24    0
wide   128   2
```

First tiny hit:

``` text
Yeah, I guess let's head out in the morning. I'll have an umbrella as well!
```

Same conversational act as the base. No length word. No target digits. `P_sec = 0x25`. `L = tiny → 8`.

Empty and wide were also reached in the same space. Brief, the declared second target, was not. Short was not. Do not add slots. Do not shrink the length table.

The C2-B START, under this `L`, already maps to short (5). That is not a C3 steer. It shows `L` is a function of `(K_session, U)`, not of this slot table.

------------------------------------------------------------------------

## 5. Separation

``` text
encoder    chooses a legal length
           enumerates local paraphrases
           keeps only START ∧ L = want

receiver   umbrella?     yes
           P_sec         0x25  → START
           L             8     → tiny

ordinary   may hash to any L
           is not START
           declares nothing
```

Control identity answers “is this the exceptional event?”  
Length answers “if it is START, how many argument bits?”

Those are different questions. They stay different functions.

------------------------------------------------------------------------

## 6. Close

``` text
YES   START discriminator unchanged
      length is a second function of (K_session, U)
      tiny (8) reached
      empty and wide reached in the same space
      no reserved length word
      no visible nonce or target digits
```

This space did not hit every Baseline length. That is coverage, not a second mechanism. Do not retune. Do not change `process` here.
