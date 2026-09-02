# NCMP-V4-Terminate

**Status:** Pause note. Direction and Profile 0
final-bit map locked. Not a specification.\
**Date:** September 2026\
**Parent:** `NCMP-V4-Baseline.md`. Profile 0.\
**Scope:** Exact termination of an arbitrary
declared-length bitstring. No padding.
No fourth permanent codeword. No F11.

------------------------------------------------------------------------

## 1. Question

> How does an arbitrary declared-length
> bitstring terminate when the symbolic
> alphabet does not necessarily tile
> every finite bitstring?

START already declares the exact payload
length. The decoder knows `remaining`
before every owner-DATA turn.

------------------------------------------------------------------------

## 2. Direction

Length-aware final decoding. Framing,
not a new body code.

``` text
remaining ≥ 2
    V → {0, 10, 11}

remaining = 1
    V → {0, 1}
```

Not a terminal symbol. Not padding.
Not a new general alphabet.

------------------------------------------------------------------------

## 3. Profile 0 map

`next_mode` is already `V < 32 → DATA`.
The final bit does not reuse that cut.

``` text
FINAL(V) = V mod 2
even → 0
odd  → 1
```

Exactly 32 residues each. Orthogonal to
the half3 next-mode halves:

``` text
                 next DATA     next SKIP
final 0              16             16
final 1              16             16
```

Chosen because it is the clean 2×2 split
against the frozen half cut. Not because
F7’s toy DATA bit scored well.

``` text
symbol(remaining, V):
    remaining == 1  →  V mod 2
    else            →  half3_symbol(V)
```

`next_mode(V)` is unchanged.

------------------------------------------------------------------------

## 4. Every finite string tiles

``` text
1      FINAL(1)
101    10 | FINAL(1)
111    11 | FINAL(1)
01     0  | FINAL(1)
10110  10 | 11 | 0
```

`argument_bits = 0` is legal:
START, FINISH → `ARGUMENT("")`.

When the accumulator is full, later
owner-DATA is `PAYLOAD_COMPLETE`. The
frame stays open until the owner
FINISHES.

------------------------------------------------------------------------

## 5. What this is not

- padding;
- a fourth body codeword;
- a UUID;
- a naturalness claim;
- NCMP/4.0.
