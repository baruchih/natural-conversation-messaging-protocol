# NCMP-V4-Runway

**Status:** Pause note. Not an
experiment. Not a specification.\
**Date:** September 2026\
**Parent:** Closed battery.
`NCMP-V4-Eval-RE.md`\
**Scope:** Conversational runway as
the scarce resource. Not a protocol
field. Do not amend
`NCMP-Baseline-Protocol.md`.
Do not enlarge `k` or change
`half3`. Do not start W.

------------------------------------------------------------------------

## 1. What the battery moved

After M2/M3 the worry was whether
natural language can repeatedly hit
the required carrier class.

The closed battery says that did
not emerge as the limit.

``` text
carrier opportunity     plentiful
candidate search        comfortable
conversational runway   scarce
```

``` text
protocol decode / state        held
owner constrained search       252/252
peer continuity                no failures
NO_CANDIDATE                   0
frame completion               7/10
three failures                 conversation budget exhausted
```

`NCMP-V4-Eval-RE.md`

Mean search 3.07. Median 2. p95 8.
Max 16. `k = 50` had headroom.

------------------------------------------------------------------------

## 2. Two ways to spend conversation

``` text
payload-driven
  I need to send 128 bits,
  therefore manufacture enough
  conversation.

conversation-driven
  This conversation is happening
  anyway. How much payload can it
  naturally carry?
```

The 313-turn UUID is the first
kind. The protocol worked. The
encoder hit its symbols. The
conversation became absurdly long
because the payload demanded it.

The second is closer to what NCMP
should exploit.

------------------------------------------------------------------------

## 3. C is a metric, not a field

A dinner script had a certain
payload budget. A long hike script
had a larger one.

``` text
C(conversation, profile)
    = application bits carried
      before the natural
      conversation ends
```

Not a START length. Not a decode
input. An evaluation number.

The incompletes already sketch it:

``` text
24-a-dinner    ≥22 bits, <24
24-b-dinner    ≥17 bits, <24
128-b-hike     ≥124 bits, <128
128-a-hike     ≥128          (finished, 39 intents left)
```

Not clean bounds. Payload
composition and DATA scheduling
matter. They show the shape.

At the measured 0.29–0.47 bits per
body turn, a 128-bit argument wants
hundreds of turns under Profile 0.
The successful UUID used 313.

------------------------------------------------------------------------

## 4. When payload outlives runway

Leave the three incomplete cells
where they stopped. Adding intents
asks whether more manufactured
conversation finishes those frames.
That is payload-driven. We already
know the answer.

The practical question, above the
baseline:

> What should the application do
> when the payload is larger than
> the natural conversational
> opportunity?

Not a change to `decode()`. Usage
semantics:

``` text
conversation has naturally ended
        +
payload remains
        ↓
do not manufacture another 150 turns
```

Maybe that frame is incomplete.
Maybe the application chooses a
smaller object. Maybe a later
natural conversation opens another
frame.

Those are encoder / application
policy. The referee still sees the
same transcript.

------------------------------------------------------------------------

## 5. Eval-C, recorded

Four scenes. Conversation first.
`NCMP-V4-Eval-C.md`

Capacity is a property of a
conversation, not merely of the
carrier. `NCMP-V4-Capacity.md`

Do not expand Eval-C. Do not
start W.

------------------------------------------------------------------------

## 6. What this does not do

- change the specification;
- enlarge `k`;
- change `half3`;
- add START lengths;
- add intents to the incompletes;
- start distinguishability.

NCMP’s scarce resource may not be
linguistic carrier states. It may
be believable conversation itself.

The protocol can carry a UUID. The
encoder can hit its symbols. The
open question is how much machine
information a naturally bounded
conversation should reasonably be
expected to carry.
