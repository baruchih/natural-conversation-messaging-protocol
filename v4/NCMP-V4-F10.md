# NCMP-V4-F10

**Status:** V4 Experimental Result #10 — PASS, frozen\
**Date:** September 2026\
**Parent:** F9 (Result #9, PASS). F4 START
`tiny` → 8. F3 declared length.\
**Scope:** One 8-bit argument through the F9
machine. Not a reliability battery. Not
camouflage. `half3` and `k = 50` are not
changed.

This profile is closed. A variable-length
sparse conversational frame can transmit
and reconstruct a complete application
argument, where only state-selected DATA
turns consume prefix-code symbols and
every accepted turn jointly determines the
future DATA/SKIP schedule.

V4 experiments stop here.
`NCMP-V4-Architecture.md`

------------------------------------------------------------------------

## 1. Question

> Can a framed sparse conversation transmit
> and reconstruct a complete application
> argument, where only state-selected DATA
> turns consume prefix-code symbols and all
> turns jointly determine the future
> DATA/SKIP schedule?

F4: every turn carries bits.
F9: sparse joint machine, no argument.
This is the composition.

------------------------------------------------------------------------

## 2. Declared payload

Same 8 bits as F4. Unique greedy parse:

``` text
10110110  =  10 | 11 | 0 | 11 | 0
```

Five DATA turns. SKIP turns do not advance
the cursor. Frame length is argument size
plus the evolving schedule. Sixteen
intents declared; unused stay unused.

`next_mode` is free. The encoder takes the
first legal SKIP turn, or the first legal
DATA turn whose symbol is the next prefix.

------------------------------------------------------------------------

## 3. Measurement

One run. Do not regenerate.

``` text
payload: 10110110
parse:   10 | 11 | 0 | 11 | 0
turn        S   S   D    D   S   D   D    D
payload     —   —   10   11  —   0   11   0
next        S   D   D    S   D   D   D    S
recovered: 10 | 11 | 0 | 11 | 0
         = 10110110
         = ARGUMENT
```

``` text
DATA/body  5 / 8
unused     8
```

Five codewords required eight
conversational turns. Both participants
reconstructed the argument from only
START, the accepted body, and initial
shared state. No rate field. No candidate
list. No predetermined DATA density.

------------------------------------------------------------------------

## 4. Verdict

PASS.

Frame length, broad equivalence classes,
and conversational payload status operate
together.

------------------------------------------------------------------------

## 5. What this does not claim

- camouflage;
- that `half3` is the eventual code;
- long-frame reliability;
- a UUID;
- integrity or replay protection;
- NCMP/4.0.

``` text
npm run test:v4-f10
```
