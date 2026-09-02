# NCMP-V4-AR-C2

**Status:** PASS. Wider
header composition. Not NCMP/4.0.\
**Date:** September 2026\
**Parent:** `NCMP-V4-Vocab-Scale.md`\
**Scope:** A 5-bit header still
parses as two independent fields
on the existing BODY machine.
Planted turns. No UUID. No
reliability. No W. Do not amend
the baseline or `ncmp/NCMP.md`.

`npm run test:v4-ar-c2`

------------------------------------------------------------------------

## 1. Question

Can ACTION and RESOURCE scale
beyond one bit each, and still be
recovered independently from one
BODY bitstream?

------------------------------------------------------------------------

## 2. Method

START `short` → argument 5 bits.
Header 5 bits. Same C6, half3,
SKIP/DATA, ownership.

``` text
00 000 10111   GET     CUSTOMER 10111
00 101 10111   GET     SESSION  10111
11 000 10111   EXECUTE CUSTOMER 10111
11 101 10111   EXECUTE SESSION  10111
00 000 01010   GET     CUSTOMER 01010
```

Low/high action. Low/high
resource. Same argument, then one
changed argument.

Two machines. Same transcript.

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

Reserved resource codes are not
legal completed objects.

------------------------------------------------------------------------

## 4. Out of scope

This is not a vocabulary-size
recommendation. See
`NCMP-V4-Header-Budget.md`.
