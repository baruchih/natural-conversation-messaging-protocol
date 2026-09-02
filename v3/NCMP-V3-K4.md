# NCMP-V3-K4

**Status:** V3 Experimental Result #12 — frozen\
**Date:** August 2026\
**Parent:** V3-K3 (Result #11, frozen)\
**Scope:** Overlapping three-turn windows. Shared clock.
K2 relation. Alternating closer. No camouflage. No D/E.

This profile is closed. The K branch stops here. Do not
combine H and K in the next experiment. `WindowProfile`
is session semantics, not payload and not lexicon.

------------------------------------------------------------------------

## 1. Question

K3 is one window. A is the closer.

> Can A and B alternately close overlapping three-turn
> windows, each targeting an independently chosen protocol
> value, while every new utterance simultaneously completes
> one frame and becomes state for the next?

------------------------------------------------------------------------

## 2. Window profile

Agreed after handshake. Not payload. Not `L`.

``` text
WindowProfile {
    width: 3
    stride: 1
    relation: K2
    speaker_pattern: alternating
}
```

Offset / warm-up is `width − 1 = 2`. The conversation is
the transport clock.

``` text
turn:       1     2     3     4     5     6
speaker:    A     B     A     B     A     B
            prime prime
                        F1    F2    F3    F4

W1 = [A1, B1, A2] → F1
W2 = [B1, A2, B2] → F2
W3 = [A2, B2, A3] → F3
W4 = [B2, A3, B3] → F4
```

Each closer solves K3’s residue on `(Uₙ₋₂, Uₙ₋₁)` and
emits `Uₙ`. Decoder state is the previous two accepted
turns.

``` text
targets: 42, 17, 63, 5
```

------------------------------------------------------------------------

## 3. Measurement

``` text
turn  speaker  N     role
1     A1       25    prime
2     B1        4    prime
3     A2       63    F1 = 42
4     B2       22    F2 = 17
5     A3       40    F3 = 63
6     B3       51    F4 = 5
```

Both peers keep the same transcript. Each closer solves
after seeing the previous two turns. `B2` closes `W2` and
seeds `W3`. After warm-up, one turn produces one frame.
Decoder memory is the previous two accepted turns.

> A conversational session can produce a continuous
> protocol stream from overlapping windows, with
> alternating participants closing successive frames and
> each accepted utterance simultaneously completing one
> frame and becoming state for the next.

Do not enlarge that.

``` text
P7:        frameₙ = δ(Uₙ, Sₙ)
early V3:  frameₙ = δ(Uₙ, Sₙ, Lₙ)
K4:        frameₙ = δ(Wₙ, Sₙ)
           Wₙ = sliding conversational window
```

`WindowProfile` is part of session agreement. Width,
stride, relation, and speaker pattern must match or the
peers will not agree which strings are the current frame.

------------------------------------------------------------------------

## 4. What this does not claim

- covertness;
- joint capacity;
- that H and K have been combined;
- NCMP/3.0.

``` text
npm run test:v3-k4
```
