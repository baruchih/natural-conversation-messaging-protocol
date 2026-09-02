# NCMP-V4-Eligible

**Status:** Grammar audit. Closed.
`turnOk` is encoder hygiene. Not a
specification.\
**Date:** September 2026\
**Parent:** Profile 0 baseline, closed.
UUID run, one miss, do not regenerate.
`NCMP-V4-Baseline.md` `NCMP-V4-UUID.md`\
**Scope:** What `eligible(U)` actually
restricts, and what each restriction is
for. No second UUID run. No larger `k`.
No change to `half3`. Body membership
is locked yes. `NCMP-V4-Body.md`

------------------------------------------------------------------------

## 1. Question

> Which `eligible(U)` restrictions are
> required for deterministic `V(U)`,
> which are required only for payload
> decoding, and which are inherited
> experimental constraints?

The UUID miss already answered where
the collision is. This note classifies
the grammar. It does not amend it.

------------------------------------------------------------------------

## 2. Two meanings, currently one gate

Profile 0 uses one predicate for every
open-frame body string:

``` text
eligible(U)  =  turnOk(U)
    ↓
may participate in the state machine
```

`turnOk` is M2’s conversational-turn
gate: C6 carrier mins, digits
forbidden, internal `.!?` allowed.

Historically that gate was built so a
`U` would be a safe C6 payload
realization. V4 also uses it to decide
whether a peer or SKIP turn may advance
`next_mode`.

Those are not the same requirement.

``` text
owner DATA     U → V → symbol + next_mode
owner SKIP     U → V → next_mode
peer           U → V → next_mode
```

Only the first needs a payload
realization. The other two only need
a deterministic `V`.

------------------------------------------------------------------------

## 3. C6 already defines V on clock times

C6 Section 3:

> All other characters — spaces,
> punctuation, digits, marks, and
> letters outside `a`..`z` — MUST be
> ignored by `N`. They MAY appear in
> `U`.

So this is well-defined:

``` text
Let’s meet around 7:30 before the lot fills up.
        ↓
selected letters (digits dropped)
        ↓
V ∈ {0 … 63}
        ↓
next_mode(V)
```

C6 Section 7 is the reject rule, and
it says so:

> These rules keep `U` in the
> ordinary-sentence region. They are
> part of the experiment, not a claim
> about all future profiles.

The digit ban is encode hygiene. C6
fails an encoder that hits `n` by
emitting digit strings. It is not a
claim that `V` is undefined when a
digit is present.

Profile 0 inherited the reject rule
as the participation gate.

------------------------------------------------------------------------

## 4. Classification

Needed-for is about deterministic
decode, not encoder search and not
camouflage.

``` text
restriction          V   state  payload  what it is
NFC + lowercase      yes yes    yes      defines V
selected a-z only    yes yes    yes      defines V
                     (ignore, do not reject)
digits forbidden     no  no     no       C6 well_formed
                                         + encode fail
terminal .!?         no  no     no       C6 ordinary sentence
single sentence      no  no     no       C6; dropped by M2
tokens ≥ 6           no  no     no       C6 carrier min
letters ≥ 20         no  no     no       C6 carrier min
unicode / non-a-z    —   —      —        ignored, no gate
START / FINISH       —   —      —        F1 control, before eligible
D / E remnants       —   —      —        absent from Profile 0
```

Payload decode needs nothing beyond
`V`. `symbol(remaining, V)` and
`next_mode(V)` are total on `0..63`.

What `turnOk` still rejects, and V4
does not need for decode:

``` text
digits
terminal .!?
tokens ≥ 6
letters ≥ 20
```

M2 already dropped single-sentence.
That is why

``` text
Oh nice! How was the vibe once they arrived?
P7 wellFormed   NO
V3 turnOk       YES
```

Digits were kept. They are the
restriction the UUID run hit.

------------------------------------------------------------------------

## 5. The UUID miss, classified

U12. Peer. Intent: suggest meeting
before the lot fills up. Frozen. Do
not regenerate.

``` text
parsed                     46
turnOk                     0
wellFormed                 0
V defined                  46 / 46
contain digits             46
fail digits only           46
would pass minus digits    46
fail tokens / letters      0 / 0
START / FINISH             0
```

Every candidate is a conversational
turn under the rest of `turnOk`.
Every candidate has a C6 `V`. The
only reject is the inherited digit
ban.

B was not encoding. Baseline law
already says `bits = ""`. B only
needed `next_mode(V)`. Profile 0
refused the turn instead.

The owner DATA turn just before it
(“what time at the lot”) found a
digit-free `U`. F9’s “around six”
survived because the number was
spelled. Coverage is accidental
wording, not architecture.

------------------------------------------------------------------------

## 6. Stronger reading — locked in Body

Payload decode and state transition
need the same thing: `V`. There is
no mechanical reason owner DATA
should keep `turnOk` either.

`PAYLOAD_ELIGIBLE ⊂ STATE_ELIGIBLE`
is not the lock.

Three concepts, not two:

``` text
CONTROL(U)              START / FINISH / handshake
PROTOCOL               V is total
ENCODER_ACCEPTABLE(U)   sender hygiene (today: turnOk)
```

`V` is total, so protocol decode is
total. `turnOk` is an encoder profile.

Body membership is locked yes.
`NCMP-V4-Body.md`. Installed in
Profile 0. The UUID run is not
regenerated.

------------------------------------------------------------------------

## 7. What this does not do

- change `turnOk` as encoder hygiene;
- change `half3` or `k`;
- regenerate the UUID run;
- claim 128 bits are impossible;
- measure distinguishability;
- harden the transport.

``` text
npm run test:v4-eligible
```
