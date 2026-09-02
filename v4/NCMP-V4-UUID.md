# NCMP-V4-UUID

**Status:** Experimental profile. Not frozen.
One run. Do not regenerate.\
**Date:** September 2026\
**Parent:** Profile 0 as then locked,
with `eligible(U)` in the protocol.
Later body-membership lock does not
rewrite this result. `NCMP-V4-Body.md`\
**Scope:** One fixed 128-bit UUID through
the then-current baseline and encoder.
No new semantics. `k = 50` is not
enlarged. `half3` is not changed.

------------------------------------------------------------------------

## 1. Question

> Can the existing natural encoder carry a
> realistically sized identifier through
> Profile 0 end to end?

The protocol should not change. A miss
is allowed. It would mean semantics held
and long-frame encoding did not.

------------------------------------------------------------------------

## 2. Declared payload

``` text
7c3e9a12-8b4f-4d26-a1e0-5f8c2d9b6e04
```

128 bits. 88 Profile 0 symbols. START
`wide` → 128. Owner A. Peer B never
contributes bits.

------------------------------------------------------------------------

## 3. Measurement

One run. `k = 50`. Do not enlarge.
Do not regenerate.

``` text
result              NO_CANDIDATE
payload bits        128
have                2
UUID match          no
body turns          11
owner / peer        6 / 5
owner DATA / SKIP   2 / 4
CHAT                0
searches            11
max examined        2
unused intents      190
```

The miss is a peer turn, not an owner
DATA symbol. Intent 12 asked to meet
before the lot fills. All 46 parsed
candidates used clock digits. `eligible`
rejects digits. Zero legal `U` in the
declared budget.

Baseline transitions on the first eleven
turns were well-formed. The machine did
not improvise. The encoder could not
continue.

------------------------------------------------------------------------

## 4. What this does not claim

- a protocol failure;
- that 128 bits are impossible;
- a change to Profile 0;
- camouflage;
- robustness;
- that `k = 50` is enough;
- NCMP/4.0.

``` text
npm run test:v4-uuid
```
