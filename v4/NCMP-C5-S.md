# NCMP-C5-S

**Status:** C5-U shadow machine prefix-conformed, then promoted into `process`.  
**Date:** September 2026  
**Parent:** [NCMP-C5-U.md](NCMP-C5-U.md)  
**Name:** Shadow machine  
**Code:** `c5s.ts` · `c5s.ref.ts` · `npm run test:v4-c5s`

C5-U is now the v0.1 frame architecture. This note is the research trail that ran it end-to-end beside the earlier decoder.

Two machines. They agree after every prefix.

------------------------------------------------------------------------

## 1. Question

> Does C5-U frame control have a complete lifecycle, on actual transcripts, including donated, hybrid, and derived cues, without ambiguities the v0.1 machine already settled?

------------------------------------------------------------------------

## 2. Shadow rules

Bootstrap is v0.1. Frame identity is C5-U.

``` text
idle          umbrella ∧ P_sec = T_probe     → PROBE
handshake     umbrella ∧ P_sec = T_ack       → ACK
                                            store U_probe, U_ack, K_session
active
  START       START_PAIR ∧ P_sec = T_START
  FINISH      FINISH_PAIR ∧ P_sec = T_FINISH
  L           unchanged
  BODY        unchanged C6
```

`START_PAIR` / `FINISH_PAIR` are C5-U: donate what exists, derive the rest. Membership is ordered pair, word-runs. Not `umbrella`.

The shadow stores `U_ack`. v0.1 does not need it after `K_session`.

Catalog handshakes that are not residual-valid PROBE/ACK are installed after the fact. That tests frame control given those exact strings. It does not claim a second bootstrap.

------------------------------------------------------------------------

## 3. Transcripts

``` text
walk     real PROBE / ACK
         donated (saturday, morning) / (sounds, bring)
         START L = 5
         GET CUSTOMER 10111

brief    installed handshake
         hybrid (later, simple) / derived (later, sweater)
         START L = 0
         GET CUSTOMER empty

gym      installed handshake
         hybrid (lunch, maybe) / hybrid (bring, around)
         START L = 5
         GET CUSTOMER 10111
```

------------------------------------------------------------------------

## 4. Lifecycle

``` text
ordinary before PROBE              NOT_NCMP
umbrella without the pair          CHAT
v0.1 FINISH after walk ACK         CHAT
FINISH with no frame               NO_FRAME
second START                       NEST
peer FINISH                        NOT_OWNER
FINISH with remaining > 0          INCOMPLETE
empty START then immediate FINISH  INCOMPLETE
Hi. while a frame is open          BODY
HEADER_RESERVED                    unused codebook
ordinary after FINISH              CHAT
```

The published BODY turns still decode. The pair is not in those turns.

v0.1 `EXAMPLES.FINISH` carries `umbrella` and `T_FINISH`. It does not carry `(sounds, bring)`. The shadow treats it as CHAT. That is the architecture, not a bug.

------------------------------------------------------------------------

## 5. Reading

``` text
two machines          agree after every prefix
donated / hybrid /
derived               all three open and close a frame
BODY                  unchanged
ambiguity             same outcomes as v0.1
                      except session identity is the pair
v0.1 process          untouched
```

No negotiation bit. Both machines derive the same pairs from the same stored strings.

------------------------------------------------------------------------

## 6. Close

``` text
YES   shadow lifecycle
      prefix conformance
      donated, hybrid, derived
THEN  promoted into process
```

The pre-freeze amendment is done. Do not open C6, optimize the word list, or solve the residual lottery. Do not invent NCMP/3.0 or NCMP/4.0.
