# NCMP-V4-Eval-C

**Status:** Four scenes recorded.
Paused. Do not expand. Not W.
Protocol fixed. Not a specification
amendment.\
**Date:** September 2026\
**Parent:** `NCMP-V4-Runway.md`.
Closed battery.
`NCMP-V4-Eval-RE.md`\
**Scope:** Naturally bounded
conversation first. Profile 0
capacity second. `k = 50`.
`half3` unchanged. Not W.

------------------------------------------------------------------------

## 1. Question

> How many chosen Profile 0 payload
> bits can a conversation carry if
> the conversation is allowed to
> stop for its own reasons?

No payload during generation.
No target bit count. No
manufactured extra turns.

------------------------------------------------------------------------

## 2. Why this, not another script

Hike and dinner were predeclared
lengths. They measured runway of
scripts we wrote. They did not
measure naturally bounded
conversation.

Do not generate another fixed
100 / 300-turn script.

``` text
old
  128 bits → however many turns
  → 313-turn conversation

this
  natural conversation → N turns
  → how many chosen bits fit?
```

------------------------------------------------------------------------

## 3. Two numbers

A frozen ordinary transcript
decodes to an accidental bitstream.
That is not chosen application
data.

``` text
C_observed
  bits Profile 0 extracts from
  the untouched transcript

C_encodable
  bits the existing encoder could
  have deliberately carried on
  the same intents / runway
```

Conversation length is fixed
before either measurement.

`C_observed` asks how much carrier
opportunity occurred.

`C_encodable` asks how much of
that opportunity is usable for
chosen data.

Peer and owner-SKIP keep the
frozen utterance. Owner DATA may
search `k = 50` paraphrases of
that same turn. Do not enlarge
`k`.

------------------------------------------------------------------------

## 4. Declared scenes

Fixed before live generation.
Do not change after seeing C.

``` text
dinner      short dinner / shop
weekend     Saturday plan
technical   broken save button
collab      guest list and jobs
```

A speaks first. They stop when
the matter is settled. `END` is
the stop token. Safety cap 160
turns. Hitting the cap is
`CAPPED`, not a natural bound.

Measurement wrap: handshake plus
`START` wide (128). Legal Profile
0 length. If a conversation could
carry more than 128 bits, report
`C ≥ 128`. Do not add START
lengths.

Probe for `C_encodable` only,
declared before live cells:

``` text
a1b2c3d4e5f60718293a4b5c6d7e8f90
```

128 bits. Not an application
object. If the conversation ends
first, `C_encodable < 128`. If
the probe finishes first, the
conversation had more runway
than wide.

------------------------------------------------------------------------

## 5. What this is for

A practical operating picture.
Also record, descriptively, not
as new protocol numbers:

``` text
C_encodable / turns
owner DATA opportunities / turns
```

Stable density across scenes
would say Profile 0 contributes
roughly the same bits per turn
and scene mostly sets length.
Different densities would say
conversational structure itself
changes capacity.

``` text
conversation     turns    C_obs  C_enc  bits/turn  DATA_opp
dinner             ?        ?      ?       ?          ?
weekend            ?        ?      ?       ?          ?
technical          ?        ?      ?       ?          ?
collab             ?        ?      ?       ?          ?
```

Do not add a fifth scene. Do not
extend a conversation because C
disappoints. `CAPPED` is a
negative result, not 160 turns
of runway.

------------------------------------------------------------------------

## 5a. Recorded cells

Do not regenerate. Do not add a
scene. `v4/eval-c.frozen.ts`

``` text
scene        stop      turns  C_obs  C_enc  bits/turn  DATA_opp
dinner       NATURAL     28     11     10     0.357      7/28
weekend      NATURAL      6      2      2     0.333      1/6
technical    NATURAL     30     11      9     0.300      6/30
collab       NATURAL     10      5      2     0.200      1/10
```

``` text
CAPPED                     0/4
NO_CANDIDATE               collab U7 wanted 10
search-complete density    0.300–0.357
```

All four stopped for their own
reasons. Hitting 160 did not
occur. Scene title did not set
length: the “long” collaborative
scene was 10 turns; weekend
planning ended at 6.

`C_encodable` never reached the
wide probe. Unused probe bits
118 / 126 / 119 / 126.

Collab is not a density
observation. The encoder missed
`10` at owner-DATA U7. Leave it.
`C_observed` on that transcript
was 5.

`C_observed` ≥ `C_encodable` on
every scene. The accidental
stream is not a chosen object.
The gap is largest where search
failed.

Owner-DATA opportunity rate
ranged 0.10–0.25. Same-length
conversations would not have to
carry the same C.

This is not yet

``` text
short exchange       → few bits
ordinary discussion  → tens of bits
long collaboration   → larger object
```

The four conversations carried
2–10 chosen bits. A 128-bit
UUID is the wrong object for
any of them. A 5-bit decision
would have fit dinner and
technical. Weekend had room
for 2.

Profile 0 density on the three
search-complete scenes sits
inside the closed battery’s
0.29–0.47 band. Recurring
observation, not a law.

Dinner and technical settle the
task around turn 5–6, then spend
a long social tail reaffirming.
Those lengths are LM-declared
bounds. Weekend and collab stop
near the task. `NCMP-V4-Capacity.md`

Do not expand this evaluation.
Do not start W from this.

------------------------------------------------------------------------

## 6. What this does not do

- change the specification;
- enlarge `k`;
- change `half3`;
- add START lengths;
- add intents to the RE
  incompletes;
- start distinguishability;
- claim camouflage.

``` text
npm run test:v4-eval-c
npm run test:v4-eval-c-lm
```
