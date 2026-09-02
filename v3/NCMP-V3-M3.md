# NCMP-V3-M3

**Status:** V3 Experimental Result #18 — PARTIAL, frozen\
**Date:** August 2026\
**Parent:** M2 (Result #17, PARTIAL, frozen).\
**Scope:** Same six contexts. Same six intents. Fifty
independent next-turn draws each. Texts frozen before
scoring. Do not regenerate. Do not enlarge `DRAWS`.

This profile is closed. Independent natural next-turn
sampling spans substantial but incomplete carrier state
under a fixed conversational intent. It is more
mode-seeking than explicit intent-level enumeration.
The result is the entropy, not the 5/6.

C1 asks whether letter-sum is throwing some of that
manifold away. Do not start multi-turn accumulation
until the carrier is measured.

------------------------------------------------------------------------

## 1. Question

M2 measured enumerated diversity:

> Give me 50 different ways A could continue.

M3 measured the sampling distribution:

> Does the model’s natural next-turn distribution itself
> span enough carrier states, or does diversity only
> appear when explicitly instructed to enumerate
> alternatives?

``` text
C + intent
   ↓
LM → U₁
C + intent
   ↓
LM → U₂
…
50 independent draws

NO seed U   NO NCMP   NO residue
NO other samples in context
NO “be diverse”
```

------------------------------------------------------------------------

## 2. Procedure

`U` is a turn (`turnOk`). Temperature 0.9. One HTTP call
per draw. Duplicate draws are kept: the histogram is
over samples.

------------------------------------------------------------------------

## 3. Measurement

One frozen batch. Scored once.

``` text
id  need  n   uniq  legal  residues  Hbits  hit
p1   26   50    43     50        32   4.82  yes
p2   34   50    50     50        35   4.98  yes
p3   39   50    48     50        29   4.69  yes
p4   18   50    45     50        33   4.88  yes
p5    1   50    42     50        29   4.61  no
p6   17   50    50     50        34   4.93  yes

hits 5/6
```

``` text
id  max  singletons  occupied
p1    5          19        32
p2    3          24        35
p3    4          15        29
p4    5          20        33
p5    4          18        29
p6    3          23        34
```

``` text
                    support     hits
M2-A paraphrase     22–38        0/6
M2-B enumerate      33–39        2/6
M3   sample         29–35        5/6
```

Independent sampling did not expand support. It
contracted it slightly. Unique texts are 42–50.

``` text
surface diversity       42–50 unique turns
        ↓
residue support         29–35 / 64
        ↓
empirical entropy       4.6–5.0 bits
```

The natural-language manifold is large. The projection
through `letterSum mod 64` collapses a lot of it.

5/6 is not more coverage. M2-B had greater support
(33–39). M3 happened to contain five of the six
particular K3 targets. With support near 32, that is
ordinary.

The M2 batch prompt was the wider search. Ordinary
next-turn sampling is more mode-seeking around a fixed
intent.

------------------------------------------------------------------------

## 4. Verdict

PARTIAL.

The constraint is not “can the LM generate enough
different sentences?” It can. The constraint is how
many distinct machine states naturally coexist with one
conversational intent, *as seen by this carrier*.

Do not enlarge `DRAWS`. Do not regenerate. Do not treat
5/6 as a reason to prefer sampling over enumeration.
Do not start variable-width / multi-turn accumulation
here. That is a later protocol question.

C1 uses this frozen corpus. No new sentences.

------------------------------------------------------------------------

## 5. What this does not claim

- that sampling beats enumeration for support;
- that 5/6 would repeat;
- that natural conversation cannot carry six bits;
- camouflage;
- a protocol that steers over several turns;
- NCMP/3.0.

Candidate text: `v3/m3.sentences.md`.

``` text
npm run test:v3-m3
npm run test:v3-m3-lm
```
