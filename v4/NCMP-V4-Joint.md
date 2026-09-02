# NCMP-V4-Joint

**Status:** Pause note. Not an experiment. Not a
specification. Not a chosen code.\
**Date:** August 2026\
**Parent:** F7 (Result #7, PASS). F8 (Result #8,
PASS). `NCMP-V4-Sparse.md`.\
**Scope:** How 64 observable C6 states can
jointly yield a DATA symbol and `next_mode`.
No partition is chosen. No LM. Code and geom
stay paused.

------------------------------------------------------------------------

## 1. What F7 and F8 changed

Temporal sparsity is established. Symbolic
coding is still open.

``` text
FRAME BODY
turn
 ↓
current mode
 ↓
┌──────────────┐
│ SKIP         │ → 0 payload bits
│ DATA         │ → symbolic codeword
└──────────────┘
 ↓
next_mode
```

The protocol decides both what a turn
contributes and what the conversation will
treat as payload next.

------------------------------------------------------------------------

## 2. The smaller alphabet

The earlier 14-class problem is not the
question anymore. On a DATA turn we need
only distinguish three payload symbols:

``` text
0
10
11
```

A SKIP turn consumes no payload at all.

The 64 C6 states can give those three
symbols a great deal of redundancy —
roughly 21 states each if allocated evenly
and `next_mode` were free.

`next_mode` is not free.

------------------------------------------------------------------------

## 3. Same V, two jobs

F7 spends the upper and lower half of `V`
on the transition:

``` text
V < 32   → next DATA
V ≥ 32   → next SKIP
```

If DATA decoding also partitions those same
64 states into `{0, 10, 11}`, two unrelated
cuts may fight. A turn that wants to send
`0` may be unable to choose the next mode,
or a turn that wants the next mode may be
unable to send `0`.

The unit is therefore one joint code:

``` text
V
 ↓
(bits, next_mode)
```

not two independent partitions of the same
circle.

------------------------------------------------------------------------

## 4. Six DATA outcomes

A DATA turn has exactly six labeled results:

``` text
(0,  DATA)
(0,  SKIP)
(10, DATA)
(10, SKIP)
(11, DATA)
(11, SKIP)
```

When current mode is SKIP, `V` determines
only the next mode.

``` text
SKIP → next DATA
SKIP → next SKIP
```

An even 6-way split of 64 is about 10–11
states per DATA outcome. That is less than
the 21-copy picture above, because those 21
copies were buying the symbol only.

SKIP does not take states away from DATA.
The same 64 residues are read twice: under
SKIP, only `next_mode`; under DATA,
`(bits, next_mode)`. The working invariant
is that those two readings agree on
`next_mode(V)`. Candidate maps live in
`NCMP-V4-J.md`. No map is chosen.

------------------------------------------------------------------------

## 5. The finite question

> How should the 64 observable C6 states be
> partitioned so that a DATA turn
> deterministically yields one of `{0, 10, 11}`
> plus the next mode, while a SKIP turn yields
> only the next mode, with enough redundancy
> left for natural-language selection?

Do not choose a partition in this note.
Do not score frozen F6 sets against a
layout. Do not reopen the 1–3-bit budget.

F4’s `R`, `π`, `accept`, and `k = 50` stay
frozen. F7’s published `next_mode` stays
the F7/F8 rule. A later experiment may
replace that cut with a joint map. That is
not done here.

------------------------------------------------------------------------

## 6. What this is not

- an experiment;
- a chosen partition;
- a change to F7;
- a return to the 14-class budget;
- F4’s `R` recalibrated;
- a camouflage result;
- NCMP/4.0.
