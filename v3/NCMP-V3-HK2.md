# NCMP-V3-HK2

**Status:** V3 Experimental Result #14 — YES, frozen\
**Date:** August 2026\
**Parent:** HK1 (Result #13, frozen). H2 `g` and K4 clock
unchanged.\
**Scope:** Two overlapping windows. Start at `L₀`. W1
harvests `X`. W2 consumes `X`. No camouflage.

This profile is closed. There is no HK3. The next
experiment is W4: conversation-level distinguishability
after the frame left a single sentence.

------------------------------------------------------------------------

## 1. Question

> Can a rolling conversational frame mutate the session
> language, and can the immediately following overlapping
> frame consume that mutation while both peers stay
> synchronized?

HK1 started with `sunset` already in `Lₙ`.
HK2 starts without the terminal.

------------------------------------------------------------------------

## 2. Clock and ordering

``` text
          W1
     ┌───────────┐
A1 → B1 → A2 → B2
          └───────────┘
               W2
```

A2 belongs to both windows. The language version does not.

``` text
W1 decoded under Lₙ
W1 transition produces Lₙ₊₁
W2 decoded under Lₙ₊₁
W2 transition produces Lₙ₊₂
```

``` text
A1 → B1 → A2
            │
            ├── F1 = δ(W1, Lₙ)
            └── X = g(...); Lₙ₊₁ = promote(X, F1)
       B1 → A2 → B2
                    │
                    └── F2 = δ(W2, Lₙ₊₁)
```

`g` is H2’s. Eligibility is H1’s. Destination is the
window frame’s E, not H1’s `find` slot. Otherwise A2
would need `find that party`, `that party` would leak
into W2, and the killer control would be impossible.

------------------------------------------------------------------------

## 3. Killer control

Arbitrary harvested terminal `X`.

``` text
δ(W1, Lₙ)     → valid F1
δ(W2, Lₙ)     → E = NONE
δ(W2, Lₙ₊₁)   → E = CUSTOMER
```

Both peers end with identical `H(L)`, frames, and
transcript.

------------------------------------------------------------------------

## 4. Measurement

``` text
X = decent
L₀ = { that party }
L₁ = { decent, that party }

A1  GET   NONE  N=32  Did that party arrive late at the restaurant after dinner last night?
B1  ALLOW NONE  N=35  Confirm the restaurant was good but service was slow around sunset.
A2  GET   NONE  N=39  Did we find the restaurant was decent but service was sluggish this evening?
B2  ALLOW NONE  N=13  Confirm the restaurant was good but service was sluggish around sunset during dinner.

W1 / L₀   GET   CUSTOMER  42     (39 − 32 + 35) mod 64
W2 / L₀   E = NONE
W2 / L₁   ALLOW CUSTOMER  17     (13 − 35 + 39) mod 64

H(Lᴬ) == H(Lᴮ)
frames = [GET CUSTOMER 42, ALLOW CUSTOMER 17]
```

``` text
W1 / L₀  → GET CUSTOMER 42
             │
             └─ harvest "decent"
                    ↓
          L₁ = {that party, decent}
W2 / L₀  → E = NONE
W2 / L₁  → ALLOW CUSTOMER 17
```

Same W2. Only the language state changed.

`decent` occurs in A2, which belongs to both windows:

``` text
          W1
A1 ─ B1 ─ A2 ─ B2
          └─────── W2
           ↑
       "decent"
           │
W1 harvests it
           │
           ↓
W2 interprets it
```

No `find sunset`. No singleton is GET CUSTOMER 42.

------------------------------------------------------------------------

## 5. Claim

> A rolling conversational frame can mutate the session
> language, and the immediately following overlapping
> frame can consume that mutation while both participants
> remain synchronized.

No more than that. First self-modifying conversational
state machine in V3, not merely compatible mechanisms.

``` text
Wₙ + Sₙ
   ↓
δ
   ↓
frameₙ
   ↓
g / promote
   ↓
Sₙ₊₁
   ↓
Wₙ₊₁
```

``` text
Sₙ = {
    window_state,     // previous accepted turns
    language Lₙ,      // session symbol table
    ...
}
```

The window produces a frame. The frame changes the
language. The changed language alters the next
overlapping window.

``` text
P7     fixed language, single-string frames
H      conversation mutates the session symbol table
K      conversation relationships carry protocol information
HK1    dynamic symbols and rolling frames compose
HK2    frameₙ changes state that changes interpretation of frameₙ₊₁
```

Continue in `NCMP-V3-W4.md`. There is no HK3.

------------------------------------------------------------------------

## 6. What this does not claim

- camouflage;
- construction harvest;
- that `X` was chosen for English meaning;
- NCMP/3.0.

``` text
npm run test:v3-hk2
```
