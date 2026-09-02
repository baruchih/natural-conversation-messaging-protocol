# NCMP-V3-M2

**Status:** V3 Experimental Result #17 — PARTIAL, frozen\
**Date:** August 2026\
**Parent:** M1 (Result #16, frozen). W5 measured M1’s
adjunct neighborhood. This profile does not change it.\
**Scope:** Two generation tasks. Same `k = 50`. Same six
conversations. Do not enlarge `k`. Do not regenerate
Batch B.
Candidate text: `v3/m2.sentences.md`.

This profile is closed. Intent-level generation broadens
the reachable residue set relative to sentence
paraphrasing, but one 50-candidate enumerated batch does
not reliably cover an arbitrary 6-bit target. M3 asks
whether that limit is the model’s natural next-turn
distribution or an artifact of “give me 50 alternatives.”

------------------------------------------------------------------------

## 1. Two questions

Batch A asked the wrong one:

> Paraphrase this sentence.

That is the synonym manifold of `U`, not the realization
manifold of an intent. Residues stalled at 22–38. p3 and
p5 had zero legal candidates because P7 `wellFormed`
rejects a natural two-clause turn.

The question M2 actually measured:

> Can an LM generate a sufficiently diverse set of
> natural realizations of a conversational intent—not
> paraphrases of a seed sentence—such that deterministic
> selection can find the required K3 residue without
> modifying the selected turn?

``` text
conversation context
+
what A wants to communicate
        ↓
LM  {U₁ … Uₖ}
NO seed U   NO NCMP   NO residue   NO feedback
        ↓
code computes N(Uᵢ)
        ↓
select  ·  send unchanged
```

------------------------------------------------------------------------

## 2. What U is

In V3, `U` is an accepted conversational turn, not a
single P7 sentence. K4 already made the serialization
unit the turn inside a rolling window.

`N` ignores punctuation. The old `wellFormed` gate does
not. Batch B uses `turnOk`: same C6 carrier mins (tokens,
letters, no digits), internal `.!?` allowed.

``` text
"Oh nice! How was the vibe once they arrived?"
P7 wellFormed   NO
V3 turnOk       YES
```

P7 C6 is not amended.

------------------------------------------------------------------------

## 3. Measurement A — paraphrase of U

P7 `wellFormed`. Seed sentence in the prompt.

``` text
id  need  n   legal  unique residues  hit
p1   26   51    32         22         no
p2   34   57    57         38         no
p3   39   46     0          0         no
p4   18   48    49         31         no
p5    1   55     0          0         no
p6   17   53    54         31         no

hits 0/6
```

Valid for that task. Not the hypothesis.

------------------------------------------------------------------------

## 4. Measurement B — realizations of intent

No seed `U`. Diversity asked for because it is the task.
`turnOk`.

``` text
id  need  n   legal  unique residues  hit
p1   26   52    52         36         no
p2   34   56    56         39         no
p3   39   51    51         33         yes
p4   18   51    51         36         no
p5    1   54    53         34         no
p6   17   54    54         35         yes

hits 2/6
```

p3: `I hear you. Were there any dishes you would definitely want to order again?`

p6: `We could do a little research together this week to find another spot we both like.`

Both sent unchanged. p3 and p5 are no longer empty:
two-clause turns count.

``` text
sentence paraphrase     22–38 residues     0/6
intent realization      33–39 residues     2/6
```

The manifold got wider. It is still not 64.

Occupied residues are relatively flat (max 3–4). The
limit is support, not a few dominating states.

------------------------------------------------------------------------

## 5. What the candidates show

The prompt correction worked. p1’s intent was “react
briefly and ask a natural follow-up,” and the LM left
the seed sentence:

``` text
Was it a special occasion for you?
Who did you go with?
Did you have dessert, too?
How was the drink selection?
Did you have a reservation?
```

p6 moved from “lunch instead of dinner” to sushi, food
trucks, picnic, delivery, cafés, burgers. p6 hits.

The remaining constraint is the generation procedure.
Fifty alternatives in one response makes the model
enumerate conceptual clusters (food / atmosphere /
dessert / reservation; how long / how late / quick
visit). That is linguistic diversity under an
enumeration instruction, not the distribution of the
next turn the model would actually sample.

M2 therefore answers:

> How much residue coverage exists in one enumerated
> diversity batch?

It does not answer:

> What is P(N = r | context, intent) under ordinary
> next-turn sampling?

------------------------------------------------------------------------

## 6. Verdict

PARTIAL.

Intent-level generation is the right search. One
enumerated batch of 50 does not reliably hit an
arbitrary 6-bit target. Do not enlarge `k`. Do not
regenerate Batch B. Do not return to M1 adjuncts.

M3 samples, independently, from the same six contexts
and intents.

------------------------------------------------------------------------

## 7. What this does not claim

- that a larger `k` would finish the table;
- camouflage;
- an amendment to P7 `wellFormed`;
- NCMP/3.0.

``` text
npm run test:v3-m2
npm run test:v3-m2-lm
```
