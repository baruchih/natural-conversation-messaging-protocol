# NCMP-V4-F3

**Status:** V4 Experimental Result #3 — PASS, frozen\
**Date:** August 2026\
**Parent:** F2 (Result #2, PASS, frozen). F1 START /
FINISH tokens are unchanged.\
**Scope:** Reassembly of a declared bit count from the
forced K4 stream. Not natural encoding. Not a UUID.

This profile is closed. A framed conversation can
declare an argument length at START and
deterministically reassemble that argument at FINISH
from the ordered carrier observations accumulated in
its body.

Nothing in the result depends on natural encoding or
a UUID.

------------------------------------------------------------------------

## 1. Question

> Can START declare how many argument bits this frame
> will carry, and can FINISH deterministically
> reconstruct those bits from the accumulated
> observations?

The experiment uses the already-proven forced K4
stream. It tests framing semantics, not natural
encoding.

``` text
argument = 0xA91FC5

101010  010001  111111  000101
   42      17      63       5

accumulator = [42, 17, 63, 5]
decode6(accumulator)
  → 101010010001111111000101
  → 0xA91FC5
```

START establishes `argument_bits = 24`. FINISH
asserts only that the frame is complete.

------------------------------------------------------------------------

## 2. Declaration

F1 `isStart` is still `begin` + `round` + `now`.
F3 adds one published marker token. The marker is
not C6 residue `N`.

``` text
brief  →  24
```

``` text
Shall we begin this brief round now?
```

An F1 START without the marker declares no bit
count (`UNDECLARED`). FINISH is unchanged:
`Let us close this round here.`

``` text
need = ceil(argument_bits / 6)
```

Twenty-four bits need four observations, so a
six-turn body.

------------------------------------------------------------------------

## 3. Reconstruction

``` text
START
  argument_bits = 24
BODY
  W1 → 42
  W2 → 17
  W3 → 63
  W4 → 5
FINISH
  → 0xA91FC5
```

START and FINISH contribute no bits. The
accumulator is still `accumulate(body)`.

``` text
obs < need   INCOMPLETE
obs > need   OVERFLOW
obs = need   ARGUMENT
```

OVERFLOW does not silently keep the first four
chunks. Extra observations after the declared
length are an error.

------------------------------------------------------------------------

## 4. Measurement

``` text
FINISH after [42, 17, 63]     INCOMPLETE
extra observation             OVERFLOW
change one body turn          argument changes
same frame at A and B         identical argument
START / FINISH                no bits
undeclared START              UNDECLARED
```

The F1 frame may still close. Reassembly is a
second verdict on the same `{ start, body, finish }`.

------------------------------------------------------------------------

## 5. Verdict

PASS.

``` text
F1   framing
     START → variable body → FINISH
F2   accumulation
     body → [42, 17, 63, 5]
F3   reassembly
     declared 24 bits + [42,17,63,5]
          → 101010010001111111000101
          → 0xA91FC5
```

Frame length can absorb argument length. The
remaining problem is not reassembly. It is
encoding: mapping application bits onto a natural
conversational body whose carrier observations F3
already knows how to read.

That encoding question is the paused V3 coding
note, not this result.

------------------------------------------------------------------------

## 6. What this does not claim

- natural or variable-rate encoding (F4);
- that every turn must equal a chosen 6-bit value
  in ordinary conversation;
- a UUID;
- a change to F1 START / FINISH tokens;
- a raised C6 modulus;
- camouflage;
- NCMP/4.0.

``` text
npm run test:v4-f3
```
