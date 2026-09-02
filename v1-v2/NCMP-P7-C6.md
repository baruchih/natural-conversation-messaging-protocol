# NCMP-P7-C6

**Status:** Experimental Result #1 — frozen\
**Date:** August 2026\
**Parent:** NCMP/2.0\
**Scope:** Dimension C only (`N`). No opcode. No entity. No session.

This profile is closed. Do not raise the modulus, enlarge `N`, or
reopen the encoder design here. The next primitive is a one-bit
discourse dimension that must coexist with C6: `NCMP-P7-D1.md`.

------------------------------------------------------------------------

## 1. Purpose

This profile asks one question:

> Can an arbitrary 6-bit integer be carried by a published function
> of a natural English sentence, while the sentence remains ordinary
> conversation about an unconstrained topic?

It does **not** ask whether a human or a model can see `GET` or
`CUSTOMER` in the sentence.

``` text
                  U
            ┌─────┴─────┐
            ↓           ↓
      semantic plane   code plane
      (conversation)   (this profile)
            │           │
       plausibility     N(U) ∈ {0..63}
```

The semantic plane is not the instruction. It is the carrier wave.
`N` is linguistic modulation: measurable properties of the whole
utterance, not a sequential field and not a magic word.

`D`, `E`, `Q`, and `C` are out of scope. Section 13 `δ` is not
implemented here. The only decode map is:

``` text
δ_N(U) → {0, 1, …, 63}
```

`δ_N` is a total function of `U` alone. It does not read session
state. It is not a model.

------------------------------------------------------------------------

## 2. Alphabet and modulus

``` text
M = 64
argument n ∈ {0, 1, …, 63}
```

------------------------------------------------------------------------

## 3. Canonicalization

Before evaluation, implementations MUST apply these steps in order:

1. Unicode Normalization Form C (NFC);
2. map to lowercase using Unicode default case fold;
3. selected elements are the characters in the resulting string
   whose ASCII value is in `a`..`z`.

All other characters — spaces, punctuation, digits, marks, and
letters outside `a`..`z` — MUST be ignored by `N`. They MAY appear
in `U`.

Two utterances that yield the same selected letter sequence MUST
yield the same `N`.

------------------------------------------------------------------------

## 4. Letter values

``` text
value(a) =  1    value(n) = 14
value(b) =  2    value(o) = 15
value(c) =  3    value(p) = 16
value(d) =  4    value(q) = 17
value(e) =  5    value(r) = 18
value(f) =  6    value(s) = 19
value(g) =  7    value(t) = 20
value(h) =  8    value(u) = 21
value(i) =  9    value(v) = 22
value(j) = 10    value(w) = 23
value(k) = 11    value(x) = 24
value(l) = 12    value(y) = 25
value(m) = 13    value(z) = 26
```

Equivalently: `value(ch) = 1 + (code(ch) - code(a))` for
`ch` in `a`..`z`.

This is a published simple chronogram, not Abjad historical values.

------------------------------------------------------------------------

## 5. Carrier function

``` text
selected(U) = the letters a..z remaining after canonicalization
N(U)        = ( Σ value(ch) for ch in selected(U) ) mod 64
δ_N(U)      = N(U)
```

Every selected letter in the whole utterance contributes. There is
no anchor, no payload window, and no distinguished word.

An observer who knows this profile can compute `N` from any `U`.
They cannot read `n` from a single token.

------------------------------------------------------------------------

## 6. Generation

An encoder is given `n` and, optionally, a topic or a source
proposition `P`.

It searches for an utterance `U` such that:

``` text
δ_N(U) = n
AND well_formed(U) = true
AND if P is supplied: U ∈ F(P)
```

The language model, if used, is a proposer. A generated `U` that
fails `δ_N(U) = n` MUST be discarded. Generation success MUST NOT
be treated as proof of validity.

The reference encoder in `p7c6.ts` is not an LLM. It
searches a published slot grammar. That grammar is an implementation
detail of encode. `δ_N` does not consult it. Two implementations
that share only this document MUST still agree on `N(U)`.

Different encoders MAY emit different sentences for the same `n`.
Compatible decoders MUST still agree on `δ_N(U)`.

If no well-formed `U` is found, encode MUST fail. It MUST NOT
change `n` or silently widen `N`.

------------------------------------------------------------------------

## 7. Well-formedness (experiment)

For this experiment an utterance is well-formed only if all of the
following hold after stripping leading and trailing whitespace:

1. it contains at least six whitespace-separated tokens;
2. it ends with `.`, `!`, or `?`;
3. the canonicalized text contains no character `0`..`9`;
4. `selected(U)` has length at least 20;
5. it is a single sentence (no internal `.`, `!`, or `?` before
   the final character).

These rules keep `U` in the ordinary-sentence region. They are
part of the experiment, not a claim about all future profiles.

------------------------------------------------------------------------

## 8. Topics

The semantic plane MUST NOT be dictated by `n`. Encoders in this
experiment MUST be able to target at least these topics:

``` text
dinner
weather
software
insurance
travel
football
```

A topic is a conversational setting, not a field in the frame.
`δ_N` does not take a topic argument.

------------------------------------------------------------------------

## 9. Distinctness

Two well-formed utterances `U` and `V` are **distinct** when their
selected letter sequences differ.

They are **materially distinct** when they are distinct and their
whitespace-separated token sets (after canonicalization, stripping
the final `.` `!` `?`) have Jaccard similarity strictly less than
`2/3`.

------------------------------------------------------------------------

## 10. Pass and fail

### 10.1 Minimum (this implementation)

The profile implementation PASSES the minimum bar if and only if:

1. `δ_N` is implemented exactly as Sections 3--5;
2. for every `n` in `0..63` and every topic in Section 8,
   `encode(n, topic)` returns a well-formed `U` with `δ_N(U) = n`;
3. no encode result contains a decimal digit.

### 10.2 Target (the science)

The carrier is interesting only if, in addition:

4. for every `n` in `0..63`, there exist at least 20 materially
   distinct well-formed utterances with `δ_N(U) = n`;
5. those 20 are not confined to a single topic;
6. a human reader, given `U` alone and no profile, does not see
   an obvious numeric payload.

Criterion 6 is qualitative and is not decided by the test suite.

### 10.3 Semantic invariance

Topic coverage can cheat: the encoder may change what it says in
order to hit the modulus. The protocol needs the opposite:

``` text
visible proposition P   = fixed
hidden machine value n  = variable
```

Given a source proposition `P`, the encoder SHOULD produce a
well-formed `U_n` for every `n` in `0..63` such that:

``` text
δ_N(U_n) = n
AND  U_n ∈ F(P)
```

`F(P)` is a published paraphrase family of `P`. Membership in
`F(P)` is the semantic-equivalence threshold for this experiment.
`F(P)` MAY vary hedges, near-synonyms that keep polarity, and
optional time or place glaze. It MUST NOT change the predicate,
the polarity, or the poles of a contrast in `P`.

Example:

``` text
P = "The restaurant was good, but service was slow."

n =  0  →  U₀  ∈ F(P)
n =  1  →  U₁  ∈ F(P)
…
n = 63  →  U₆₃ ∈ F(P)
```

All sixty-four sentences communicate essentially the same visible
information. The only intended difference is `N`.

This is a harder question than Section 10.1:

> Can an existing conversational message carry six additional
> independent bits?

It is not part of the minimum bar. Failure of a given `F(P)` to
cover all residues is a measured result, not a license to widen
`N` or leave `F(P)`.

### 10.4 Fail

The profile FAILS if any `n` cannot be hit, if `δ_N` disagrees
between implementations on the same `U`, or if encode only succeeds
by emitting non-sentences, digit strings, or a single fixed skeleton
with a codebook word standing in for `n`.

------------------------------------------------------------------------

## 11. What this does not specify

- discourse opcodes (`D`);
- entity resolution (`E`);
- qualifiers (`Q`);
- integrity (`C`);
- session idle/active modes;
- the Section 21 `GET CUSTOMER 42` demonstration.

Those wait until this carrier is shown to exist.

------------------------------------------------------------------------

## 12. Reference implementation

Normative decode is this document. A reference encode/decode pair
lives in `p7c6.ts`. Tests live in `p7c6.test.ts`.

``` text
npm run test:c6
```

------------------------------------------------------------------------

## 13. Assumptions

1. Decode is the protocol. Encode is search. They need not have
   equal complexity.
2. The reference encoder is a published slot grammar, not an open
   language model. `δ_N` does not read that grammar.
3. For Section 10.3, semantic equivalence means membership in a
   published family `F(P)`. It is not an embedding score and not a
   model judge.
4. `F(P)` may hedge and synonym-swap. It must not flip polarity or
   the contrast in `P`.
5. Topic labels are conversational settings, not frame fields.
6. Node was not available in the environment that first measured
   these figures. Counts were produced by an independent replica of
   the same grammars and `δ_N`. Re-run `npm run test:c6` to confirm
   on a machine with Node.

------------------------------------------------------------------------

## 14. Results (August 2026)

`δ_N` of the Section 14 parent-spec worked sentence:

``` text
"What did we find when we looked at that account?"  →  33
```

Not 42. The carrier is not faked to the brochure example.

### 14.1 Topic invertibility (Section 10.1 and 10.2)

Every topic × residue pair encoded and decoded correctly. No digits.

  Topic        Family size (well-formed)   Residues hit
  ------------ --------------------------- --------------
  dinner       3776                        64 / 64
  weather      2400                        64 / 64
  software     2336                        64 / 64
  insurance    2336                        64 / 64
  travel       2352                        64 / 64
  football     2352                        64 / 64

Materially distinct sentences per residue, pooled across topics:
minimum 209. Section 10.2 criteria 4 and 5 pass under the Jaccard
rule. Criterion 6 (human suspicion) is not claimed.

Topic invertibility can change the story to hit `n`. That is why
Section 10.3 exists.

### 14.2 Semantic invariance (Section 10.3)

Each row is one source proposition `P`. Encode may only emit
members of `F(P)`.

  Source proposition P                                        F(P) size   Residues
  ----------------------------------------------------------- ----------- ----------
  The restaurant was good, but service was slow.              6480        64 / 64
  The rain will ease later, but the wind will stay up.        1620        64 / 64
  The build is stable, but the rollout is still noisy.         810        64 / 64
  The coverage looks clear, but the paperwork is slow.         810        64 / 64
  The flight was quiet, but the layover was tight.            3240        64 / 64
  The defense looked solid, but the second half was tired.     810        64 / 64

Examples from the first family:

``` text
P  = The restaurant was good, but service was slow.
n=0  → I thought the restaurant was good but service was sluggish during dinner.
n=42 → I thought the restaurant was good but the wait was sluggish last night.
```

### 14.3 Claim

We demonstrated a deterministic 6-bit carrier over natural-language
paraphrase families while holding the intended visible proposition
invariant.

We did not demonstrate natural-language machine communication, open
English invariance, an LLM proposer, human-rated naturalness, `D` or
`E`, or `GET CUSTOMER 42`.

The parent specification NCMP/2.0 is not changed by these results.

------------------------------------------------------------------------

## 15. Capacity frontier

The same six `F(P)` families were evaluated under

``` text
N_M(U) = letter_sum(U)  mod M
```

for `M ∈ {64, 128, 256, 512, 1024}` (6 through 10 bits). Decode is
unchanged except for the modulus. `F(P)` is unchanged. This is not
a new profile. It asks how far the C6 primitive stretches before
semantic invariance breaks.

A family PASSES `M` if and only if it hits every residue `0..M-1`.

  Family      |F(P)|   log₂|F|   unique sums   6b     7b      8b       9b       10b
  ----------- -------- --------- ------------- ------ ------- -------- -------- ---------
  dinner      6480     12.66     352           64/64  128/128 256/256  352/512  352/1024
  weather     1620     10.66     306           64/64  128/128 255/256  306/512  306/1024
  travel      3240     11.66     382           64/64  128/128 256/256  382/512  382/1024
  insurance    810      9.66     328           64/64  128/128 247/256  328/512  328/1024
  football     810      9.66     234           64/64  128/128 214/256  234/512  234/1024
  software     810      9.66     214           64/64  125/128 211/256  214/512  214/1024

`|F(P)|` overstates capacity. Many paraphrases collide on the same
letter-sum, so the effective alphabet is the unique-sum count
(214..382 here), not the sentence count.

### 15.1 Where it breaks

  Bits   All six families cover `M`?
  ------ --------------------------------
  6      yes
  7      no — software misses 3 residues
  8      no — only dinner and travel cover; weather misses 1
  9      no — none cover
  10     no — none cover; hit counts have already plateaued

Six bits is conservative for these families. Seven bits is the
first break. Eight bits is possible only for the larger, more
sum-diverse families. Nine bits is beyond every family tested:
the unique-sum ceiling is below 512.

### 15.2 What the curve is

The measurable quantity is no longer "can English carry
information?" It is:

> How many independent deterministic bits can a constrained
> paraphrase family carry while preserving its visible
> proposition?

For these six families and this letter-sum carrier, the empirical
answer is: **6 bits reliably; 7 bits for most; 8 bits for the
largest families; 9 bits for none.**

Open English and an LLM proposer remain untested. The next
generator experiment keeps `δ_N` and `P` fixed and only replaces
the slot grammar. See Section 16.

------------------------------------------------------------------------

## 16. P7-C6-LM (encoder only)

Do not raise the modulus further. C6 has shown what this letter-sum
carrier can teach us. The sum is a lossy projection: it throws away
order, syntax, and position. Capacity of `N` is not the capacity of
English.

P7-C6-LM replaces only the encoder.

``` text
keep:   P,  N = letter-sum mod 64,  δ_N,  6 bits
change: slot grammar  →  LLM proposer
```

Existence is already shown: this `P` has a 6,480-member `F(P)` that
covers all 64 residues. An LM miss is therefore a search failure,
not an existence failure. Do not raise the attempt cap to brute-force
a 1/64 random hit.

The proposer is a search operator. `δ_N` returns a signed modular
error. Hard poles of `P` are checked by token membership, not by a
model:

``` text
restaurant  ∈ {restaurant, place, kitchen}
service     ∈ {service, wait, staff}
good        ∈ {good, decent, solid, fine}
slow        ∈ {slow, sluggish, delayed}
contrast    ∈ {but, though, although, yet}
```

``` text
propose U
    ↓
reject immediately if well-formedness or poles fail
    ↓
N = δ_N(U)
    ↓
if N == target → ACCEPT
    ↓
error = signed_mod(target - N, 64)
    ↓
ask LM to minimally rewrite U
preserving poles
changing letter-sum by error
    ↓
repeat
```

Measure per iteration: `N`, modular distance, signed error, pole
accept/reject. The interesting plot is whether distance falls
(3 → 11 → 4 → 1 → 0) or bounces (3 → 51 → 17 → 40).

The model is not the decoder. It MUST NOT judge the numeric result.

``` text
# put OPENAI_API_KEY in .env
npm run test:c6-lm
```

Default run: the restaurant proposition, residues `0, 17, 42, 63`,
at most 8 proposals each. Override with `C6_LM_RESIDUES` and
`C6_LM_MAX_ATTEMPTS`. No LM results are recorded in this document
until that command has been run.

------------------------------------------------------------------------

## 17. P7-C6-HY (hybrid encoder)

Code owns arithmetic. The language model owns language. `δ_N` owns
truth.

The LM is not asked to invent a −1 letter-sum edit. From a
poles-valid seed `U` it (or a human) supplies linguistic freedom.
A deterministic editor searches published transformations whose
precomputed deltas satisfy

``` text
Σ delta(E)  ≡  target − N(U)   (mod 64)
```

Legal transformations are the Section 16 poles plus optional glaze
from `F(P)`:

``` text
glaze ∈ { ∅, last night, this evening, when we went,
          after we sat, once we arrived, during dinner }
```

``` text
LLM or seed → U  (poles must hold)
        ↓
     N(U),  Δ = target − N(U)
        ↓
deterministic edit search
        ↓
candidates {U'} all with δ_N(U') = target
        ↓
optional linguistic pick among candidates
        ↓
δ_N again — reject if the pick moved the residue
```

A single preferred substitution per residue is a codebook
(NCMP/1.0). The editor MUST return the set of legal realizations.
Measure `solutions_per_residue` and `edit_path_diversity`.

``` text
npm run test:c6-hy
```

------------------------------------------------------------------------

## 18. Closed

C6 established existence, determinism, semantic invariance inside
`F(P)`, complete 6-bit coverage, a practical hybrid encoder, and
many realizations per residue. Human naturalness is still not
claimed.

An NCMP encoder is a constrained search over semantic-equivalent
realizations, not a model that speaks a secret language and not a
cipher that turns data into English.

The next experiment is whether a second deterministic decoder `D`
can share the same `U` without destroying `N`, or being destroyed
by `N`-edits. That is `NCMP-P7-D1.md`. Do not continue this file.
