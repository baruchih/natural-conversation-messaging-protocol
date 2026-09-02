# NCMP-V4-Vocab-Scale

**Status:** Locked for AR-C2 only.
Not the published v0.1 table.
Not NCMP/4.0.\
**Date:** September 2026\
**Parent:** `NCMP-V4-Vocab.md` 2×2
proved composition.\
**Scope:** A wider codebook so a
5-bit header can be tested. Does
not choose the public vocabulary.

------------------------------------------------------------------------

## 1. Why another table

2×2 showed two fields. It did not
show that field width can grow, or
what size is cheap enough for a
natural conversation.

This table is an experiment
vocabulary. v0.1 is not locked to
it.

------------------------------------------------------------------------

## 2. Lock

``` text
ACTION     2 bits
  00  GET
  01  SET
  10  DELETE
  11  EXECUTE

RESOURCE   3 bits
  000 CUSTOMER
  001 ORDER
  010 ACCOUNT
  011 INVOICE
  100 PRODUCT
  101 SESSION
  110 reserved
  111 reserved
```

``` text
header = 2 + 3 = 5 bits
wire   = AA RRR ARGUMENT
```

Six resources, not eight. The two
spare codes are reserved. They are
not extra message types.

Names are a boring application
surface. The lock is the widths
and that ACTION and RESOURCE stay
separate fields.

------------------------------------------------------------------------

## 3. What AR-C2 must prove

Not 24 conversations.

Independence across the code
space: low and high action, low
and high resource, same argument,
plus one-field controls.

`NCMP-V4-AR-C2.md`

------------------------------------------------------------------------

## 4. Out of scope

Do not publish this table as
v0.1. That waits on the header
budget.

`NCMP-V4-Header-Budget.md`

Do not invent NCMP/4.0.
