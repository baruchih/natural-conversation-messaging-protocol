# NCMP-C4

**Status:** Session-derived hint is the right shape. Not a v0.1 change.  
**Date:** September 2026  
**Parent:** [NCMP-Control.md](NCMP-Control.md)  
**Prior:** [NCMP-C3.md](NCMP-C3.md) YES · v0.1 Experimental  
**Name:** Session hint after ACK  
**Code:** `c4.ts` · `npm run test:v4-c4`

v0.1 keeps `umbrella` on every control. That is mechanically sound. It is also conspicuous: the same Profile word appears in PROBE, ACK, START, and FINISH.

This note asks whether `K_session` can retire that word for session controls. `process` is unchanged.

------------------------------------------------------------------------

## 1. Question

> After ACK establishes `K_session`, should session controls continue using `bootstrap_hint`, use a session-derived hint, or require no hint at all?

Three arms. Same residuals as C2-B. Same held-out corpus as C2-D. Slots declared after the derived word was known and before any `P_sec` of a combination was computed.

------------------------------------------------------------------------

## 2. Declared before scoring

``` text
K_session        0xDCA0B418
T_START          0x25
T_FINISH         0x08

Arm A            bootstrap_hint ∧ P_sec = T
                 current v0.1. Not re-scored.

Arm B            P_sec = T
                 no hint

Arm C            session_hint ∧ P_sec = T
                 session_hint = SESSION_WORDS[ FNV-1a32(be32(K) || 0x03) mod 32 ]
```

`SESSION_WORDS` is a 32-word list written before this `K_session` was reduced. It does not contain `umbrella`.

Derived word:

``` text
session_hint = bench
```

START slots (no umbrella):

``` text
base     Let's head out Saturday morning and meet at the bench.

slots    Let's              / We can
         head out           / set off
         Saturday morning   / in the morning
         and meet           / and start
         at the bench       / by the bench
         .                  / !
```

FINISH slots (no umbrella):

``` text
base     Alright, that covers it. See you at the bench later.

slots    Alright,           / Okay,
         that covers it.    / that's the plan.
         See you            / I'll be
         at the bench       / by the bench
         later              / shortly
         .                  / !
```

------------------------------------------------------------------------

## 3. Score

Steerability, Arm C:

``` text
START    64 realizations, 44 distinct P_sec, 1 hit
FINISH   64 realizations, 34 distinct P_sec, 3 hits
```

START hit:

``` text
We can set off in the morning and meet at the bench!
```

FINISH hit:

``` text
Alright, that covers it. See you by the bench later.
```

Held-out corpus, N = 99434, bar `2⁻¹⁶ ≈ 1.53 × 10⁻⁵`:

``` text
umbrella mentioned     58
bench mentioned        67

Arm B START            1530 / 99434 ≈ 1.54 × 10⁻²     fail
Arm C START            1    / 99434 ≈ 1.01 × 10⁻⁵     under
Arm C FINISH           2    / 99434 ≈ 2.01 × 10⁻⁵     over
```

Do not replace `bench`. Do not enlarge the list. Do not shrink 6 bits.

------------------------------------------------------------------------

## 4. Reading

``` text
no hint              NO
                     6 bits alone are not selective

bootstrap hint       current v0.1
                     two-factor, one visible word for the
                     whole session

session-derived hint right shape
                     two-factor again
                     handshake creates the session word
                     START/FINISH need no umbrella
                     this freeze: START under the bar,
                     FINISH over by one extra hit
```

`bench` is about as rare as `umbrella` on this corpus. The composition is still `q × 2⁻⁶`. One residual landed a second accidental. That is coverage, not a new mechanism.

The instinct stands: after ACK, session controls should not keep advertising the bootstrap word. A session-derived hint keeps the two-factor structure that made C2-D work. It does not yet replace `process`.

------------------------------------------------------------------------

## 5. Close

``` text
NO    Arm B. Residual only.
YES   Arm C steerability, no umbrella
      START accidental under the bar
NOT   a v0.1 change
      FINISH accidental over the bar on this freeze
```

Do not change `process`. Do not retune. Do not invent NCMP/3.0 or NCMP/4.0.
