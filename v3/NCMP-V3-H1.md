# NCMP-V3-H1

**Status:** V3 Experimental Result #6 — frozen\
**Date:** August 2026\
**Parent:** V3-Direction. Does not amend L1–L4 or W2.\
**Scope:** One harvest. One published index. One class.
No hash `g`. No camouflage. No capacity. No second evolve.

This profile is closed. A token can acquire session-local
protocol meaning unrelated to English. Do not strengthen
that claim. `g` is still a published constant. Solving `g`
is `NCMP-V3-H2.md`.

------------------------------------------------------------------------

## 1. Question

> Can an arbitrary surface token selected deterministically
> from an accepted frame become a new session terminal for
> that frame’s entity class, with both participants
> converging and without an explicit assignment crossing
> the wire?

------------------------------------------------------------------------

## 2. Setup

``` text
L₀.CUSTOMER = { "that party" }

U₁ = "Did we find that party before sunset?"
g(U₁) = token position 7 = "sunset"     published, not hashed
```

`U₁` is GET CUSTOMER under `L₀`. On this exact string
`δ_N = 36`. H1 does not retune the sentence to 42.

``` text
eligible(token) =
    alphabetic
    AND token ∉ reserved
    AND token ∉ any existing L construction or its words

reserved = D cues ∪ E lexicons ∪ handshake ∪ E-slot cue `find`
destination = frame.entity = CUSTOMER
```

E is the construction immediately after `find`. That is the
smallest slot that makes appearance ≠ membership.

------------------------------------------------------------------------

## 3. Killer and controls

``` text
U₂ = "Did we find sunset before dinner?"

δ_E(U₂, L₀) → NONE
δ_E(U₂, L₁) → CUSTOMER
H(L₁ᴬ) == H(L₁ᴮ)
```

`sunset` has no ordinary-language relationship to CUSTOMER.
No “sunset means CUSTOMER” is on the wire.

``` text
g selects party     → L unchanged
g selects did       → L unchanged
"The sunset was beautiful last night after dinner."
                    → NONE under L₁
```

------------------------------------------------------------------------

## 4. Measurement

``` text
g(U₁, 7) = sunset
promote → harvested
L₁ = { sunset, that party }
H(L₁ᴬ) == H(L₁ᴮ)

U₂ / L₀ → NONE
U₂ / L₁ → CUSTOMER

party (pos 5) → no change
did   (pos 1) → no change
"The sunset was beautiful last night after dinner." / L₁ → NONE
```

> An accepted conversational token can acquire a
> deterministic session-local protocol meaning unrelated to
> its ordinary-language meaning, without an explicit
> codebook assignment crossing the wire.

Do not strengthen that. The second meaning exists only in
the grammar: ordinary appearance of `sunset` is NONE; `find
sunset` is CUSTOMER. `L` is a session symbol table, not a
synonym dictionary.

Continue in `NCMP-V3-H2.md`.

------------------------------------------------------------------------

## 5. What this does not claim

- covertness;
- capacity;
- a hashed selector;
- NCMP/3.0.

``` text
npm run test:v3-h1
```
