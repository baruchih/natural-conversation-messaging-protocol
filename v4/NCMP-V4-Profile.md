# NCMP-V4-Profile

**Status:** Locked. Not NCMP/4.0.
Publication may resume from this
abstraction.\
**Date:** September 2026\
**Parent:** AR-4, AR-C1 PASS,
AR-C2 PASS, Header-Budget.\
**Scope:** ACTION and RESOURCE
codebooks are profile parameters.
NCMP specifies the mechanism, not
one public vocabulary.

------------------------------------------------------------------------

## 1. Lock

Participants agree a Profile
before interpretation begins.
That profile contains the ACTION
and RESOURCE codebooks.

``` text
pre-agreed
    what bit patterns mean
transmitted
    which action
    which resource
    what argument
```

NCMP does not standardize that
`00` means GET. A deployment may
agree GET/SET or READ/WRITE. The
wire selects values from the
agreed tables.

``` text
A = |ACTION codebook|
R = |RESOURCE codebook|
action_width   = ceil(log2 A)   (0 if A = 1)
resource_width = ceil(log2 R)   (0 if R = 1)
header_width   = action_width + resource_width
```

Unused bit patterns are reserved.
They MUST NOT complete an object.

``` text
header_cost(A, R)  ≪  C(conversation, profile)
```

is the designer’s inequality.
Conversation is the scarce
resource.

------------------------------------------------------------------------

## 2. Example Baseline Profile

For v0.1 conformance, one example
profile is published. It is cheap
enough for measured capacity. It
is not the NCMP vocabulary.

``` text
ACTION      GET | SET
RESOURCE    CUSTOMER | ORDER
header      2 bits
```

All four combinations are legal.
2×2 is a deliberate size choice,
not an architectural limit.

AR-C2 demonstrated a wider 4×6
example on the same machine. That
is extensibility, not the
published table.

------------------------------------------------------------------------

## 3. Amend

v0.1 Experimental is published
and frozen.

`ncmp/NCMP.md` and
`NCMP-Baseline-Protocol.md`
specify the same machine.
`ncmp/reference/ncmp.ts` is
the published v0.1 decoder.
`v4/baseline.ts` stays the
historical argument-only
Profile 0 machine. Frozen
evals are not replayed
through the header.

`npm test`

Do not invent NCMP/4.0.
