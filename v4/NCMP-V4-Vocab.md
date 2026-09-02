# NCMP-V4-Vocab

**Status:** Locked. Not an experiment.
Not a specification. Not NCMP/4.0.\
**Date:** September 2026\
**Parent:** `NCMP-V4-AR.md`. AR-4
locked.\
**Scope:** The smallest useful
ACTION × RESOURCE vocabulary for
the first public profile. Do not
amend the baseline or `ncmp/NCMP.md`
from this note.

------------------------------------------------------------------------

## 1. Lock

v0.1 must show ACTION and RESOURCE
are independently transmitted
dimensions, not a larger list of
pre-agreed message types.

Smallest vocabulary that proves
both fields vary: 2 × 2. All four
combinations are legal.

``` text
              CUSTOMER       ORDER
GET              ✓             ✓
SET              ✓             ✓
```

``` text
ACTION
  0  GET
  1  SET

RESOURCE
  0  CUSTOMER
  1  ORDER
```

The decoder does not map `00` to
GET CUSTOMER as an atom. It parses

``` text
first bit     → ACTION
second bit    → RESOURCE
```

Header width follows:

``` text
ACTION      1 bit
RESOURCE    1 bit
────────────────
HEADER      2 bits
```

SET and ORDER are boring stand-ins.
The structure is the lock, not the
English labels.

2×1 or 1×2 would prove only one
field varies. D6 and E1 are not
imported.

------------------------------------------------------------------------

## 2. Cost

Two header bits. At the observed
~0.3-ish bits per body turn, that
is a few extra turns, not dozens.

The profile says what 0 and 1 mean.
The conversation says which values
occurred. Same relation as
`{0,10,11}` to argument bits.

------------------------------------------------------------------------

## 3. Next

AR-C1 PASS. Composition is shown.

2×2 is not yet the published
table. Scale and budget:

`NCMP-V4-Vocab-Scale.md`
`NCMP-V4-Header-Budget.md`

------------------------------------------------------------------------

## 4. Out of scope

Do not enlarge the table to fill
unused codes. There are none.

Do not invent NCMP/4.0.
