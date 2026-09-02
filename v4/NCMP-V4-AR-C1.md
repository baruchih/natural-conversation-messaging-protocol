# NCMP-V4-AR-C1

**Status:** PASS. Header
composition. Not NCMP/4.0.\
**Date:** September 2026\
**Parent:** `NCMP-V4-AR.md` AR-4
locked. `NCMP-V4-Vocab.md` 2×2
locked.\
**Scope:** Recover action, resource,
and argument as three independent
fields from one BODY bitstream.
Planted turns. No UUID. No
reliability. No W. Do not amend
the baseline or `ncmp/NCMP.md`
from a failing cell.

`npm run test:v4-ar-c1`

------------------------------------------------------------------------

## 1. Question

Can action, resource, and argument
be recovered as three independent
application fields from one BODY
bitstream using the existing V4
decoder?

------------------------------------------------------------------------

## 2. Method

START `short` → `argument_bits = 5`.
Header width 2. Same C6, half3,
SKIP/DATA, ownership.

``` text
wire = ACTION bit + RESOURCE bit + argument
```

`symbol` uses wire remaining.
FINISH is complete only when
header and argument are both full.

Five planted frames. Argument
`10111` on all four headers, then
the same GET CUSTOMER header with
argument `01010`.

``` text
00 10111   GET CUSTOMER 10111
01 10111   GET ORDER    10111
10 10111   SET CUSTOMER 10111
11 10111   SET ORDER    10111
00 01010   GET CUSTOMER 01010
```

Two independent machines see the
same transcript.

------------------------------------------------------------------------

## 3. Decisive controls

``` text
same ACTION, changed RESOURCE
    → only resource changes
changed ACTION, same RESOURCE
    → only action changes
same header, changed argument
    → only argument changes
```

After FINISH both machines produce

``` text
{ action, resource, argument }
```

------------------------------------------------------------------------

## 4. Out of scope

No LM. No new carrier. No START
length change.

PASSed. Baseline and `ncmp/NCMP.md`
may now be amended deliberately.
