# NCMP-P7-S1

**Status:** Experimental Result #4 — frozen\
**Date:** August 2026\
**Parent:** NCMP/2.0 §13.3 (idle / active)\
**Depends on:** C6, D1, E1 (Results #1–#3, frozen)\
**Scope:** Session gate only. Whether to decode, not what to
decode. Asymmetric one-bit handshake. No six-opcode alphabet.

This profile is closed. `S` is a handshake, not two independent
activation tokens. The recorded two-agent exchange is
`NCMP-P7-X1.md` (Result #5, frozen). Do not enlarge `D`.

------------------------------------------------------------------------

## 1. Purpose

Every English sentence has a C6 residue. D and E cut false
activation, but without state there is no answer to:

> Is this sentence NCMP at all?

This profile implements the parent spec's idle / active split.

``` text
S → should U be interpreted as NCMP?
D → what kind of operation?
E → what class of object?
N → what argument?
```

The same `U` that is `GET CUSTOMER 42` when active MUST be
`NOT_NCMP` when idle, and also while the handshake is unfinished.

------------------------------------------------------------------------

## 2. Modes

``` text
S.mode ∈ { idle, ack_wait, ack_required, active }
```

Handshake is directional. Unsolicited ACK MUST NOT activate.

``` text
initiator                         responder
─────────                         ─────────
IDLE                              IDLE
  │ send PROBE                      │ recv PROBE
  ↓                                 ↓
ACK_WAIT                          ACK_REQUIRED
  │ recv ACK                        │ send ACK
  ↓                                 ↓
ACTIVE                            ACTIVE
```

``` text
idle         + send probe     →  PROBE          → ack_wait
idle         + recv probe     →  PROBE          → ack_required
idle         + other          →  NOT_NCMP       → idle
ack_wait     + recv ACK       →  ACK            → active
ack_wait     + other          →  NOT_NCMP       → ack_wait
ack_required + send ACK       →  ACK            → active
ack_required + send other     →  DECODE_ERROR   → ack_required
ack_required + recv           →  NOT_NCMP       → ack_required
active       + valid D,E      →  FRAME          (D, E, N evaluated)
active       + else           →  DECODE_ERROR
```

A probe or ACK MUST NOT execute an application frame.
`ack_wait` and `ack_required` are not active. Application
sentences there are conversation, not frames.

The later attachments `profile`, `session_id`, `nonce`, and
`sequence` belong on this machine. They are not in S1.

------------------------------------------------------------------------

## 3. Handshake must not use N

Probe and ACK detectors MUST NOT call `δ_N` or depend on a
residue. Otherwise the handshake smuggles six bits.

They are reserved token sets, disjoint from D cues, E
constructions, C6 poles, and C6 glaze:

``` text
PROBE_TOKENS = { compare, notes, usual }
ACK_TOKENS   = { aligned, briefing }
```

``` text
isProbe(U) = PROBE_TOKENS ⊆ tokens(U)
isAck(U)   = ACK_TOKENS ⊆ tokens(U)
```

Published examples (not the only strings that match):

``` text
PROBE  Shall we compare notes on the usual matter?
ACK    Yes we are aligned on that briefing.
```

Adding glaze that changes the letter-sum MUST NOT change
`isProbe` / `isAck`. A sentence with the same residue as the
probe but without those tokens MUST NOT be a probe.

------------------------------------------------------------------------

## 4. Exchange

``` text
Agent A                         Agent B
IDLE                            IDLE
   ─── probe ───────────────────>
        A: ack_wait
        B: ack_required
   <─── ack ────────────────────
        A: active
        B: active
          [NCMP ACTIVE]
   ─── ordinary sentence ───────>
        B: FRAME  GET CUSTOMER 42
```

The same application sentence before the handshake, or after
probe but before ACK, is `NOT_NCMP`.

------------------------------------------------------------------------

## 5. Pass and fail

PASSES if:

1. `isProbe` / `isAck` never read `N`;
2. probe variants with different residues all match as probe;
3. unsolicited ACK leaves the receiver idle;
4. recv probe → `ack_required`, not `active`;
5. send probe → `ack_wait`; only the matching ACK completes it;
6. the published GET CUSTOMER 42 sentence is `NOT_NCMP` in idle,
   `ack_wait`, and `ack_required`, and `GET CUSTOMER 42` in
   `active`;
7. a dinner sentence without D/E is `NOT_NCMP` in idle and
   `DECODE_ERROR` in active;
8. probe/ACK are not application frames.

FAILS if activation depends on a residue, if idle ever returns a
D/E/N frame, or if ACK alone activates an idle agent.

------------------------------------------------------------------------

## 6. What this does not claim

- six opcodes;
- integrity / replay;
- `session_id` / nonce / sequence;
- multi-turn compression;
- open-English capability probe;
- NCMP/2.0 §21.

``` text
npm run test:s1
```
