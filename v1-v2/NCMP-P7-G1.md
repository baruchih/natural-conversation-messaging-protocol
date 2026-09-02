# NCMP-P7-G1

**Status:** Experimental Result #7 — frozen\
**Date:** August 2026\
**Parent:** NCMP/2.0\
**Depends on:** C6-HY, D1, E2 (frozen). Does not amend S1 or X1.\
**Scope:** LM generation into a published deterministic language.
The LM does not decode. The LM does not search `N`.

This profile is closed. The result is PARTIAL, including the
free-condition failure. Detectability of the surface, not
secrecy of `N`, is `NCMP-P7-W1.md`.

------------------------------------------------------------------------

## 1. Question

E2 made `E` a grammar of several constructions, not one pair.
The next objection is that someone still has to write those
sentences. This profile asks:

> Can an LM generate novel, natural utterances satisfying a
> published deterministic grammar without being given a complete
> surface sentence and without participating in decoding?

It does **not** ask the model to “write something that means
CUSTOMER” and then take human or model agreement as truth.

``` text
        LM proposes U
              │
       D=GET, E=CUSTOMER ?
              │
              ▼
        deterministic C6-HY
              │
              ▼
             N = 42
              │
              ▼
         δ_D  δ_E2  δ_N
```

The LM never gets to say whether it succeeded.

Models create linguistic freedom. Deterministic code selects
machine-valid states.

------------------------------------------------------------------------

## 2. What the LM is not allowed to do

- decide `D`, `E`, or `N`;
- receive `N = 42` or a letter-sum target;
- receive accept/reject feedback (independent samples);
- use the words `customer` or `transaction`.

C6-LM already showed that models are poor arithmetic search
operators. G1 does not repeat that experiment.

------------------------------------------------------------------------

## 3. Two conditions

**Informed.** The prompt contains the published D cues and the
E2 CUSTOMER constructions. Risk: the model is an expensive
template picker.

**Free.** The prompt contains the visible proposition and the
intended category in ordinary language (“the person the dinner
was for”). It does not list the grammar. `δ_E2` decides whether
the output happens to belong to the language. Success may be
rare. That is a finding.

Both keep `P` = “The restaurant was good, but service was slow.”

------------------------------------------------------------------------

## 4. Novelty

A hit that is only

``` text
Did we find the restaurant was good but service was slow
    + <listed E2 phrase>?
```

is a template pick. Pole swaps on that frame are still the C6
mutation space, not new language.

``` text
echo        published E2 seed
template    canonical dinner frame + listed E2 tail
pole_swap   legal C6 poles/glaze + listed E2 tail
novel       D+E2+poles, and the carrier is not that frame
reject      δ failed
```

Informed generation is interesting only if some accepted `U`
is `novel` or at least not merely `echo`.

------------------------------------------------------------------------

## 5. Live run (gpt-4o-mini, 8+8 independent samples)

Informed: `δ_D` = GET on 8/8. `δ_E2` = CUSTOMER on 7/8.
Full DE (poles held) on 1/8. That one finished `N = 42` by C6-HY.

``` text
Did that person involved think the restaurant was good
even though the service was slow?
        ↓ C6-HY
Did that person involved think the restaurant was good
even though the service was sluggish last night?
        ↓
GET CUSTOMER 42
novelty = novel
```

The other informed misses were mostly pole failures (`food`
for the restaurant concept), not failures to use E2. The
model was not merely appending a listed tail to the published
dinner frame.

Free: DE 0/8, N=42 0/8. Two sentences contained `the person`
and so `δ_E2` fired; poles did not hold. Ordinary instruction
did not land in the language.

------------------------------------------------------------------------

## 6. Pass and fail

The **pipeline** PASSES if `δ` and C6-HY, given a novel
poles-valid GET+CUSTOMER sentence, produce `GET CUSTOMER 42`,
and given `whoever ate there` produce nothing.

The **informed** live run PASSES if at least one independent
proposal is accepted by `δ_D` and `δ_E2`. C6-HY should then
be able to finish `N` on that candidate.

The **free** live run does not have to hit. A zero is evidence
that a narrow published grammar is hard to land in from
ordinary instruction.

FAILS if the LM is treated as a decoder, if `N` is in the
prompt, or if a near-miss is accepted.

------------------------------------------------------------------------

## 7. What this may show

Informed produced a novel carrier that `δ` accepted and C6-HY
finished. It did not only pick templates. Free was zero.

> An LM can navigate a published deterministic language
> without becoming the decoder, while code still owns `N`.
> Ordinary instruction does not land in that language while
> the grammar remains this small.

That is the scalability tension, measured: more naturalness
needs a broader grammar; a broader grammar is more decoder
to publish. G1 does not resolve which side wins.

------------------------------------------------------------------------

## 8. What this does not claim

- open English;
- the LM invents constructions that then count;
- S1/X1 now use E2;
- integrity, opcodes, detectability;
- NCMP/2.0 §21.

Continue in `NCMP-P7-W1.md`. The question is whether the wire
looks like ordinary conversation, not whether `δ_N` is secret.

``` text
npm run test:g1
npm run test:g1-lm
```
