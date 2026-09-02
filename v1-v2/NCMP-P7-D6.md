# NCMP-P7-D6

**Status:** Experimental Result #11 — frozen — YES\
**Date:** August 2026\
**Parent:** NCMP/2.0\
**Depends on:** C6, D1, E1 (frozen). Does not amend S1, X1, R1.\
**Scope:** Expand discourse from 2 opcodes to 6. Same `E` and
`N`. Separated mutation spaces. No LM decoder.

This profile is closed. P7 ends here. There is no Result #12.

------------------------------------------------------------------------

## 1. Question

D1 proved one bit. This profile asks whether the composition
mechanism scales:

> Can the discourse alphabet expand from 2 to 6 while
> preserving the existing composition invariants?

``` text
D ∈ { GET, ALLOW, DENY, CONSTRAINT, REPLACE, DELEGATE }
E ∈ { CUSTOMER, TRANSACTION }
N ∈ { 0 … 63 }
```

768 logical combinations. Deterministic `δ`. Complete N
coverage. D and E must not flip under N-search.

Not “six opcodes sounds better.” The measurement is whether
each new opcode explodes the reserved language.

------------------------------------------------------------------------

## 2. What stays frozen

`δ_N`, poles, glaze, `δ_E` from E1, S1 handshake, X1, R1.
D6 is a second discourse decoder. S1 still calls D1.

Opcode names are not the decoder. `deny`, `replace`, and
`delegate` are not cues.

------------------------------------------------------------------------

## 3. Published cues

``` text
GET         {did, whether, what}            + ?
ALLOW       {confirm, approved,
             authorized, granted}           + . !
DENY        {refuse, declined,
             rejected, withheld}            + . !
CONSTRAINT  {unless, provided,
             assuming, insofar}             + . !
REPLACE     {instead, rather,
             supersedes, newly}             + . !
DELEGATE    {forwarded, handed,
             referred, routed}              + . !
```

Exactly one matching class → that opcode. Conflict or none
→ `NONE`. N-search may edit only C6 poles and glaze.

Grammar footprint: 3 or 4 reserved tokens per opcode.
Total 23. Not 20 constructions per new opcode.

------------------------------------------------------------------------

## 4. Result

All 12 `D × E` families: 64/64 residues, ≥5 realizations
each. 768/768. D never flips. E never flips. Two D cues in
one sentence are `NONE`. S1 probe and ACK are not frames.

``` text
GET CUSTOMER 42          x37
DENY CUSTOMER 42         x53   I declined … for that party after we sat.
CONSTRAINT CUSTOMER 42   x60   Unless noted … for that party this evening.
REPLACE CUSTOMER 42      x47   Instead … for that party during dinner.
DELEGATE CUSTOMER 42     x39   I forwarded … for that party.
```

The sentences are still a constrained language. Some are
awkward. That is allowed. R1 already said the wire is a
serialization, not a style guide.

------------------------------------------------------------------------

## 5. What this may claim

> The discourse alphabet can expand from 2 to 6 under the
> same composition invariants. Each added opcode costs a
> small disjoint cue set, not a collapsing mutation space.

Expressiveness rose. Grammar size rose linearly and slowly.
Surface signature is still there (W1). This does not reopen
covertness or paraphrase robustness.

------------------------------------------------------------------------

## 6. What this does not claim

- S1/X1 now use six opcodes;
- open English;
- that the new prefixes are natural;
- a seventh experiment;
- NCMP/2.0 §21.

P7 is closed. The next activity is not an experiment. It is
the question already at the bottom of `NCMP-P7-Findings.md`.

``` text
npm run test:d6
```
