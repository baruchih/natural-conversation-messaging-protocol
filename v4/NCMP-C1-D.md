# NCMP-C1-D

**Status:** PASS. C1 YES. Not the protocol.  
**Date:** September 2026  
**Parent:** [NCMP-C1.md](NCMP-C1.md)  
**Name:** Bootstrap distribution  
**Code:** `c1d.ts` · `npm run test:v4-c1d`

The declared 24-bit `P` is mixed well enough on ordinary language to support accidental PROBE `≤ 2⁻¹⁶`. FNV is not claimed to be cryptographic. The bar is the weaker selectivity claim. Do not start C2 in this note. `process` is unchanged.

------------------------------------------------------------------------

## 1. Question

> Does the declared 24-bit `P(U)` behave sufficiently like a wide, well-mixed projection on ordinary language that the accidental PROBE probability can defensibly be bounded below `2⁻¹⁶`?

**Yes.**

``` text
namespace       2²⁴
required bar    2¹⁶
slack           256×
```

------------------------------------------------------------------------

## 2. Declared before scoring

`P` and `CONTROL_SEED` stay as in C1. `c1d.seeds.json` holds 256 random seeds, generated before this corpus was scored. They were not chosen against `P(U)`. `CONTROL_SEED = 0x9CA2C1C1` is an extra declared target.

------------------------------------------------------------------------

## 3. Frozen corpus

``` text
source     eval-uuid hike dialogue
           + 20 Project Gutenberg public-domain texts
N          58256
file       c1d.corpus.txt
```

Texts include Austen, Carroll, Shelley, Twain, Wells, Stoker, Dickens, Wilde, Stevenson, Baum, Barrie, Conrad, Brontë, Doyle, Melville, Hawthorne, Kafka. Raw dumps are not part of the experiment record.

------------------------------------------------------------------------

## 4. Distribution

One score. `c1d.score.json`.

``` text
unique P           58159
values with freq 2 97
max freq           2
pair collisions    97 observed / 101.1 expected
bit ones           0.4967 … 0.5034
χ² 256 bins        247.3  (df 255)
χ² 4096 bins       4031.7 (df 4095)
short U χ² 256     250.0  (n 14979, len < 80)
long U χ² 256      265.9  (n 19720, len > 160)
```

No 24-bit value occurs more than twice. Pair collisions match a uniform 24-bit draw. High bits are not concentrated. Short and long utterances are not in different regions.

------------------------------------------------------------------------

## 5. Predeclared targets

``` text
256 seeds          expected hits 0.89
observed hits      3
targets with a hit 3
max hits / target  1
CONTROL_SEED hits  0
```

Three singleton hits against random targets is a mild Poisson excess on `λ ≈ 0.89`. No target was hot. The C1 construction seed still has zero hits.

This is a test of the projection, not a search for a quiet seed.

------------------------------------------------------------------------

## 6. Bound

Under a roughly uniform 24-bit `P`,

``` text
Pr[P(U) = T]  ≈  2⁻²⁴  <<  2⁻¹⁶
```

The corpus is consistent with that. Even a tenfold local excess would remain `≈ 2⁻²⁰.⁷`, still under the bar. Nothing in §4–§5 looks like that kind of pile-up.

Path B: structural 24-bit width plus this empirical check. `0 / 5289` on the first C1 corpus is superseded as the selectivity argument. It remains a valid score of that smaller freeze.

------------------------------------------------------------------------

## 7. Close

``` text
PASS   accidental PROBE ≤ 2⁻¹⁶ is supported for this P
       → C1 YES
```

Do not map START / FINISH here. Encoder reachability is C2-A.
