# NCMP V3

**Status:** Experimental program. Not a specification.\
**Parent:** P7 is closed and frozen. NCMP/2.0 is frozen.
These notes do not amend either.

P7 showed that a natural-language string can be the exact
serialized wire representation of a deterministic, stateful,
compositional machine protocol.

``` text
exact U  +  state S  →  δ(U,S)  →  frame
```

V3 asks whether the serialization language itself can be
negotiated and expanded through use, without an explicit
codebook.

``` text
NCMP/2.0          hypothesis
P7                evidence that serialization can be deterministic
V3                next experimental program
```

Convergence is protocol correctness. If both parties cannot
independently derive the same `Lₙ₊₁` from the same prior state
and accepted wire string, V3 has failed.

``` text
ΔL ≠ ΔC
capacity(Lₙ₊₁) must be measured, not assumed.
```

L1 (frozen): language is session state and can grow from
accepted traffic. `NCMP-V3-L1.md`

L2 (frozen): one evolution doubled `|F|`; published C6 did
not grow. `NCMP-V3-L2.md`

L3 (frozen): the frontier was already 8 bits and did not
move after one evolution. `NCMP-V3-L3.md`

L4 (frozen): the same `f` through complete closure still
did not move `C*`. Grammar exhausted at four constructions.
`NCMP-V3-L4.md`

The first adaptive-capacity hypothesis is closed. This toy
`f` is not extended to chase 512. There is no L5.

W2 (frozen, MIXED): lexical detectability unchanged (NB
1.00 / 1.00). Preference camouflage moved (16/16 → 12/16).
Dynamic `L` alone does not imply reduced detectability.
`NCMP-V3-W2.md`

``` text
this f:  convergence YES
         language growth YES
         capacity growth NO
         lexical camouflage NO
         preference camouflage SOME
```

Harvest, not invention. A session terminal need not mean
what English says.

``` text
δ(U, Sₙ)              → frame
g(U, frame, Sₙ)       → token at M
promote(token, frame) → L[frame.entity] += token | NONE
```

`sunset` can become CUSTOMER. That is an assignment, not
a paraphrase. Appearance in English is not a frame; the
token is a terminal inside the NCMP grammar. Payload `N`
must not be the index.

H1 (frozen): an arbitrary conversational token can become
a session-local protocol symbol, unrelated to English,
only in the E slot. `NCMP-V3-H1.md`

H2 (frozen): state-derived `g` over ten turns; payload
does not select. `NCMP-V3-H2.md`

W3 (frozen, NO): harvested terminals do not reduce the
signature. NB 1.00; LLM 13/16, not better than L4.
The dialect is the construction, not the word.
`NCMP-V3-W3.md`

The terminal hypothesis is closed. Construction harvest is
not started.

K1 (frozen): `N` can live in a turn relation. `B₁` did not
enter the arithmetic. `NCMP-V3-K1.md`

K2 (frozen): the value is jointly constituted; `B₁` is in
the arithmetic. `NCMP-V3-K2.md`

K3 (frozen): A can close one window after uncontrolled B.
`NCMP-V3-K3.md`

K4 (frozen): overlapping windows, one frame per turn after
warm-up, closer alternates. `NCMP-V3-K4.md`

The K branch stops here.

``` text
K1  information can live between turns
K2  both participants can contribute
K3  a closer can incorporate the other's turn
K4  overlapping windows are a continuous stream
```

``` text
H: vocabulary becomes conversational state
K: relationships between turns become protocol state
```

HK1 (frozen, Result #13): a previously harvested session
terminal can participate in a later rolling-window frame.
H supplies E. K supplies N. No singleton carries the
frame. `NCMP-V3-HK1.md`

HK2 (frozen, Result #14, YES): a rolling frame mutates
`L`; the next overlapping frame consumes that mutation.
Self-modifying conversational state machine. No HK3.
`NCMP-V3-HK2.md`

W4 (frozen, Result #15, YES): HK2 conversations from the
existing P7-family encoders remain unigram-distinguishable.
That is the encoder’s dialect, not a proof that rolling
windows must have one. `NCMP-V3-W4.md`

M1 (frozen, Result #16, PASS): an LM next turn can be
modulated into a valid window without the LM knowing the
residue. Neighborhood frozen. `NCMP-V3-M1.md`

W5: paired LM conversation vs the same conversation after
M1 modulation. `NCMP-V3-W5.md`

M2 (frozen, Result #17, PARTIAL): intent realization
widens the residue set vs paraphrase (22–38 → 33–39,
0/6 → 2/6). One enumerated batch of 50 does not cover
an arbitrary 6-bit target. `U` is a turn. Do not enlarge
`k`. `NCMP-V3-M2.md`

M3 (frozen, Result #18, PARTIAL): independent next-turn
sampling is more mode-seeking than enumeration.
Support 29–35 / 64, H ≈ 4.6–5.0 bits, 42–50 unique
turns. 5/6 is not the result. Do not enlarge draws.
`NCMP-V3-M3.md`

C1 (frozen, Result #19, PARTIAL): letter-sum discards
surface information; token count recovers some; ΔH is
only +0.20–+0.66. Do not hunt features. `NCMP-V3-C1.md`

A1 (frozen, Result #20, PARTIAL): independent
realizations accumulate (~10 bits); recorded windows
are prefix plus one free closer (~7.9 pooled).
`NCMP-V3-A1.md`

A2 (frozen, Result #21, PARTIAL): given exact A₂,
32 B₂ replies still give ~4.9 bits. The joint is
not identified. There is no A3. `NCMP-V3-A2.md`

Coding (frozen with F4): `rₙ = R(Hₙ)`,
`πₙ(V) → rₙ-bit symbol`,
`accept(U) ⇔ πₙ(V(U)) = next payload bits`.
Do not change `R`, `π`, or `accept`.
`NCMP-V3-Coding.md`

V4: Profile 0 locked. UUID run open.
`../v4/NCMP-V4-Baseline.md` `../v4/NCMP-V4-UUID.md`
