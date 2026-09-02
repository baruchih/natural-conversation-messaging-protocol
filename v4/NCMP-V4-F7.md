# NCMP-V4-F7

**Status:** V4 Experimental Result #7 — PASS, frozen\
**Date:** August 2026\
**Parent:** `NCMP-V4-Sparse.md`. F1 framing
(Result #1, PASS).\
**Scope:** Next-mode as conversational state.
No ID. No variable-rate code. No camouflage.
No LM.

This profile is closed. An accepted
conversational turn can deterministically
establish whether the following turn
contributes application payload, with both
participants deriving the same mode from
shared protocol state.

Payload status is a property of `(state, U)`,
not of `U` alone.

------------------------------------------------------------------------

## 1. Question

> Can one accepted natural turn deterministically
> tell both participants whether the next
> conversational turn is payload-bearing or not?

``` text
same U_SHARED
under SKIP → contributes nothing
under DATA → contributes 1
```

`V = 15` in both cases. Only inherited mode
differs.

------------------------------------------------------------------------

## 2. Published rule

After START the first body turn is `SKIP`.
`V = C6(U)`.

``` text
next_mode(V) = DATA  if V < 32
             = SKIP  if V ≥ 32

DATA bit     = V mod 2     only when current mode is DATA
```

Every turn advances protocol state. A DATA
turn contributes a bit and sets `next_mode`.
A SKIP turn contributes nothing and still
sets `next_mode`. There is no special control
utterance.

START and FINISH stay outside the body.

``` text
U_NEXT_DATA   V = 22 → next DATA
U_NEXT_SKIP   V = 38 → next SKIP
U_SHARED      V = 15
```

------------------------------------------------------------------------

## 3. Measurement

``` text
[U_NEXT_DATA, U_SHARED]  → U_SHARED is DATA  → 1
[U_NEXT_SKIP, U_SHARED]  → U_SHARED is SKIP  → ""
```

Both participants compute the same schedule.
No private coin.

``` text
body turn
    ↓
decode(current_mode, V)
    ↓
┌───────────────┬─────────────────┐
│ SKIP          │ DATA            │
│ no bits       │ contributes bits│
└───────────────┴─────────────────┘
        ↓
   establish next_mode
```

------------------------------------------------------------------------

## 4. Verdict

PASS.

Temporal sparsity is a primitive. Which turns
carry payload is conversational state. What a
DATA turn carries is a later question. Do not
attach `{0, 10, 11}` here.

------------------------------------------------------------------------

## 5. What this does not claim

- a useful argument;
- a self-delimiting variable-rate code;
- a long irregular schedule (F8, now Result #8);
- camouflage;
- a change to F1 START / FINISH;
- NCMP/4.0.

``` text
npm run test:v4-f7
```
