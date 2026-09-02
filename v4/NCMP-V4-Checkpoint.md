# NCMP-V4-Checkpoint

**Status:** Pause note. Not an
experiment. Not a specification.
Not NCMP/4.0.\
**Date:** September 2026\
**Parent:** First W recorded and
stopped. F10 closed. Baseline
specified.\
**Scope:** What P7 → V3 → V4 → RE
→ Capacity → W established. What
we may claim. What remains
hypothesis. What still blocks a
version.

There is no next cell from this
note.

------------------------------------------------------------------------

## 1. Why stop here

After F10 the architecture was no
longer hypothetical. After this W
probe the evaluation path is no
longer hypothetical either.

Another detector, another scene,
or surface-paired would not change
the responsible claims. It would
only delay naming them.

------------------------------------------------------------------------

## 2. The line

``` text
P7      capacity of a sentence family
V3      capacity can depend on
        shared language / history
V4      capacity accumulates across
        conversation
RE      carrier search is not the
        observed bottleneck
Runway  conversation itself is scarce
Eval-C  capacity is of a particular
        conversation
W       first system-level
        distinguishability probe
```

``` text
natural runway × Profile 0 trajectory
        ↓
usable information budget
```

The protocol object is the
conversation.

``` text
decode(stateₙ, Uₙ) → (bitsₙ, stateₙ₊₁)
```

`NCMP-V4-Architecture.md`
`NCMP-Baseline-Protocol.md`

------------------------------------------------------------------------

## 3. Responsible claims

These are earned.

**Protocol existence.** A framed
stateful transport over ordinary
conversation is specified and
implemented. Profile 0. No version
number. Does not amend NCMP/2.0.

**Deterministic semantics.** Same
profile, same ordered transcript,
same state after every prefix. The
encoder is not protocol state.

**Conformance.** An independent
referee can check bits and
`next_mode` from the transcript
alone.

**128-bit transport.** One
application argument of realistic
size went through the specified
protocol end to end. Payload
length is not a demonstrated
architectural limit.

**Carrier search.** Across the
closed RE battery, owner-DATA was
252/252. `NO_CANDIDATE` was 0.
Mean search 3.07, max 16, `k=50`
had headroom. Hitting the required
class was not the observed limit.

**Runway.** Three RE incompletes
were exhausted scripts, not search
failures. Conversational extent is
the scarce resource.

**Natural capacity.** Four
naturally bounded conversations
carried 2–10 chosen bits under
Profile 0. Capacity is a property
of a conversation, not merely of
the carrier.

**Sparse intensity.** In the first
W pairs, about one in five visible
turns was owner-DATA. The rest
were unconstrained. Constrained
turns were selected from
realizations of the same job, not
appended constructions.

**First distinguishability probe.**
In three intent-paired,
job-skeleton conversations, the
declared surface statistics showed
no obvious separation, and the
blind preference judge did not
identify TREATMENT as less natural
in any pair. One of three
treatment payloads did not
complete.

That last sentence is not a
covertness claim.

------------------------------------------------------------------------

## 4. Hypotheses

These are not earned.

**Density ~0.3 bits/body-turn**
recurs across RE and Eval-C. Not
a law. The denominator (natural
turn) still includes LM social
tails.

**Task runway vs social tail.**
Dinner and technical settle early
and persist. Weekend does not.
No judge has been defined.

**Covertness.** W is consistent
with “~17–21% constrained
intensity did not add an obvious
signature inside matched
LM-generated conversations.”
n=3. Shared generator signature
may dominate the intervention.
Not “NCMP is covert.”

**The architectural change
matters.** V2-ish forced a
recognizable construction on the
protocol object. V4 leaves most
turns unconstrained and selects
some owner turns from a broad
natural set. The W pairs are
consistent with that mattering.
They do not prove it.

**Usage objects.** 2, 5, 8, ~10
bits look aligned with ordinary
conversations. A UUID does not.
That is policy, not a measured
application.

------------------------------------------------------------------------

## 5. What a version would still
need

The baseline is already a
specification. A version is a
different act: something we would
ask independent parties to
implement and rely on.

Blockers, not next cells:

**Transport.** Ordered, lossless,
duplicate-free is assumed. Loss,
reorder, crash, resync are
unattacked.

**Runway policy.** When the
conversation ends and payload
remains, `decode()` is silent.
Incomplete frame, smaller object,
or a later conversation are
usage semantics. Not chosen.

**Bound quality.** `END` can be
generator persistence. We know
the denominator needs work. We
have not defined it.

**Distinguishability.** One tiny
probe. No covertness claim. No
reason yet for surface-paired.

**Robustness of search.** RE was
comfortable. W weekend missed a
2-bit `11`. Encoder miss is still
real. Not a protocol defect.

**Profile 0 is a profile.** C6,
half3, `{0,10,11}`, initial SKIP
are implementation choices. A
version might keep them. It
should not confuse them with the
architecture.

Do not invent NCMP/3.0 or
NCMP/4.0 from this note.

------------------------------------------------------------------------

## 6. What this does not do

- add a W observer;
- start surface-paired;
- expand Eval-C;
- amend the specification;
- enlarge `k` or change `half3`;
- open a robustness experiment.

The research checkpoint is the
result. The next act, if any, is
a decision about which blocker
is worth a program — not another
cell on the current path.
