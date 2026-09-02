# NCMP-P7-X1

**Status:** Experimental Result #5 — frozen\
**Date:** August 2026\
**Parent:** NCMP/2.0\
**Depends on:** C6, D1, E1, S1 (Results #1–#4, frozen)\
**Scope:** One recorded two-agent exchange. No new semantics.
No six-opcode alphabet. No integrity.

This profile is closed. It demonstrates the narrow construction
over a strings-only channel. It does not choose the next
experiment. The sequence of results is recorded in
`NCMP-P7-Findings.md`. Do not enlarge `D` from here.

------------------------------------------------------------------------

## 1. Purpose

S1 is a handshake. This experiment only uses it.

Two independent participants share published decoders and an
open channel of ordinary-language strings. They share no session
object. After the published probe and ACK, the published E1
sentence is a frame. Before that handshake, it is conversation.

``` text
Two independent participants establish conversational protocol
state and subsequently exchange an ordinary-language utterance
that the receiver deterministically reconstructs as GET CUSTOMER 42;
the identical utterance outside that state is ordinary conversation.
```

------------------------------------------------------------------------

## 2. Channel

``` text
deliver(A, B, U) = A.send(U); B.receive(U)
```

The wire carries `U` only. Residues, modes, and frames never
cross the channel.

------------------------------------------------------------------------

## 3. Control

Both agents idle. A sends the published GET CUSTOMER 42 sentence.

``` text
A IDLE  "Did we find the restaurant was decent but
         service was slow for that party?"  →  B IDLE
                    ↓
                NOT_NCMP
```

------------------------------------------------------------------------

## 4. Exchange

``` text
Agent A                           Agent B
IDLE                              IDLE
"Shall we compare notes
 on the usual matter?"
       ───────────────────────────→
                                  PROBE → ack_required
       ←───────────────────────────
"Yes we are aligned
 on that briefing."
ACTIVE                            ACTIVE
"Did we find the restaurant
 was decent but service was
 slow for that party?"
       ───────────────────────────→
                                  δ_D = GET
                                  δ_E = CUSTOMER
                                  δ_N = 42
                                  FRAME:
                                  GET CUSTOMER 42
```

A sentence delivered after probe and before ACK is still
`NOT_NCMP`. `ack_required` is not a session.

------------------------------------------------------------------------

## 5. Pass and fail

PASSES if the control is `NOT_NCMP`, the handshake follows S1,
and the same `U` after ACK is `GET CUSTOMER 42`.

FAILS if the agents share a session object, if new tokens or
decoders appear, or if the control also decodes as a frame.

------------------------------------------------------------------------

## 6. What this does not claim

- six opcodes;
- integrity / replay;
- `session_id` / nonce / sequence;
- open English;
- NCMP/2.0 §21.

This is three composed primitives plus a handshake, demonstrated
by two participants on an ordinary channel.

``` text
npm run test:x1
```
