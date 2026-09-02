# NCMP-V4-Capacity

**Status:** Pause note. Not an
experiment. Not a specification.\
**Date:** September 2026\
**Parent:** Four scenes recorded.
`NCMP-V4-Eval-C.md`\
**Scope:** Capacity is a property of
a conversation. Do not expand
Eval-C. Do not start W. Do not
amend `NCMP-Baseline-Protocol.md`.

------------------------------------------------------------------------

## 1. Lock

> NCMP capacity is a property of a
> conversation, not merely of the
> carrier.

``` text
natural conversational runway
            ×
Profile 0 state trajectory
            ↓
usable information budget
```

The four scenes stopped at 6, 10,
28, and 30 turns independently of
payload demand. Search-complete
`C_encodable` was 2, 10, and 9.
`NCMP-V4-Eval-C.md`

------------------------------------------------------------------------

## 2. LM-declared bounds

`END` is not always a task
terminal.

``` text
task runway
  how long until the matter is
  actually resolved

social tail
  how long the generator keeps
  acknowledging after that
```

Weekend has almost no tail. Collab
has a small one. Dinner and
technical settle early, then spend
many turns reaffirming. Those 28
and 30 are LM-declared bounds, not
clean task bounds.

Humans have social tails. Extra
bits from a tail are not invalid.
They are not automatically as
valuable as task runway.

Do not yet say Profile 0 gives
~0.33 bits per natural turn. The
density may sit there. The
denominator still needs work.

------------------------------------------------------------------------

## 3. Recurring density

Ignore absolute lengths.

``` text
weekend     6    2 bits    0.333
dinner     28   10 bits    0.357
technical  30    9 bits    0.300
```

Conversation type and length
changed. Chosen-data density
stayed near one bit per three
turns. That sits inside the closed
battery’s 0.29–0.47.

``` text
Profile 0 empirical density
≈ 0.3-ish chosen bits / body turn
```

Not a law. Not a bound. A
recurring observation across two
setups.

Collab stays a miss. `C_encodable`
is not turns × 0.33. Trajectory
and search still matter.
DATA-opportunity rate was
0.10–0.25.

------------------------------------------------------------------------

## 4. The UUID is the wrong unit

128 / ~0.33 ≈ 388 turns. Compatible
with the 313-turn successful run.

The protocol can carry a UUID.
Ordinary conversation should not
be asked to. Plausible objects on
this sample are 2, 5, 8, ~10 bits:
an enum, a decision, a status, an
index, a short reference, or a
fragment of a larger object across
later conversations.

Conversation is expensive.

------------------------------------------------------------------------

## 5. What Eval-C answered

Can NCMP opportunistically carry
chosen machine information inside
conversations whose length is not
determined by the payload?

Yes, in this first four-scene
evaluation. Magnitude: single-digit
to roughly ten chosen bits.

Do not expand the evaluation.
Do not add a fifth scene.

------------------------------------------------------------------------

## 6. Open issues

**Natural-bound quality.** `END`
from an LM can include a
repetitive social tail. Task
runway and generator persistence
are not the same. Do not invent
a task-complete judge to close
this. We know the denominator
needs work. We do not need to
define it yet.

**Capacity variability.** C
depends on state trajectory and
search, not just turn count.

------------------------------------------------------------------------

## 7. W is close, not started

The right distinguishability
object is no longer a 313-turn
UUID conversation.

``` text
naturally bounded conversation
        ↓
ordinary version
versus
same intents + same runway
        ↓
NCMP-encoded version
```

Fork declared: intent-paired at
the job-skeleton level.
Surface-paired on the shelf.
First W recorded. Do not add
observers. `NCMP-V4-W.md`
