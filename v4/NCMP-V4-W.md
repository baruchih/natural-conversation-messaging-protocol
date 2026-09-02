# NCMP-V4-W

**Status:** First W stopped.
Recorded. Not a specification.\
**Date:** September 2026\
**Parent:** `NCMP-V4-Capacity.md`.
Eval-C recorded, not expanded.\
**Scope:** Intent-paired,
job-skeleton W. Surface-paired
on the shelf. Do not invent a
task-complete judge. Do not amend
`NCMP-Baseline-Protocol.md`.

------------------------------------------------------------------------

## 1. Progression

``` text
P7      capacity of a sentence family
V3      capacity can depend on
        shared language / history
V4      capacity accumulates across
        conversation
RE      carrier search is not the
        observed bottleneck
Runway  conversation itself is the
        scarce resource
Eval-C  capacity depends on the
        particular conversation
```

``` text
natural runway × Profile 0 trajectory
        ↓
usable information budget
```

`NCMP-V4-Capacity.md`

A failure at W would not undo
that. It would measure the
observable cost of encoding
chosen information.

------------------------------------------------------------------------

## 2. Declared fork

``` text
primary     intent-paired at the
            conversational-job level
secondary   surface-paired, shelf
            until a local DATA-cost
            diagnostic is needed
```

Headline question:

> Holding purpose, conversational
> jobs, speaker sequence, turn
> count, and stopping point fixed,
> does the NCMP constraint leave
> an observable footprint?

The job skeleton is the control.
Do not freeze B’s words.

------------------------------------------------------------------------

## 3. Two effects, not one test

**Surface-paired** is an
encoding-treatment effect. Rewrite
minimum owner-DATA turns on a
frozen transcript. Downstream B
incoherence is unreal for a system
that would regenerate. Shelf.

**Intent-paired** is system-level
covertness. Same purpose, same N,
same jobs. Ordinary generator
versus NCMP-aware generator.

------------------------------------------------------------------------

## 4. First W, tiny

Search-complete Eval-C scenes
only. One CONTROL / TREATMENT
pair each. Not a statistical
covertness study. A first probe:
does an obvious footprint
reappear on naturally bounded,
intent-matched conversations?

``` text
weekend      6 turns    payload  2 bits
dinner      28 turns    payload 10 bits
technical   30 turns    payload  9 bits
```

Payloads fit already-measured
`C_encodable`. Declared before
pairs:

``` text
weekend     11
dinner      1011010010
technical   110010101
```

Wide START wrap, as in Eval-C.
No new START lengths. No FINISH
requirement. No UUID. No changing
N. No extra turns to make
encoding succeed. Collab stays
out.

Do not judge W by whether it
“passes.”

``` text
CONTROL ≈ TREATMENT
    no obvious footprint in this
    tiny probe
TREATMENT less natural
    observable cost of owner DATA
lexical detector only
    surface vocabulary / signature
preference judge only
    fluency cost without a simple
    lexical signature
```

None of those outcomes touches
the baseline, capacity, or
runway.

------------------------------------------------------------------------

## 5. Symmetry

CONTROL and TREATMENT differ only
by the NCMP constraint.

``` text
same model
same skeleton
same job prompt
same history shape
same sampling
```

The treatment generator is not
told to “sound natural despite
the constraint” unless CONTROL
gets the same sentence. Owner
DATA search selects among k
realizations of the same job.
The constraint is in selection,
not in extra prompting.

------------------------------------------------------------------------

## 6. Observers, first W

Declared before pairs. Do not
add a third after seeing them.

``` text
surface
    meanTokens
    meanChars
    ttr
    digitTurnRate
    bangTurnRate
    plus Jaccard of the pair
blind preference
    which seems less natural?
protocol-informed
    later, not first W
```

Provenance, not an observer:

``` text
owner-DATA constrained turns / N
```

Three tiny pairs are not a
covertness claim even if both
first observers fail.

------------------------------------------------------------------------

## 6a. Recorded pairs

Do not regenerate. Do not add an
observer. `v4/eval-w.frozen.ts`

``` text
scene       N   payload  DATA/N   bits   prefT
weekend     6    11      1/6      0/2    no
dinner     28    10b     6/28    10/10   no
technical  30     9b     6/30     9/9    no
```

``` text
intensity    0.167 / 0.214 / 0.200
jaccard      0.56 / 0.50 / 0.50
pref T       0 / 3
```

Weekend missed `11` at owner-DATA
U3. The skeleton still finished.
Dinner and technical placed their
payloads. Constrained turns:

``` text
weekend    U3
dinner     U5 U7 U9 U13 U15 U17
technical  U5 U7 U9 U11 U13 U19
```

Surface, CONTROL vs TREATMENT:

``` text
             tok     char     ttr    digit   bang
weekend   24.3/24.7  123/124  .53/.53  .50/.50  .83/1.0
dinner    28.8/28.2  152/148  .32/.32  .00/.00  .89/.86
technical 35.1/36.0  192/204  .30/.31  .00/.00  .10/.13
```

No obvious lexical collapse. The
preference judge never named
TREATMENT as less natural.

This is not CONTROL ≈ TREATMENT
as a covertness claim. It is
three tiny pairs, one a miss,
with no added observer.

Do not invent a coherence judge,
embedding detector, or stronger
classifier from this.

Narrow result:

> In three intent-paired,
> job-skeleton-controlled
> conversations, the declared
> surface statistics showed no
> obvious separation, and the
> blind preference judge did not
> identify TREATMENT as less
> natural in any pair.

Not “pretty covert.” n=3. Only
dinner and technical completed
the payload. Both arms are
visibly LM-generated; that
shared signature may dominate
the ~17–21% intervention.

``` text
within matched LM-generated
conversations,
~17–21% constrained-turn
intensity did not create an
obvious additional
surface / naturalness signature
in this probe
```

Surface-paired stays on the
shelf. There is no footprint to
diagnose.

This probe stops here.
`NCMP-V4-Checkpoint.md`

------------------------------------------------------------------------

## 7. What this does not do

- start surface-paired;
- invent a task-complete judge;
- expand Eval-C;
- change the specification;
- enlarge `k` or `half3`.

``` text
npm run test:v4-eval-w
```
