# NCMP-V4-Eval-RE

**Status:** Closed battery. Encoder and
protocol fixed. Not a specification
amendment.\
**Date:** September 2026\
**Parent:** `NCMP-Baseline-Protocol.md`.
One 128-bit hike run already
completed. `NCMP-V4-Eval-UUID.md`\
**Scope:** Reliability and efficiency
of the existing encoder through the
specified protocol. `k = 50`.
`half3` unchanged.

------------------------------------------------------------------------

## 1. Question

> How reliably can the fixed encoder
> complete realistically sized
> arguments through the specified
> protocol without `NO_CANDIDATE`?

Efficiency is taken from the same
runs. Distinguishability is later.

------------------------------------------------------------------------

## 2. Milestone, already closed

Payload length is no longer a
demonstrated limitation of the
architecture. One 128-bit argument
was transported end to end.

That does not mean arbitrary length
is reliable. This battery asked
whether completion is repeatable
and what it costs in turns.

Do not amend the specification
because a cell fails.

------------------------------------------------------------------------

## 3. Why not 32 / 64 / 256

Profile 0 START declares only

``` text
empty  0
short  5
tiny   8
brief  24
wide   128
```

`NCMP-Baseline-Protocol.md`

32, 64, and 256 are not legal
frame lengths. Adding markers
would be a protocol change. This
battery does not do that.

``` text
sizes     8, 24, 128
```

------------------------------------------------------------------------

## 4. Declared battery

Fixed before live cells. Do not
change payloads, contexts, `k`, or
`half3` after seeing scores.

``` text
8    a = b6         b = 39
24   a = cafe01     b = 3d8e2a
128  a = eval UUID  b = 4a91c0e7-2f5b-48d3-9c16-7e0a3b5d8f21
```

``` text
hike     long script (128-capable)
dinner   market / cook  (8 and 24)
```

``` text
8-a-hike     8-a-dinner
8-b-hike     8-b-dinner
24-a-hike    24-a-dinner
24-b-hike    24-b-dinner
128-a-hike   already measured
128-b-hike
```

Ten cells. 128 uses hike only.
`128-a-hike` is the frozen UUID
evaluation. Do not regenerate it.
Do not regenerate any completed
cell. Do not add intents after
seeing incompletes.

Encoder, unchanged:

``` text
peer / owner SKIP    one natural U
owner DATA           k = 50, turnOk, required symbol
```

------------------------------------------------------------------------

## 5. Metrics

One row per cell.

``` text
completion
payload bits, body turns
owner / peer
owner DATA / owner SKIP
DATA opportunities / successes
candidates examined per DATA hit
bits per body turn
bits per owner turn
first failure (index, role, wanted)
unused intents
peer turns with digits
```

Owner-DATA success is the primary
reliability number. Peer continuity
is separate: a peer miss is not an
owner-DATA miss.

------------------------------------------------------------------------

## 6. Closed battery

All ten declared cells recorded.
`v4/eval-re.frozen.ts`

``` text
cell           result      DATA     have     bits/turn  unused
8-a-hike       ARGUMENT    5/5      8/8      0.296      325
8-a-dinner     ARGUMENT    5/5      8/8      0.421       49
8-b-hike       ARGUMENT    6/6      8/8      0.381      331
8-b-dinner     ARGUMENT    6/6      8/8      0.471       51
24-a-hike      ARGUMENT    17/17    24/24    0.289      269
24-a-dinner    INCOMPLETE  15/15    22/24    0.324        0
24-b-hike      ARGUMENT    16/16    24/24    0.320      277
24-b-dinner    INCOMPLETE  12/12    17/24    0.250        0
128-a-hike     ARGUMENT    88/88    128/128  0.409       39
128-b-hike     INCOMPLETE  82/82    124/128  0.352        0
```

### RELIABILITY

``` text
completed frames           7/10
owner-DATA hits            252/252
peer-continuity failures   0
NO_CANDIDATE               0
first incomplete cause     declared intents exhausted
```

The headline is not 7/10 by itself.
It is the decomposition:

``` text
protocol decode / state        held
owner constrained search       252/252
peer continuity                no failures
NO_CANDIDATE                   0
frame completion               7/10
three failures                 conversation budget exhausted
```

Carrier class was the worry after
M2/M3. It did not emerge as the
limit. Mean search 3.07, median 2,
p95 8, max 16. `k = 50` had
headroom. Ordinary `10` averaged
3.57.

The bottleneck is runway: whether
the conversation provides enough
turns before the script ends.
Dinner did not, at 24. Hike did
not, on the second 128. Do not
enlarge those scripts after seeing
this. `NCMP-V4-Runway.md`

### SEARCH COST

Candidates examined per owner-DATA
hit. Per-hit transcripts exist for
the 24-bit and 128-bit cells
(`n = 230`). The four 8-bit cells
record cell mean / max only.

``` text
n=230   mean=3.07   median=2   p95=8   max=16
```

``` text
class    n     mean    med    p95    max
0        119   2.92    2      8      16
10        51   3.57    2      9      14
11        58   2.93    2      7       8
FINAL0     1   1.00    1      1       1
FINAL1     1   6.00    6      6       6
```

`half3` gives ordinary symbols
roughly 21 residues each. The
final-bit decoder gives 32. `10`
is slightly more expensive than
`0` / `11` in this sample. FINAL
counts are `n = 1`. Not a
distribution.

Cell-level max, all ten:

``` text
8-a-hike 4     8-a-dinner 5
8-b-hike 12    8-b-dinner 6
24-a-hike 8    24-a-dinner 16
24-b-hike 8    24-b-dinner 13
128-a-hike 8   128-b-hike 14
```

Most hits sit at candidates 1–3.
The tail reaches 12–16. That is
not the 40–49 encoder. It is also
not the UUID run’s max 8 as a
bound. `k = 50` was not close.

### WIRE EFFICIENCY

Complete frames only.

``` text
bits / body turn     0.289–0.471
bits / owner turn    0.571–0.889
body turns / bit     2.13–3.46
```

The 128-bit complete run is 0.409.
It sits inside the four 8-bit
observations (0.296–0.471). 24-a
hike is 0.289, just under that
band. Not a “long frames become
progressively more expensive”
story on this sample.

0.3–0.5 bits/body-turn is the
sparse-schedule cost, not a byte
transport. Peer and owner-SKIP
turns are unconstrained. The
constrained fraction is
owner-DATA / body turns:

``` text
8-a-hike 5/27      8-a-dinner 5/19
8-b-hike 6/21      8-b-dinner 6/17
24-a-hike 17/83    24-b-hike 16/75
128-a-hike 88/313
```

------------------------------------------------------------------------

## 7. What this is

One successful UUID demonstration
plus six other complete frames.
Owner-DATA search did not fail
across ten cells, three sizes, two
payloads, and two scripts.

That is not yet evidence that the
encoder can repeatedly finish
arguments across contexts. Dinner
did not finish 24. Hike did not
finish the second 128. Those are
declared-budget stops.

Adding intents would ask whether
these frames finish if we
manufacture more conversation. We
already know that answer. The
useful result is that a predeclared
conversation has a finite natural
extent, and the payload may outlive
it.

``` text
24-a-dinner    ≥22 bits, <24
24-b-dinner    ≥17 bits, <24
128-b-hike     ≥124 bits, <128
```

Those are not clean capacity
bounds. They show the shape of
runway. `NCMP-V4-Runway.md`

Do not take this into
distinguishability on the strength
of 252/252 DATA hits. W wants
repeatable *completion* at a
roughly stable cost, not a search
that never misses while the script
runs out.

Do not add intents to convert the
three incompletes into ARGUMENT.

------------------------------------------------------------------------

## 8. What this does not do

- change the specification;
- enlarge `k`;
- change `half3`;
- add START lengths;
- measure camouflage;
- harden the transport.

``` text
npm run test:v4-eval-re
npm run test:v4-eval-re-lm
```
