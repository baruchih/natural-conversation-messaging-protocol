# NCMP-V4-F9

**Status:** V4 Experimental Result #9 — PASS, frozen\
**Date:** September 2026\
**Parent:** F7, F8 frozen. `NCMP-V4-J.md`.\
**Scope:** One declared joint map on frozen
natural sets, then one short live sequence.
Not an ID. Not an 8-bit argument. `k = 50`
is not enlarged.

This profile is closed. A conversational turn
can jointly determine a variable-length
payload contribution and the payload status
of the following turn, with both participants
recovering the same sparse payload stream
from shared state and accepted turns alone.

The decoder is one function:

``` text
decode(modeₙ, Vₙ) → (bitsₙ, modeₙ₊₁)
```

not separate scheduling and coding.

------------------------------------------------------------------------

## 1. Question

> Can a natural conversational turn
> simultaneously contribute a variable-length
> payload codeword when in DATA state and
> deterministically establish whether the
> following turn is payload-bearing?

------------------------------------------------------------------------

## 2. Declared map

`half3`, for a principled reason: it is the
minimal lift from F7. Not because it scored
well. Not claimed as the eventual code.

``` text
F7/F8:  V < 32 → next DATA
        V ≥ 32 → next SKIP

half3:  same next_mode
        V mod 3 → {0, 10, 11}
```

------------------------------------------------------------------------

## 3. Offline gate

Frozen F6 candidate sets. Not used to
construct `half3`. 18/18 is not a
reliability rate.

``` text
DATA  6/6     18/18
DATA  mean    6.00 / 6
DATA  min     6
SKIP  2/2     18/18
```

`half3` was not obviously unusable. That is
the only use of this table.

------------------------------------------------------------------------

## 4. Live sequence

One run. Do not regenerate.

``` text
             today       tomorrow
U1  SKIP      —      →    DATA
U2  DATA      10     →    SKIP
U3  SKIP      —      →    DATA
U4  DATA      11     →    DATA
U5  DATA       0     →    SKIP
```

``` text
visible turns:  U1  U2  U3  U4  U5
mode:            S   D   S   D   D
payload:         —  10   —  11   0
argument stream: 10 | 11 | 0 = 10110
```

The receiver sees no candidate sets and
needs no separate rate or schedule
metadata.

------------------------------------------------------------------------

## 5. The model

``` text
state = {
    mode: SKIP | DATA,
    remaining_bits,
    accumulator
}
for each natural turn U:
    V = C6(U)
    if mode == SKIP:
        bits = ""
    else:
        bits = symbol(V)       // 0 | 10 | 11
    mode = next_mode(V)
    accumulator += bits
```

START initializes it. FINISH closes it.
`{0, 10, 11}` is prefix-free, so body turns
need no length field. A declared total
argument length still tells FINISH when
the application argument is complete.

------------------------------------------------------------------------

## 6. What this does not claim

- a complete application argument (F10);
- camouflage;
- that `half3` is optimal or generally
  reliable;
- a change to F7;
- NCMP/4.0.

``` text
npm run test:v4-f9
```
