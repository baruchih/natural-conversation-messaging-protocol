# NCMP-V4-Header-Budget

**Status:** Characterization.
Not an experiment. Not a
specification. Not NCMP/4.0.\
**Date:** September 2026\
**Parent:** AR-4 locked. Eval-C
paused. `NCMP-V4-Capacity.md`\
**Scope:** How large a preselected
ACTION × RESOURCE table can be
before type bits consume too much
of a naturally bounded
conversation. Do not expand
Eval-C. Do not amend the baseline.

`npm run test:v4-header-budget`

------------------------------------------------------------------------

## 1. Question

How many preselected ACTION and
RESOURCE values can a profile
reasonably support?

The mechanical maximum is boring.
The useful quantity is header
cost against conversational
capacity.

------------------------------------------------------------------------

## 2. Cost

``` text
header_cost(A, R)
    = ceil(log2 A) + ceil(log2 R)
```

A and R are vocabulary sizes, not
code-space sizes. Six resources
still cost three bits.

``` text
1 × 1      0 bits     Profile 0 today
2 × 2      2 bits     AR-C1
4 × 6      5 bits     AR-C2 table
16 × 16    8 bits
256 × 256  16 bits
```

The protocol can decode all of
these. `symbol` does not care
which part of the wire it is
filling.

------------------------------------------------------------------------

## 3. Runway

Capacity is of a conversation.

Search-complete `C_encodable` in
Eval-C: 2, 10, and 9 bits.
`NCMP-V4-Eval-C.md`

Recurring density around ~0.3
chosen bits per body turn is an
observation, not a law.
`NCMP-V4-Capacity.md`

Illustration only, using 0.3:

``` text
header     extra body turns
2 bits     ≈ 7
5 bits     ≈ 17
8 bits     ≈ 27
16 bits    ≈ 53
```

before one argument bit.

A 5-bit header against a 5–10 bit
natural budget is already a large
share of the conversation. A
16-bit header can exceed the whole
measured `C_encodable`.

------------------------------------------------------------------------

## 4. Insight

Every extra type bit competes
directly with argument for
conversational runway.

The first public vocabulary should
be deliberately small. Not because
the decoder fails at 4×6, and not
because 2×2 is a metaphysical
maximum.

``` text
header_cost(A, R)  ≪  C(conversation, profile)
```

is the design inequality.
v0.1 should satisfy it for the
conversations it claims to use.

------------------------------------------------------------------------

## 5. Out of scope

Do not pick v0.1 vocabulary from
this note alone. Wait for AR-C2.

Do not treat 0.3 as a bound.
Do not add Eval-C scenes.
Do not invent NCMP/4.0.
