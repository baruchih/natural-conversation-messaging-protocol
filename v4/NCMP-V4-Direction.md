# NCMP-V4-Direction

**Status:** Pause note. Not an experiment. Not a
specification.\
**Date:** August 2026\
**Parent:** V3 is paused at A2 (Result #21) and the
coding note. K4 is frozen. P7 and NCMP/2.0 are not
amended.\
**Scope:** Window ≠ frame. F1 is framing only. This
note does not raise the C6 modulus or invent NCMP/4.0.

------------------------------------------------------------------------

## 1. The confusion

K4 proved that width-3 overlapping windows work as a
serialization mechanism. It did not prove that an
application message must be three conversational
turns. K4 is a window profile: width 3, stride 1.

We treated the experimental window as the protocol
frame. Those are different objects.

``` text
window   local decoding primitive     K4
frame    application message boundary this note
```

------------------------------------------------------------------------

## 2. A framed conversation

``` text
A1 → B1 → A2 → B2 → A3 → B3 → A4
│                              │
START X                    FINISH X
└──────────────────────────────┘
             FRAME X
```

Inside the frame, each accepted turn contributes
carrier state. START and FINISH are state
transitions, not necessarily a literal `X` on the
wire. One open frame per session may be enough; an
explicit frame id is not chosen here.

``` text
one 3-turn window
      ↓
action + resource + N
```

is the old demand. A frame can establish action and
resource early and let the body accumulate argument:

``` text
FRAME
  START
    action   = GET
    resource = CUSTOMER
  turn → V
  turn → V
  turn → V
  …
  FINISH
    ↓
  decode accumulator
    ↓
  argument
```

The UUID problem is no longer “put 128 bits in one
sentence.” It is “accumulate enough deterministic
state to reconstruct the argument before FINISH.”
Frame length absorbs payload size.

A2 measured ~4.9 observable bits in a 32-reply cell
after an exact previous turn. That is not a design
rate. If useful payload later accrues at a few bits
per accepted turn, a large argument is a longer
frame, not a richer sentence.

------------------------------------------------------------------------

## 3. Session and frame

P7 already showed that conversational state can be
established by a natural-language handshake. That is
session setup. START/FINISH are a second level.

``` text
SESSION
  handshake
  NCMP interpretation is on

FRAME
  START     new application message
  BODY      accumulate application data
  FINISH    close application message
```

``` text
IDLE
  │ START
  ▼
FRAME_ACTIVE { action, resource, accumulator, … }
  │ turns; accumulator grows
  │ FINISH
  ▼
DECODE / COMMIT
  │
  ▼
IDLE
```

The session stays active. Another frame can begin
later.

------------------------------------------------------------------------

## 4. Variable rate

In a fixed 3-turn frame, `rₙ` is awkward: the
payload must finish by turn 3.

``` text
START
  r₁, r₂, r₃, …
  enough?
  FINISH
```

The frame continues until the accumulator holds what
START promised. That is `language opportunity ↔
payload`. `rₙ` and `πₙ` still come from shared
history, not from a private candidate list
(`NCMP-V3-Coding.md`).

------------------------------------------------------------------------

## 5. K4 remains

The rolling width-3 window does not disappear. It
is the low-level carrier primitive *inside* a
variable-length application frame.

``` text
FRAME
  START
  ├─ [A1 B1 A2] → contribution
  ├─ [B1 A2 B2] → contribution
  ├─ [A2 B2 A3] → contribution
  └─ …
  FINISH
```

``` text
Session
   ↓
Frame
   ↓
Conversational turns
   ↓
Rolling windows
   ↓
Carrier observations
```

Do not open K5. Do not reopen the K branch to give
the window a new relation. F4 does not route its
payload through K4. Per-turn `V(U) = C6(U)` is a
simpler body carrier. K4 stays a proven V3
mechanism.

------------------------------------------------------------------------

## 6. What this is not

- an experiment;
- a claimed bits-per-turn rate;
- A3;
- K5;
- NCMP/3.0 or NCMP/4.0.

F1 (Result #1, PASS) is frozen. F2 (Result #2, PASS)
is frozen. F3 (Result #3, PASS) is frozen: START
declares a bit count and FINISH reconstructs those
bits from the forced K4 stream. Frame length
absorbs argument length. That is reassembly, not
natural encoding.

F4 (Result #4, PASS) is frozen. An 8-bit argument
can travel in unchanged natural turns through
history-derived bins. `R`, `π`, `accept`, and
`k = 50` are frozen with it. That is mechanism,
not reliability.

F5 (Result #5, PARTIAL) is frozen. The declared
battery hit every tested bin. That is not an
independent per-turn `p` and not `p^50`.

F6 (Result #6, PARTIAL) is frozen. Eighteen
independent sets hit the declared bin; each set
covered every bin of its rate. `N = 6` is tiny.
`R` is not calibrated.

F7 (Result #7, PASS) is frozen. Next-mode is
conversational state.

F8 (Result #8, PASS) is frozen. The F7 rule
on twenty declared ordinary turns produced a
nontrivial sparse schedule. Both participants
stayed synchronized. No statistical claim.

Temporal sparsity is established. Symbolic
coding is the remaining question, and it is
now smaller: a DATA turn needs only
`{0, 10, 11}` plus `next_mode` from the same
`V`. Same 64 residues, two interpretations.
`next_mode(V)` agrees across SKIP and DATA.
Candidate maps and budgets: `NCMP-V4-J.md`.
F9 (Result #9, PASS) is frozen. One turn
jointly yields a prefix codeword and the
next mode.

F10 (Result #10, PASS) is frozen. A sparse
frame carried a complete 8-bit argument.
V4 experiments stop. There is no F11.
Ordered lossless transport is assumed.
What V4 is: `NCMP-V4-Architecture.md`.
Baseline decisions: `NCMP-V4-Baseline.md`.
Profile 0 is locked. One 128-bit UUID
run is `NCMP-V4-UUID.md`. No version
number.
