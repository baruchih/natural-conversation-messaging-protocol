# NCMP-C1

**Status:** YES. Selectivity supported by [NCMP-C1-D.md](NCMP-C1-D.md). Not the protocol.  
**Date:** September 2026  
**Parent:** [NCMP-Control.md](NCMP-Control.md)  
**Prior:** [NCMP-C0.md](NCMP-C0.md) YES  
**Name:** Bootstrap selectivity

C0 proved that exceptional control can exist. It did not prove that the C0 `P`/`T` witness is a good control code. Collision was explicitly not measured.

C1 is not a universal `X(K, state, U)` for PROBE, ACK, START, and FINISH. It is the bootstrap primitive. If PROBE can be recognized selectively, and `U_probe` can derive the ACK target, the rest of the control plane MAY cascade from the conversation. See [NCMP-Control.md](NCMP-Control.md).

This experiment does not map START or FINISH. It does not change `process`. It does not invent NCMP/3.0 or NCMP/4.0. It does not raise C6, change `wellFormed`, F1 tokens, F7 `next_mode`, F9 half3, or `k=50`.

The first construction is in `c1.ts`. `process` is unchanged. ACK is not a second pre-agreed initiator.

------------------------------------------------------------------------

## 1. Question

> Can a Profile-defined bootstrap discriminator recognize a deliberately generated PROBE with accidental activation ≤ `2⁻¹⁶`, while the recognized PROBE itself provides enough deterministic material to derive the ACK discriminator?

The only Profile-level exceptional namespace C1 MUST protect is bootstrap.

``` text
Profile bootstrap
       ↓
     PROBE          exact string U_probe
       ↓
  ACK target        T_ACK = F(control_seed, U_probe)
       ↓
      ACK           later. not scored here as START/FINISH
```

ACK recognition is derived, not a second pre-agreed surface. Encoder reachability of a natural PROBE is not C1. C1 is accidental activation plus derivability of `T_ACK`.

------------------------------------------------------------------------

## 2. Declared bar

The first C1 target is:

``` text
accidental PROBE  ≤  2⁻¹⁶
per ordinary utterance
```

Not because `2⁻¹⁶` is production-grade. Because it separates the two experiments:

``` text
C0     ~ 2⁻⁶      architectural witness
C1     ≤ 2⁻¹⁶     bootstrap-selectivity witness
```

For BODY, about `1/64` is acceptable. For a session-opening PROBE it is not.

------------------------------------------------------------------------

## 3. What is pre-agreed

The mistake is to pre-agree a phrase, or four control surfaces.

``` text
wrong
    PROBE = "compare notes on the usual..."
    Profile: PROBE, ACK, START, FINISH discriminators
```

The Profile carries a bootstrap rule. Provisional name for its entropy: `control_seed`. Not `INITIATOR`. Not `key`.

``` text
Profile {
    carrier
    code
    ACTION table
    RESOURCE table
    control_seed
    bootstrap rule
}
```

`control_seed` does not mean “if this phrase appears, it is PROBE.” It participates in computing whether an ordinary-looking `U` satisfies the bootstrap condition.

Once `U_probe` is recognized, both sides have that exact string. It is shared session material. No extra value has to cross the wire.

``` text
T_probe    = F(control_seed)
T_ACK      = F(control_seed, U_probe)
K_session  = F(control_seed, U_probe, U_ack)    C2, not scored
```

ACK is not a second pre-agreed initiator. A successful PROBE generates the ACK target.

------------------------------------------------------------------------

## 4. What C0 already showed

These can coexist without partitioning C6:

``` text
BODY identity
    C6(U)

CONTROL identity
    P(U) matched against T(state)
```

The C0 witness uses one 64-state projection and a state-only target. That collision rate is not a control code.

C0 remains: control status is not `U` alone. After C1, bootstrap status is `(Profile, U)`. After handshake, later controls are `(Profile, K_session, state, U)`.

------------------------------------------------------------------------

## 5. Requirements

1. **deterministic** — same Profile + same `U` → same bootstrap classification
2. **profile-dependent** — the same `U` MAY be PROBE under one Profile and ordinary under another
3. **orthogonal to C6** — PROBE MUST NOT simply mean `C6(U) = x`
4. **non-lexical** — no reserved word, phrase, or semantic construction
5. **ordinary preservation** — every C6 value remains attainable on the ordinary path
6. **selective** — accidental PROBE per ordinary utterance ≤ `2⁻¹⁶`
7. **derivable ACK target** — from the recognized `U_probe` and the Profile alone, both sides compute the same `T_ACK`

The C0 killer property, restated for bootstrap:

``` text
same U
Profile α → ORDINARY
Profile β → PROBE
```

State-flip remains legal to exhibit if the witness still uses shared state. It is not the C1 object. C1’s object is Profile bootstrap.

------------------------------------------------------------------------

## 6. Evidence

Declare these before scoring:

``` text
bootstrap X
Profile / control_seed
ordinary corpus     frozen before the first score
threshold           2⁻¹⁶
F                   how U_probe determines T_ACK
                    declared, not necessarily evaluated as a
                    second accidental-rate experiment
```

Then:

``` text
score ordinary U
        ↓
accidental PROBE rate
```

Do not assume projections are uniform. Measure against the frozen corpus.

Zero collisions in a few thousand utterances is not `≤ 2⁻¹⁶`. It is `0` observed in `N`.

Sufficient evidence for the rate is one of:

``` text
A   corpus large enough that the measured rate
    can support ≤ 2⁻¹⁶
B   a structural probability argument
    plus empirical checking on the frozen corpus
```

`B` is the expected path unless a much larger corpus is frozen first.

`T_ACK` derivability is shown by exhibiting `F(control_seed, U_probe)` as a total deterministic function. Accidental ACK rate is not this experiment.

------------------------------------------------------------------------

## 7. What this is not

C1 is not judged on naturalness of an encoder that *aims* at bootstrap.

It is not START or FINISH.  
It is not session-control derivation from `(U_probe, U_ack)`. That is C2.  
It is not a START-length experiment.  
It is not an optimization of the current token recognizers.  
It does not replace C6.  
It does not pre-agree control phrases.

------------------------------------------------------------------------

## 8. Close condition

C1 closes when one of these is written:

``` text
YES   bootstrap X meets §5
      accidental PROBE ≤ 2⁻¹⁶ under C1-D
      F(control_seed, U_probe) → T_ACK exhibited
```

C1 is YES. Distribution evidence is [NCMP-C1-D.md](NCMP-C1-D.md). Do not map START/FINISH in this note. Do not change `process`. C2 is next.

------------------------------------------------------------------------

## 9. First construction

Declared before the corpus was scored:

``` text
control_seed     0x9CA2C1C1
                 arbitrary 32-bit value
                 chosen before the corpus

P(U)             low 24 bits of FNV-1a 32
                 over the exact UTF-8 of U
                 not C6, not words

T_probe          control_seed & 0x00FFFFFF
                 = 0xA2C1C1

PROBE iff        P(U) = T_probe

T_ack            FNV-1a 24 of
                 seed_bytes || 0x00 || UTF-8(U_probe)
```

24 bits, not 16. The bar is `2⁻¹⁶`. Extra namespace costs BODY nothing. 32-bit `P` was tried first; finding one hitting `U` is then an expected-billion-step search. That is the encoder-side tradeoff, not a reason to shrink to 16.

Frozen corpus, then one score:

``` text
source     eval-uuid hike dialogue
           + Pride and Prejudice (Gutenberg 1342)
N          5289
hits       0
observed   0 / 5289
```

`0 / 5289` is not `≤ 2⁻¹⁶`. It is zero observed in `N`.

Selectivity is closed by [NCMP-C1-D.md](NCMP-C1-D.md): 58256 ordinary utterances, 256 predeclared seeds, distribution consistent with uniform 24-bit `P`. Accidental PROBE is treated as `≈ 2⁻²⁴`.

Deliberate hit. Not a naturalness claim:

``` text
U_probe    Let me know. 11941749.
P          0xA2C1C1
T_ack      0x78DB4F
           same at both peers
```

Same `U_probe`, seed xor 1 → not PROBE. The published lexical PROBE sentence is not PROBE under this seed.

``` text
pre-agreed
    control_seed
derived
    T_probe     ← seed
    T_ack       ← seed + U_probe
    K_session   ← seed + U_probe + U_ack     not scored
```

`npm run test:v4-c1`
