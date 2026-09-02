# NCMP-P7-I1

**Status:** Experimental Result #9 — frozen\
**Date:** August 2026\
**Parent:** NCMP/2.0 §13.5 (integrity / sequence)\
**Depends on:** S1, X1, C6, D1, E1 (frozen). Does not amend W1.\
**Scope:** Replay versus a fresh frame. Strings-only wire.
No `session_id`, nonce, or sequence token in `U`.

W1 stays a failure. This profile does not try to hide the
grammar. The limitation is part of the result: in-session
replay detection is real; cross-session authentication is an
information-budget failure, not a bug. Rewriting robustness
is next: `NCMP-P7-R1.md`.

------------------------------------------------------------------------

## 1. Question

X1 is a tiny stateful conversational protocol. W1 showed the
present language is not covert. The remaining thesis is A, not
B:

> Can natural-language utterances serve as the deterministic
> wire representation of a serious stateful machine protocol?

This profile asks one property:

> Can B distinguish a fresh valid conversational frame from a
> replay of a previously valid one, without putting conventional
> metadata alongside the sentence?

------------------------------------------------------------------------

## 2. Mechanism

The wire still carries `U` only. State is local.

``` text
transcript  = handshake strings, then each accepted U
bind        = letterSum(transcript) mod 64
seen        = exact strings already accepted
payload     = (δ_N(U) − bind) mod 64
```

The encoder hits `δ_N(U) = (payload + bind) mod 64` with C6-HY
on the published E1 seed. D and E are unchanged.

``` text
U in seen           →  REPLAY
valid D,E, not seen →  FRAME  GET CUSTOMER  payload
```

No digits, `session`, `nonce`, or `seq` in `U`.

------------------------------------------------------------------------

## 3. Exchange

``` text
A, B  handshake  (published probe, ACK)
A  →  U₁  encoded at bind₀
B     FRAME GET CUSTOMER 42
A  →  U₁  again
B     REPLAY
A  →  U₂  fresh realization encoded at bind₁
B     FRAME GET CUSTOMER 42
```

S1/X1 on the same replay still return a second FRAME. That is
the control: I1 is what changed.

------------------------------------------------------------------------

## 4. Recorded boundary

If two sessions use the identical handshake strings, bind₀ is
identical. The first-frame `U₁` then decodes as `GET CUSTOMER
42` in the second session. Six bits cannot carry an arbitrary
payload and authenticate the session. Cross-session replay is
therefore not solved here.

In-session exact replay is.

------------------------------------------------------------------------

## 5. Pass and fail

PASSES if the in-session exchange above holds, the wire is
strings-only, and S1 still accepts the replay.

FAILS if rejection requires a field beside `U`, or if a fresh
bound realization cannot recover 42.

------------------------------------------------------------------------

## 6. What this does not claim

- cryptographic integrity;
- cross-session replay protection;
- covertness (W1 remains NO);
- six opcodes;
- NCMP/2.0 §21.

I1 is frozen. The honest sentence:

> In-session, B can distinguish an exact replay from a fresh
> bound realization while the wire remains strings-only.
> Cross-session replay protection is not achieved.

Continue in `NCMP-P7-R1.md`. Semantic preservation by an
intermediary is not assumed to be protocol preservation.

``` text
npm run test:i1
```
