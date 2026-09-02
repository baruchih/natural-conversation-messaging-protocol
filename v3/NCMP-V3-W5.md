# NCMP-V3-W5

**Status:** Experimental profile\
**Date:** August 2026\
**Parent:** M1 (Result #16, frozen).\
**Scope:** Distinguishability of LM conversation vs the
same conversation after the frozen M1 neighborhood.
No A/B/C/D/E. No dinner-family encoder. Do not change
M1 adjuncts.

------------------------------------------------------------------------

## 1. Question

> Can an observer distinguish natural LM conversation
> from the same conversation after deterministic NCMP
> modulation?

``` text
conversation context C
        │
        ├── LM proposal U  → ordinary
        │
        └── same U → M1 modulate → U' → NCMP
```

The only systematic difference is the frozen modulator.

------------------------------------------------------------------------

## 2. Corpus

38 LM proposals. 35 modulated. First 32 successful
pairs. Prompts contain no residue. Raw `U` never already
carried the required closer residue.

``` text
mean depth    1.53
mean Jaccard  0.77
```

------------------------------------------------------------------------

## 3. Measurement

``` text
                 length   NB unigram   LLM
conversation       0.69      0.13      14/16
U vs U'              —         —       14/16
cheat δ            1.00
mean tokens    30.9 / 33.5
```

Length moves because adjuncts lengthen `U'`. That is
modulation, not a pairing bug.

NB on the three-turn text does not stay at W4’s 1.00.
Top protocol words are the frozen neighborhood:
`tonight`, `still`, `honestly`, `nobody` / `objects`.
The shared `A1`/`B1` prefix dominates the unigram, so
the classifier is weak. That is not covertness.

The preference judge is not weak. 14/16 on the
conversation and 14/16 on the closer: it prefers `U`
to `U'`. `if nobody objects`, `for now`, `in a quiet way`
are visible distortion.

``` text
W4  encoder-family conversations     NB 1.00
W5  LM conversation + M1 modulate    NB 0.13   LLM 14/16
```

The unigram signature of the old dinner encoder is gone.
The modulation vocabulary is still audible to a
preference judge. That is M1’s cost, measured.

------------------------------------------------------------------------

## 4. What this does not claim

- that NCMP is covert;
- a better adjunct list;
- M2 designed against this judge;
- NCMP/3.0.

``` text
npm run test:v3-w5
npm run test:v3-w5-lm
```
