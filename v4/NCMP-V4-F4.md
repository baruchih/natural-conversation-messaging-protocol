# NCMP-V4-F4

**Status:** V4 Experimental Result #4 — PASS, frozen\
**Date:** August 2026\
**Parent:** F3 (Result #3, PASS, frozen). Coding
note (`R`, `π`, `accept`). F1 START / FINISH tokens
are unchanged.\
**Scope:** An 8-bit argument through unchanged
natural turns into history-derived C6 bins. Not K4.
Not a six-bit target. Not a UUID.

This profile is closed. An application argument can
be transmitted through a variable-length framed
conversation by selecting unchanged natural turns
into deterministic history-derived carrier bins,
with both participants recovering the same bits
without requiring any turn to realize an exact
six-bit target.

The important thing is not `0xB6`. It is how it
got there.

`R`, `π`, `accept`, and `k = 50` are frozen with
this result. Do not enlarge `k`. Do not regenerate.
Do not send a UUID next.

------------------------------------------------------------------------

## 1. Question

> Can an 8-bit application argument be transmitted
> through a variable-length framed conversation by
> selecting unchanged natural turns into
> deterministic history-derived carrier bins, with
> both participants recovering the same bits and
> without requiring any turn to hit an exact six-bit
> target?

``` text
old:  bits → 42 → find sentence whose C6 = 42
new:  next bits → R(H) → 2^r bins → any natural U in bin
```

If `rₙ = 2` and the next bits are `10`, the speaker
does not need `C6(U) = 42`. They need

``` text
C6(U) mod 4 = 2
```

The accepted third turn had `C6 = 54`. `54 mod 4
= 2`, so it carries `10`. Nobody cares that the
underlying residue is 54.

Sixteen residues are acceptable. `rₙ` and `πₙ`
are known before the turn.

------------------------------------------------------------------------

## 2. A real code

The decoder does not need the encoder’s search
space. That is the property A2 said was missing.

``` text
Speaker                         Receiver
history + next bits             history + U
+ private LM candidates              ↓
        ↓                       r = R(H)
   select U                     π(V(U))
        ↓                            ↓
   send U unchanged                 bits
```

The receiver never needs to know that there were
50 candidates, which 49 were rejected, which model
generated them, or where in the list the winner
occurred. The candidate set is encoder
implementation, not protocol state.

Decode uses shared history plus the accepted `U`
alone.

------------------------------------------------------------------------

## 3. Frame

``` text
SESSION
   │ handshake
   ▼
ACTIVE
   │ START
   ▼
FRAME
   ├── natural U → variable bits
   ├── natural U → variable bits
   ├── natural U → variable bits
   └── …
   │ FINISH
   ▼
ARGUMENT
```

F1 established the frame. F3 established
declared-length reassembly. F4 replaces F3’s
forced six-bit chunks with natural variable-rate
symbols. K4 is not required. Relational windows
remain a proven V3 mechanism. The body can use
accepted turns directly.

``` text
tiny  →  8
Shall we begin this tiny round now?
argument = 10110110
```

------------------------------------------------------------------------

## 4. Search

Declared before the run. Same `k` as M2.

``` text
BATCH = 50
```

At each body turn the LM proposes 50 realizations
of a published visible intent. Code takes the first
`turnOk` `U` with `accept(U)`. That `U` is sent
unchanged.

``` text
NO_CANDIDATE
```

stops the frame. This run did not hit it. That
does not mean 50 candidates always contain the
bin.

------------------------------------------------------------------------

## 5. Measurement

One run. `gpt-4o-mini`. Do not regenerate.
Body: `v4/f4.sentences.md`.

``` text
10110110
START
   ↓
U1 → 1
U2 → 01
U3 → 10
U4 → 1
U5 → 1
U6 → 0
   ↓
FINISH
10110110 → 0xB6
```

``` text
turn  r  wanted  C6(U)  π(U)  recovered
1     1  1       13     1     1
2     2  01      37     01    01
3     2  10      54     10    10
4     1  1       39     1     1
5     1  1       35     1     1
6     1  0       24     0     0
```

``` text
sender bits    = 10110110
receiver bits  = 10110110
FINISH         → ARGUMENT
NO_CANDIDATE   no
unused intents 2
```

The six accepted turns are ordinary conversation,
not M1 arithmetic padding.

------------------------------------------------------------------------

## 6. Verdict

PASS.

This is the result where V4 becomes qualitatively
different from the forced-residue experiments.
Language is no longer asked to produce a number.

Can it work? Yes.

How often a natural opportunity contains an
acceptable realization at the history-derived rate
is a later question. An 8-bit success at `k = 50`
proves the mechanism. It says almost nothing about
reliability over a long frame.

------------------------------------------------------------------------

## 7. What this does not claim

- a UUID, or that 128 bits should be next;
- a bits-per-turn rate;
- that 50 candidates will always hit;
- a `NO_CANDIDATE` rate over many contexts;
- K4 inside the body;
- a change to F1 START / FINISH tokens;
- a raised C6 modulus;
- camouflage;
- NCMP/4.0.

``` text
npm run test:v4-f4
```
