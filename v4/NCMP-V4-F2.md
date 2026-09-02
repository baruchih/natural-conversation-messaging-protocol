# NCMP-V4-F2

**Status:** V4 Experimental Result #2 — PASS, frozen\
**Date:** August 2026\
**Parent:** F1 (Result #1, PASS, frozen). K4 (V3
Result #12, frozen).\
**Scope:** Ordered K4 observations inside an F1 body.
START and FINISH are unchanged. No action, resource,
or argument decode.

This profile is closed. A variable-length
conversational frame can accumulate the same ordered
sequence of deterministic rolling-window carrier
observations at both participants.

Frame delimiters are outside the carrier stream.
Changing framing does not silently contribute another
payload symbol.

------------------------------------------------------------------------

## 1. Question

> Can a variable-length conversational frame accumulate
> the same ordered sequence of deterministic K4 carrier
> observations at both participants?

``` text
START
A1
B1
A2    → 42
B2    → 17
A3    → 63
B3    → 5
FINISH

body         = [A1, B1, A2, B2, A3, B3]
accumulator  = [42, 17, 63, 5]
```

`accumulator_A == accumulator_B`.

K4 is not amended. Width 3, stride 1.

``` text
observations = max(0, body_turns − width + 1)
```

------------------------------------------------------------------------

## 2. Control

START and FINISH are framing control, not carrier
material. They must not enter a K4 window. Otherwise
the application boundary changes the payload.

``` text
accumulate(body)           the accumulator
accumulate(body + FINISH)  one extra observation
```

F2 uses the first.

------------------------------------------------------------------------

## 3. Measurement

``` text
body  obs  accumulator
  1    0   —
  2    0   —
  3    1   42
  4    2   42, 17
  6    4   42, 17, 63, 5
  9    7   42, 17, 63, 5, 11, 28, 51
```

Both participants agree. Six-turn body is the frozen
K4 stream. FINISH appended to the body would add one
observation; that extra value is not in the
accumulator.

A 1-turn or 2-turn body is a syntactically valid
frame with zero carrier observations. At width 3,
accumulation begins once enough body turns exist.

------------------------------------------------------------------------

## 4. Verdict

PASS.

``` text
F1   START / arbitrary-length BODY / FINISH
     → same frame
F2   START / BODY { W1→42, W2→17, W3→63, W4→5 } / FINISH
     → same ordered accumulator
```

------------------------------------------------------------------------

## 5. What this does not claim

- that `[42, 17, 63, 5]` is an application argument
  (F3);
- natural encoding of those residues (F4);
- a change to START / FINISH;
- a raised C6 modulus;
- camouflage;
- NCMP/4.0.

``` text
npm run test:v4-f2
```
