# NCMP-V3-Direction

**Status:** Pause note. Not an experiment. Not a specification.\
**Date:** August 2026\
**Parent:** L1–L4 and W2, all frozen.\
**Scope:** What a V3 evolution rule is. H1 is the first
harvest profile. This note still does not choose a hashed
`g`.

------------------------------------------------------------------------

## 1. Why stop

L1–L4 and W2 are enough to stop treating `f` as “something
deterministic that adds words.”

``` text
language growth  ⇒  capacity growth          NO
language growth  ⇒  reduced detectability    NO
```

`ΔL ≠ ΔC`. `ΔL ≠ Δ(surface)`. Both must be measured.

The L1 rule scores:

``` text
convergence              YES
language growth          YES
capacity growth          NO
lexical camouflage       NO
preference camouflage    SOME
```

Convergence remains protocol correctness. The others are
benefits, not entitlements.

------------------------------------------------------------------------

## 2. The mistake

We kept requiring the evolved lexicon to preserve ordinary
English semantics of CUSTOMER.

``` text
CUSTOMER = { that party, account holder, person involved }
```

That is formalizing the first language, not creating a
second one. A protocol symbol does not have to resemble
what it represents. HTTP’s GET is not intrinsically
retrieval. After a shared assignment:

``` text
sunset → CUSTOMER
```

is valid session semantics even if English says otherwise.

NP extraction, apposition, coreference, and “does this
phrase mean customer?” were solving a problem V3 does not
have.

------------------------------------------------------------------------

## 3. Three functions

``` text
δ(U, Sₙ)                 → frame
g(U, frame, Sₙ)          → token at deterministic M
promote(token, frame)    → ΔL | NONE
Lₙ₊₁ = Lₙ ∪ ΔL
```

`δ` answers what the message said.
`g` answers which surface token is under consideration.
`promote` answers whether that token is a safe new
terminal, and which class receives it.

Destination = `frame.entity`. Inheritance, not a classifier
on the token. Payload `N` is not the index.

``` text
δ(U, Sₙ) → GET CUSTOMER …
g → "sunset"
promote("sunset", CUSTOMER)
    if token ∉ reserved
    and token ∉ L
    and token is eligible:
        L.CUSTOMER += sunset
```

Example `g` only, not a formula:

``` text
M_evolve = H(canonical(frame) || H(Lₙ) || transcript_digest)
           mod word_count(U)
```

No “sunset means CUSTOMER” on the wire. After the turn,
`H(L₁ᴬ) == H(L₁ᴮ)` if `g`, eligibility, and destination
are deterministic.

------------------------------------------------------------------------

## 4. Dual language

``` text
                         "sunset"
                         /      \
             ordinary English    Lₙ
                    ↓             ↓
               SUNSET          CUSTOMER
```

The token is not rewritten globally. It becomes a valid
terminal inside the NCMP grammar.

``` text
English:     sunset → sunset
NCMP L₁:     E_CUSTOMER_TERM → "sunset"
```

“The sunset was beautiful.” can remain ordinary / not a
frame. A syntactically valid NCMP utterance with `sunset`
in the E position decodes CUSTOMER. Appearance is not
membership. Composition plus state already distinguish
the two uses.

------------------------------------------------------------------------

## 5. Why this is a different reservoir

L1 could only emit `that` + HEAD. W2 measured that dialect.

Harvest can attach protocol meaning to whatever the
conversation already contained: `sunset`, `coffee`,
`tomorrow`, `weather`. The session vocabulary is sampled
from the dialogue. That is a stronger camouflage
hypothesis than “dynamic vocabulary.” It is not proven.
W2 would have to be rerun. It is not a reason to choose
tokens against Naive Bayes.

Costs stay:

``` text
convergence
+ expressive diversity
+ carrier reachability
+ grammar complexity
+ surface distribution
```

Not maximize `|L|`. Evolution only when `promote` accepts.

------------------------------------------------------------------------

## 6. The remaining question

Not: does this phrase mean CUSTOMER?

``` text
Which surface tokens are safe to adopt as new protocol terminals?
```

Mechanical: reserved D/E/handshake cues, tokens already in
`L`, mutable C6 material, and whatever else would make `δ`
or `g` ambiguous. Not chosen here.

H1 (Result #6) solved token promotion. H2 (Result #7)
solved state-derived `g`. W3 (Result #8) closed the
terminal-camouflage hypothesis: dynamic words in a static
`Did we find <E>` shell do not move the unigram.

`L` is probably not only a symbol table.

``` text
Lₙ = {
    terminals,
    constructions,
    perhaps discourse forms,
    composition rules
}
```

Construction harvest is not started.

The K branch is closed at Result #12. Conversation can be
the serialization structure. `WindowProfile` is session
semantics.

``` text
Sₙ = { session, window_profile, previous turns, Lₙ, … }
Wₙ = window(Sₙ, Uₙ)
frameₙ = δ(Wₙ, Sₙ)
```

H supplies symbols from conversation. K supplies frames
from relations among turns. HK1 (Result #13) composed
them on one frozen window. HK2 (Result #14) showed that
one window’s `promote` changes the next overlapping
window’s `δ`. There is no HK3.

``` text
Wₙ + Sₙ → δ → frameₙ → g / promote → Sₙ₊₁ → Wₙ₊₁
Sₙ = { window_state, language Lₙ, … }
```

W4 (Result #15) showed that encoder-family HK2
conversations stay unigram-detectable. M1 (Result #16)
put the LM in front of the residue solve. That
neighborhood is frozen. W5 measured it. M2 (Result #17,
PARTIAL) showed that intent realization widens the
residue set versus sentence paraphrase, and that one
enumerated batch of 50 still misses an arbitrary 6-bit
target. Do not enlarge M2’s `k`. Do not regenerate
Batch B. M3 (Result #18, PARTIAL) showed that
independent next-turn sampling is more mode-seeking
than enumeration: 29–35 residues, H ≈ 4.6–5.0 bits,
42–50 unique turns. That is the entropy of the C6
projection, not a proof that conversation has only
five bits. C1 (Result #19, PARTIAL) showed that
letter-sum discards some surface information and that
token count recovers only a fraction of a bit. Stop
looking for the missing bit inside the sentence. A1
(Result #20, PARTIAL) showed that independent
realizations accumulate and that the recorded windows
had only one free turn. A2 (Result #21, PARTIAL)
showed that given exact A₂, 32 B₂ replies still
give ~4.9 bits. Do not open A3. The next problem
is the coding layer (`NCMP-V3-Coding.md`), not
another entropy. V4 direction: window ≠ frame
(`../v4/NCMP-V4-Direction.md`). Do not raise the
C6 modulus. Do not open K5. Do not open A3.

Token harvest is `position → token`. Construction harvest
must decide what is fixed and what is a slot. That step
can become interpretation. Do not open a profile until
the rule is mechanical. Do not open K5.

------------------------------------------------------------------------

## 7. What this is not

- a hashed `g` other than H2’s;
- a construction-harvest experiment;
- HK3;
- detector-chasing;
- NCMP/3.0.
