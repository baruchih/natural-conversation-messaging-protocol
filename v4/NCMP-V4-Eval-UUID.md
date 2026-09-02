# NCMP-V4-Eval-UUID

**Status:** One run. `UUID` match.
Do not regenerate. Do not amend
`NCMP-Baseline-Protocol.md`.\
**Date:** September 2026\
**Parent:** `NCMP-Baseline-Protocol.md`.
First UUID run remains
`NO_CANDIDATE` and is not this
profile. `NCMP-V4-UUID.md`\
**Scope:** One fixed 128-bit UUID
through the specified protocol.
Peer and owner SKIP are natural.
Only owner DATA searches.

------------------------------------------------------------------------

## 1. Question

> Can the specified protocol carry a
> 128-bit UUID when the peer simply
> continues the conversation and only
> the owner searches for DATA
> realizations?

Two measurements, kept separate:

``` text
PEER NATURALNESS / CONTINUITY
    Did the peer emit one natural U?

OWNER ENCODABILITY
    When DATA occurred, could the
    owner find an acceptable natural
    realization of the next codeword?
```

An encoder miss is not a protocol
defect. Do not amend the
specification.

------------------------------------------------------------------------

## 2. Method

Same UUID as the first run.

``` text
7c3e9a12-8b4f-4d26-a1e0-5f8c2d9b6e04
128 bits. 88 Profile 0 symbols.
START wide → 128. Owner A.
```

``` text
peer / owner SKIP
    one natural U
    no turnOk
    no symbol target

owner DATA
    k = 50
    turnOk hygiene
    required {0,10,11} or FINAL
```

Declared intents include the first
UUID hike script plus day-of-hike
continuations. Unused stay unused.
Do not add after a miss. Do not
enlarge `k`.

------------------------------------------------------------------------

## 3. Measurement

One run. `k = 50`. Do not enlarge.
Do not regenerate.

``` text
result                      UUID
payload bits                128
required codewords          88
total turns                 313
owner / peer                157 / 156
owner DATA opportunities    88
owner DATA successes        88
owner SKIP                  69
CHAT                        0
NO_CANDIDATE                no
candidates/DATA hit         max 8  mean 2.64
conversation length         313
peer turns with digits      1
unused intents              39
final UUID match            yes
```

The first UUID miss intent is now a
peer BODY turn:

``` text
Suggest meeting before the lot fills up.
Yeah, I think it would be smart to meet
around 7:30 in the lot. …
    → BODY_SKIP
    → V = 54
    → bits = ""
```

Peer naturalness held. Owner DATA
found every required codeword inside
the declared budget. The
specification was not amended.

------------------------------------------------------------------------

## 4. Milestone

Payload length is no longer a
demonstrated limitation of the
architecture. A 128-bit argument
went through the specified protocol
end to end.

Reliability and efficiency of
repeating that are
`NCMP-V4-Eval-RE.md`. Do not
redesign from this one run.

------------------------------------------------------------------------

## 5. What this does not claim

One encoder evaluation of the
specified protocol. Not a
reliability distribution, not an
efficiency bound, not camouflage.

- a change to the specification;
- a rewrite of the first UUID run;
- robustness;
- that `k = 50` is enough.

``` text
npm run test:v4-eval-uuid
npm run test:v4-eval-uuid-lm
```
