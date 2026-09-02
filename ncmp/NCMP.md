# Natural Conversation Messaging Protocol (NCMP)

**Version:** 0.1  
**Status:** NCMP v0.1 Experimental. Not frozen.  
**Date:** September 2026  
**Document:** NCMP v0.1 Experimental  
**Control research:** [../v4/NCMP-Control.md](../v4/NCMP-Control.md)

A deterministic, stateful messaging protocol carried through natural-language conversation.

NCMP is an experimental protocol demonstrating that a natural-language conversation can act as a deterministic stateful transport for machine-readable application data. This text is the v0.1 Experimental specification. It is not production-hardened. The Profile bootstraps NCMP; the conversation establishes the control vocabulary of the resulting session.

This document is sufficient to understand NCMP, implement the Baseline Profile, and evaluate prefix conformance. A reader who has only this file can write `process(transcript) → protocol state` correctly. The reference implementation and tests are optional. They do not define the protocol.

Robustness, strong covertness evidence, and profile optimization remain open.

Throughout, three things are kept distinct:

| Layer | Meaning |
| --- | --- |
| **Architecture** | What NCMP fundamentally is |
| **Profile** | One concrete realization of that architecture |
| **Evidence** | What experiments have actually shown |

The keywords MUST, MUST NOT, SHALL, SHALL NOT, and MAY are used as in RFC 2119. Implementations of NCMP v0.1 MUST implement the Baseline Profile defined here.

------------------------------------------------------------------------

## Abstract

NCMP treats an ordinary natural-language conversation as a deterministic stateful transport, where shared conversational state determines which utterances carry application data, how that data is decoded, and how successive fragments reconstruct a framed machine message.

Participants keep talking in ordinary English. Independently, each applies the same protocol profile to the same ordered transcript. Shared state decides whether the current utterance contributes a payload fragment, how that fragment is read, and what the next state will be.

``` text
English layer      ordinary conversational meaning
Protocol layer     state transition
                   +
                   optional payload fragment
```

``` text
decode(stateₙ, Uₙ) → (bitsₙ, stateₙ₊₁)
```

The protocol object is the conversation, not the individual sentence. Not every utterance carries application data. Every utterance inside an active frame advances protocol state; only some state-selected turns contribute bits.

The Baseline Profile is an example agreement: a 64-state letter-sum carrier, a sparse SKIP/DATA schedule, small ACTION × RESOURCE codebooks, a bootstrap hint, and session-derived frame pairs. Those choices are a profile, not the architecture. A later profile may change the carrier, the code, the codebooks, the seed, the hint, or the session word list without changing what NCMP is.

------------------------------------------------------------------------

## Motivation

Machines normally communicate using explicitly machine-shaped messages: JSON, protobuf, HTTP, RPC, binary frames. Those formats work. They also require a channel whose contents are visibly those formats.

NCMP explores a different question:

> Can machines exchange deterministic protocol information through the natural-language conversation they are already having?

The conversation remains a conversation. It also drives a shared state machine. Application data, when it is present, is reconstructed from that machine — not from a side channel, and not from a secret dictionary of word meanings.

NCMP is not:

- encryption;
- a cipher in which words have fixed secret meanings;
- “convert JSON into English”;
- a claim that natural language itself is deterministic;
- merely hiding a number inside an individual sentence.

Natural language is not deterministic. The conversation *plus* a shared protocol profile *plus* an ordered transcript is.

------------------------------------------------------------------------

## Core idea

Both participants start from the same initial protocol state and the same profile. They then see the same ordered utterances.

``` text
A                                         B
        natural-language conversation
───────────────────────────────────────────────>
        U₁
        U₂
        U₃
        U₄
        ...
          ↓ same protocol profile
     state₀                       state₀
        ↓ U₁                        ↓ U₁
     state₁                       state₁
        ↓ U₂                        ↓ U₂
     state₂                       state₂
```

Given the same protocol profile and the same ordered transcript, both participants independently derive the same protocol state after every prefix.

That is the foundation. Nothing in the protocol requires the sender to announce “this turn is data.” The receiver does not consult an encoder, a candidate list, or a language model. The receiver computes:

``` text
shared state
     +
accepted natural-language turn
     ↓
deterministic transition
     ↓
optional payload fragment
     +
new shared state
```

If two implementations disagree after any prefix, at least one of them is not conforming.

------------------------------------------------------------------------

## The protocol object is the conversation

NCMP does not require every utterance to encode payload. Every utterance inside an active frame advances protocol state; only some state-selected turns contribute application data.

``` text
conversation
A → B       transition
B → A       transition
A → B       payload + transition
B → A       transition
A → B       payload + transition
...
```

An application message is not stuffed into one sentence. It is accumulated across a framed stretch of conversation. Frame length absorbs argument length. Turn count is not the frame.

Outside a frame, ordinary conversation is just conversation. Inside a frame, there is no “this turn does not count.” If the utterance is not a control, it is a BODY event.

------------------------------------------------------------------------

## Session and framing

**Architecture.** A session turns NCMP interpretation on. A frame is one application message.

``` text
idle
  ↓  PROBE
handshake
  ↓  ACK
     derive K_session
     derive START_PAIR from U_probe
     derive FINISH_PAIR from U_ack
active
  ↓  START(length)
BODY
  ↓
BODY
  ↓
...
  ↓  FINISH
active
```

- The **handshake** (PROBE, then ACK) establishes that both sides will interpret subsequent conversation under the profile. ACK derives `K_session` from the two exact strings. From those same strings the receiver derives the session’s START and FINISH pairs. The handshake does not open an application message.
- **START** opens a frame when the session pair is present and `P_sec = T_START`. Argument length is `L(K_session, U)`, not a reserved length word.
- **BODY** is variable length. The frame stays open until the owner FINISHES.
- **FINISH** closes the frame. If the declared bits have been accumulated, the argument is complete. If not, the frame is incomplete.

Frame length is independent of turn count. A five-bit argument and a 128-bit argument use the same control grammar. The body is longer when it needs to be.

At most one frame is open. Nested START is rejected. After FINISH, the session remains active; another START may open a later frame. There is no frame identifier.

------------------------------------------------------------------------

## Application object

The reconstructed object has three fields:

``` text
ACTION  RESOURCE  ARGUMENT
```

ACTION and RESOURCE codebooks are **profile parameters**. Participants MUST agree them before they interpret a session. NCMP specifies how selected values are transmitted, not what the bit patterns mean.

``` text
pre-agreed                         transmitted
what 0 and 1 mean                  which action
                                   which resource
                                   what argument
```

``` text
A = |ACTION codebook|
R = |RESOURCE codebook|
action_width   = ceil(log2 A)    (0 if A = 1)
resource_width = ceil(log2 R)    (0 if R = 1)
header_width   = action_width + resource_width
```

Unused bit patterns are reserved. They MUST NOT complete an object.

START declares only `argument_bits`. Header width is determined by the agreed codebooks. BODY is one bitstream:

``` text
[action bits][resource bits][argument bits]
```

`argument` is a bitstring of one of the five Baseline Profile lengths. Any bit pattern of a legal length is permitted, including the empty bitstring. An empty argument still spends the header.

The Baseline Profile below is an example agreement for conformance, not the NCMP vocabulary. A later profile may publish other tables. That is a profile change, not a change to what a conversation is.

------------------------------------------------------------------------

## Ownership and directionality

Conversation is bidirectional. Application payload is directional.

``` text
A opens the frame
A ───── application payload ─────→ B
A ↔ B ↔ A ↔ B    conversation
```

Either speaker MAY open a frame. Only the opener (the **owner**) MAY contribute application bits (header and argument) and MAY FINISH that frame. The peer’s utterances still affect shared protocol state: they change the mode that will apply to later owner turns.

The peer is not a silent channel. The peer is not a second payload sender. The peer talks, and talking changes what the owner’s next turn will mean.

If the peer requires an application object, the peer SHALL wait until the current frame is closed and SHALL open its own frame.

`DATA` / `SKIP` is mode. Payload authority is ownership. They are not the same. Implementations MUST NOT introduce owner or peer modes.

------------------------------------------------------------------------

## Sparse payload

Mode is `SKIP` or `DATA`. It is not ownership.

``` text
SKIP
    U → no payload
      → next state
DATA
    U → payload fragment   (owner only, wire remaining > 0)
      → next state
```

DATA does not mean the utterance visibly contains data. It means that under the shared protocol state, the owner’s utterance contributes a protocol symbol.

The same visible kind of natural-language turn, in a different protocol state, has a different protocol interpretation.

``` text
same U
+
different mode
=
bits, or no bits
```

Tomorrow’s mode is a function of today’s `V`, not of today’s mode. Peer turns and owner SKIP turns still set tomorrow. That is how a sparse schedule can look irregular and still be shared.

------------------------------------------------------------------------

## Baseline Profile

**Profile.** The Baseline Profile is an example agreement. Implementations of NCMP v0.1 MUST implement it for conformance. It is deliberately small because conversation is scarce. It is not an architectural limit.

``` text
ACTION codebook     GET | SET
RESOURCE codebook   CUSTOMER | ORDER
action_width        1
resource_width      1
header_width        2
carrier             C6
states              64
initial mode        SKIP
transition          V < 32  → DATA
                    otherwise SKIP
ordinary alphabet   {0, 10, 11}
final bit           V mod 2
control_seed        0x9CA2C1C1
bootstrap_hint      umbrella
session_words       closed 32-word list below
secondary           P_sec(U) = FNV-1a32(UTF-8(U)) & 0x3F
argument lengths    L(K_session, U) → {0, 5, 8, 24, 128}
```

``` text
0  GET                 0  CUSTOMER
1  SET                 1  ORDER
```

All four combinations are legal. The decoder parses the first header bit as ACTION and the second as RESOURCE. It does not treat `00` as the atom GET CUSTOMER.

A wider table (4 actions × 6 resources, 5-bit header) has been shown on the same machine. That is demonstrated extensibility, not this profile.

Header cost is `ceil(log2 A) + ceil(log2 R)`. Profile designers SHOULD keep that cost small relative to the conversations they intend to use.

------------------------------------------------------------------------

## Carrier: C6

**Profile.** `V = C6(U)` is total and model-free. Implementations MUST compute it as follows.

1. Apply Unicode Normalization Form C (NFC).
2. Map to lowercase.
3. Select the characters whose code points are in `a`..`z`. All other characters, including spaces, punctuation, digits, marks, and letters outside `a`..`z`, MUST be ignored.
4. Let `value('a') = 1`, …, `value('z') = 26`.
5. `V = (Σ value(ch)) mod 64`.

Two utterances with the same selected letter sequence MUST yield the same `V`. The empty string has `V = 0`. Digits MAY appear in `U`. They do not affect `V`.

Examples:

``` text
Want to walk before the shops get busy?     V = 16
The tea in the flask is still warm enough.  V = 5
Let us close this round here.               V = 39
Hi.                                         V = 17
Let's meet around 7:30 before the lot
fills up.                                   V = 14
```

These sentences illustrate `C6`. They are not control phrases.

C6 is a baseline carrier. It is not the intellectual core of NCMP. Any total map from utterance to a finite alphabet could sit in this slot.

Rules used only when *searching* for a sendable `U` (token minima, digit bans, punctuation) are encoder-private. They are not part of `V` and not part of decode. Decode is defined for every string.

------------------------------------------------------------------------

## Symbol decoding

**Profile.**

``` text
transition(V):
    if V < 32:  DATA
    else:       SKIP

symbol(remaining, V):
    if remaining = 1:
        return "0" if V mod 2 = 0
        return "1" if V mod 2 = 1
    if remaining ≥ 2:
        r = V mod 3
        if r = 0:  "0"
        if r = 1:  "10"
        if r = 2:  "11"
```

`transition(V)` is a function of `V` only. Current mode does not change tomorrow’s mode.

`symbol` uses **wire remaining**: unfilled header bits plus unfilled argument bits. SKIP/DATA does not care which part is being filled.

Declared payload length selects one of the five legal argument lengths. Header width is profile. Any bit pattern of a legal argument length is permitted. Ordinary symbols are one or two bits. The last bit, if the remainder is one, uses `V mod 2`. The wire tiles:

``` text
wire remaining ≥ 2     →  {0, 10, 11}
wire remaining = 1     →  V mod 2
wire remaining = 0     →  PAYLOAD_COMPLETE
```

`argument_bits = 0` is legal. The header MUST still be filled. START followed immediately by owner FINISH is `INCOMPLETE`.

About half of the 64 carrier states schedule DATA next; about half schedule SKIP. That is why most body turns in this profile do not contribute bits.

Peer BODY events and owner SKIP BODY events MUST compute `transition(V)` and MUST NOT append bits.

------------------------------------------------------------------------

## Control recognition

These rules are normative. Protocol meaning is `(Profile, state, U)`, not `U` alone. There is no reserved PROBE phrase, ACK phrase, START phrase, or FINISH phrase.

`U` is the exact string delivered by the transport. Implementations MUST compute `P_sec` and `L` on that exact UTF-8. They MUST NOT NFC-normalize `U` for those functions.

### Hint tokens

PROBE and ACK use the Profile `bootstrap_hint`. It is tested against tokens:

1. Apply Unicode Normalization Form C (NFC).
2. Map to lowercase.
3. Split on whitespace.
4. From each part, delete every character outside `a`..`z`.
5. Discard empty parts.

The utterance has the hint if and only if the remaining token list contains the Profile hint (`umbrella` in the Baseline Profile). START and FINISH do not consult the hint.

### Word runs

Frame pairs use conversational word-runs, not hint tokens:

1. Apply Unicode Normalization Form C (NFC).
2. Map to lowercase.
3. Take every maximal `[a-z]+` run, in order.

Call that list `words(U)`. Membership is first occurrence in `words(U)`. Adjacency is not required.

### Eligible words

From `words(U)`, keep a word if and only if all of the following hold. First-seen order is preserved.

``` text
length ≥ 5
not the Profile bootstrap_hint
not in STOP
not already kept
```

`STOP` is a closed function-word list. It is not taken from a handshake:

``` text
about after again because before being between could every first
going having might other rather shall should since still their
there these those though through under until where which while
would without within
```

### Pair completion

After ACK, both sides derive:

``` text
START_PAIR  = completePair(U_probe, K_session, START)
FINISH_PAIR = completePair(U_ack,   K_session, FINISH)
```

Use what the conversation gives. Derive only what it does not.

``` text
eligible ≥ 2    donate 2
eligible = 1    donate 1 + derive 1
eligible = 0    derive 2
```

Donated pair, when at least two eligible words exist. Combinations are first-seen order `(i, j)` with `i < j`. Not all permutations.

``` text
tag         0x06 for START, 0x07 for FINISH
index       FNV-1a32( be32(control_seed) || tag || UTF-8(U) ) mod C(n,2)
pair        combinations[index]
```

Derived fill uses the Profile `session_words` list and `K_session`. The Baseline list is closed. It is not a rarity list. It does not contain `umbrella`.

``` text
along around bench bottle bread bridge coffee corner
early enough extra flask gate jacket later market
maybe mostly packed park pasta path ridge shops
simple sweater trail turn view walk weather window
```

``` text
derivedWord(K_session, role, slot, exclude):
    tag     = 0x0A + slot     if role = START
              0x0C + slot     if role = FINISH
    i       = FNV-1a32( be32(K_session) || tag || UTF-8(role) ) mod |session_words|
    word    = session_words[i]
    if word = exclude: word = session_words[(i + 1) mod |session_words|]
```

``` text
completePair(U, K_session, role):
    if donated pair exists:           return that pair
    if exactly one eligible word w:   return (w, derivedWord(..., slot=1, exclude=w))
    first ← derivedWord(..., slot=0, exclude=absent)
    return (first, derivedWord(..., slot=1, exclude=first))
```

An utterance carries a pair if and only if both words occur in `words(U)` and the first word appears before the second.

Published walk pairs (`K_session = 0xDCA0B418`):

``` text
START_PAIR   (saturday, morning)
FINISH_PAIR  (sounds, bring)
```

### FNV-1a 32

Implementations MUST compute:

``` text
FNV_OFFSET = 2166136261
FNV_PRIME  = 16777619
h = FNV_OFFSET
for each byte b of the input:
    h ← ((h XOR b) × FNV_PRIME) mod 2³²
```

``` text
P_sec(U) = FNV-1a32(UTF-8(U)) & 0x3F
```

### Derived targets

`be32(x)` is `x` as four bytes, most significant first.

``` text
T_probe     = control_seed & 0x3F

T_ack       = FNV-1a32( be32(control_seed) || 0x00 || UTF-8(U_probe) ) & 0x3F

K_session   = FNV-1a32( be32(control_seed) || 0x00 || UTF-8(U_probe)
                        || 0x01 || UTF-8(U_ack) )

T_START     = FNV-1a32( be32(K_session) || 0x00 || UTF-8("START") ) & 0x3F
T_FINISH    = FNV-1a32( be32(K_session) || 0x00 || UTF-8("FINISH") ) & 0x3F

L(K_session, U):
    i = FNV-1a32( be32(K_session) || 0x02 || UTF-8(U) ) mod 5
    argument_bits = (0, 5, 8, 24, 128)[i]
```

`L` is defined for every `U`. It is a length declaration if and only if the turn is START.

### Recognizers

``` text
idle                  PROBE    hint ∧ P_sec = T_probe
handshake             ACK      hint ∧ P_sec = T_ack(U_probe)
active, no frame      START    START_PAIR ∧ P_sec = T_START
                      FINISH   FINISH_PAIR ∧ P_sec = T_FINISH   → NO_FRAME
FRAME_ACTIVE          START    START_PAIR ∧ P_sec = T_START    → NEST
                      FINISH   FINISH_PAIR ∧ P_sec = T_FINISH
```

A bootstrap-hinted utterance that misses the residual is ordinary before ACTIVE. After ACK, `umbrella` without the session pair is ordinary: `CHAT` when no frame is open, BODY when a frame is open. A pair-bearing utterance that misses the residual is likewise ordinary.

START declares `argument_bits = L(K_session, U)`. The five Baseline lengths are the only values `L` can return. Baseline START does not produce `UNDECLARED` or `CONTROL_ERROR`. `L` is defined for every `U`. It is a length declaration if and only if the turn is START.

Published examples from one demonstrated session (`K_session = 0xDCA0B418`). They are legal forms, not the only legal forms:

``` text
PROBE    Thinking we could walk Saturday morning—what do you say? I’ll pack an umbrella, just to be on the safe side!
ACK      Sounds good. I'll bring my umbrella too, just in case.
START    We can set off Saturday in the morning. The park works!                          →  5
FINISH   Alright, that sounds good. I'll bring the notes.

L        Yeah, I guess let's head out in the morning. I'll grab the umbrella too!         →  0
         Yeah, I guess let's head out in the morning. I'll have an umbrella as well!      →  8
         Yeah, I guess we can set off Saturday morning. I'll grab an umbrella too.        →  128
```

The three `L` strings witness that `L` is total. They are not START under this handshake. `argument_bits = 0` remains legal. It is not demonstrated on this handshake.

------------------------------------------------------------------------

## State

A participant MUST maintain:

``` text
session        idle | handshake | active
u_probe        absent | exact PROBE string
u_ack          absent | exact ACK string
k_session      absent | 32-bit session material
frame          absent | FrameState
last_object    absent | { action, resource, argument }
```

``` text
FrameState {
    owner               A | B
    argument_bits       ∈ {0, 5, 8, 24, 128}
    mode                SKIP | DATA
    accumulator         bitstring
    header_remaining    header_width − min(|accumulator|, header_width)
    argument_remaining  argument_bits − max(0, |accumulator| − header_width)
}
```

ACTION and RESOURCE are decoded from the accumulator prefix once those bits exist. They are not assigned at START.

Initial state: `session = idle`, `u_probe` absent, `u_ack` absent, `k_session` absent, `frame` absent, `last_object` absent.

At most one frame SHALL be open. An implementation MUST NOT keep protocol state for a closed frame except `last_object`.

------------------------------------------------------------------------

## process

This is the complete Baseline Profile machine. Implementations MUST apply it to each `(speaker, U)` in order.

`U` is the exact string delivered by the transport. Implementations MUST NOT normalize `U` for `P_sec`, `L`, or `K_session`. C6 uses letter extraction. The bootstrap hint uses tokenization. Frame pairs use word-runs. Each utterance MUST have exactly one speaker, `A` or `B`.

``` text
process(state, speaker, U):

    if session = idle:
        if PROBE(U):
            session ← handshake
            u_probe ← U
            return PROBE
        return NOT_NCMP               // no state change

    if session = handshake:
        if ACK(U):
            session ← active
            u_ack ← U
            k_session ← K_session(u_probe, U)
            return ACK
        return NOT_NCMP               // no state change

    // session = active
    if frame is absent:
        if START(U):
            n ← L(k_session, U)
            frame ← {
                owner              = speaker
                argument_bits      = n
                mode               = SKIP
                accumulator        = ""
                header_remaining   = header_width
                argument_remaining = n
            }
            return START
        if FINISH(U):
            return NO_FRAME           // no state change
        return CHAT                   // no state change

    // FRAME_ACTIVE
    if START(U):
        return NEST                   // no state change

    if FINISH(U):
        if speaker ≠ owner:
            return NOT_OWNER          // no state change
        if header_remaining + argument_remaining > 0:
            close frame
            return INCOMPLETE         // last_object unchanged
        parse accumulator as ACTION, RESOURCE, ARGUMENT
        if ACTION or RESOURCE is reserved:
            close frame
            return HEADER_RESERVED    // last_object unchanged
        last_object ← { ACTION, RESOURCE, ARGUMENT }
        close frame
        return FINISH_ARGUMENT

    V ← C6(U)
    need ← header_remaining + argument_remaining

    if speaker = owner and mode = DATA and need = 0:
        mode ← transition(V)
        return PAYLOAD_COMPLETE       // accumulator unchanged

    if speaker = owner and mode = DATA and need > 0:
        bits ← symbol(need, V)
    else:
        bits ← ""

    if |bits| > need:
        return OVERFLOW               // no state change

    mode ← transition(V)
    if bits ≠ "":
        accumulator ← accumulator + bits
        // header fills first; then argument
        return BODY_DATA(bits)
    return BODY_SKIP
```

START and FINISH have no effect until `session = active`. While `session = active`, PROBE and ACK recognizers are not consulted. A later turn that would have been PROBE or ACK in an earlier state is ordinary conversation.

While a frame is active, every non-control utterance MUST be processed as a BODY event. CHAT MUST NOT occur while a frame is active.

If wire remaining is 0 and the owner produces a further DATA BODY event, the outcome is `PAYLOAD_COMPLETE`. The frame SHALL remain open until the owner FINISHES.

OVERFLOW MUST NOT occur for this profile’s `symbol` when wire remaining ≥ 1. An implementation SHALL still apply the check.

After FINISH, `session` remains `active`. A later START MAY open a new frame.

The completed application object is:

``` text
last_object.action  last_object.resource  last_object.argument
```

Under the Baseline example profile, `00` + `10111` is `GET CUSTOMER 10111`.

------------------------------------------------------------------------

## Outcomes

For every `(state, speaker, U)` an implementation MUST return exactly one of the following outcomes.

``` text
idle / handshake
    PROBE
    ACK
    NOT_NCMP

active, no frame
    START
    CHAT
    NO_FRAME

FRAME_ACTIVE
    BODY_SKIP
    BODY_DATA(bits)
    PAYLOAD_COMPLETE
    FINISH_ARGUMENT
    INCOMPLETE
    HEADER_RESERVED
    OVERFLOW
    NEST
    NOT_OWNER
```

`BODY_DATA` MUST occur only when `speaker = owner`, `mode = DATA`, and wire remaining > 0 before the event. A peer turn while mode is DATA MUST return `BODY_SKIP`.

The following outcomes MUST NOT change session or frame state: `NOT_NCMP`, `CHAT`, `NO_FRAME`, `NEST`, `NOT_OWNER`, `OVERFLOW`.

`UNDECLARED` and `CONTROL_ERROR` are unused by Baseline length declaration. Implementations MAY retain them as unused outcomes.

`PAYLOAD_COMPLETE` MUST update `mode` and MUST NOT change `accumulator` or remaining counts.

`INCOMPLETE` and `HEADER_RESERVED` close the frame and MUST NOT set `last_object`.

------------------------------------------------------------------------

## Natural-language encoding

The encoder is **not** part of the protocol.

The receiver needs only:

``` text
shared state
+
accepted U
```

The sender may do anything that produces a `U` for the current conversational job:

``` text
conversational intent
        ↓
generate natural realizations
        ↓
find one whose carrier value
produces the required symbol
        ↓
send U unchanged
```

No candidate list crosses the wire. The receiver does not know how many alternatives existed, whether a language model was used, what was rejected, or which index was selected. Search budget and surface hygiene are encoder-private.

A miss at the encoder is not a protocol defect. The referee still sees the utterance that was sent, or the conversation that ended without one.

------------------------------------------------------------------------

## Worked example

Baseline example profile. START declares `argument_bits = 5`. Header 2 bits. Owner is A. The word `short` does not appear in the utterance.

``` text
wire   00 10111
       ││ └── argument
       │└── RESOURCE  0 → CUSTOMER
       └── ACTION     0 → GET
```

``` text
A  Thinking we could walk Saturday morning—what do you say? I’ll pack an umbrella, just to be on the safe side!
                                                   PROBE
B  Sounds good. I'll bring my umbrella too, just in case.
                                                   ACK
A  We can set off Saturday in the morning. The park works!
                                                   START  argument 5
```

``` text
turn  speaker  mode   utterance                                              V    bits   next
U1    A        SKIP   How was dinner last night after you sat down?        22    —      DATA
U2    B        DATA   The pasta was decent and the bread came out warm.    15    —      DATA
U3    A        DATA   Yes, the park gate works if we leave early.          12     0     DATA
U4    A        DATA   I packed two bottles and left the extra sweater.      6     0     DATA
U5    A        DATA   Should we grab some fresh bread at the market, or
                      do you think we should just bake it later?           19    10     DATA
U6    B        DATA   Do you think we should bring jackets this time?      23    —      DATA
U7    A        DATA   What do you think about cooking at home with all
                      our fresh finds, or should we go out and eat
                      instead?                                             11    11     DATA
U8    A        DATA   Mostly yes and the coffee almost made up for it.      5     1     DATA
```

``` text
A  Alright, that sounds good. I'll bring the notes.
                                                   FINISH_ARGUMENT
```

``` text
accumulator   0 + 0 + 10 + 11 + 1  =  0010111
object        GET CUSTOMER 10111
```

U3–U4 fill the header. U5, U7, U8 fill the argument. Peer turns contribute no bits. They still set next mode. The first body turn after START is always SKIP in this profile.

GET and CUSTOMER are values recovered from the first two bits. They are not assigned at START. The same argument with header `01` is GET ORDER 10111.

------------------------------------------------------------------------

## Determinism and conformance

Given the same profile and the same ordered transcript, conforming implementations MUST produce identical `session`, `u_probe`, `u_ack`, `k_session`, `frame`, `last_object`, outcome, and BODY bits after every prefix — not merely the same final argument.

An independent referee:

1. starts from idle;
2. applies each `(speaker, U)` with `process`;
3. records outcome, bits, mode, accumulator, and remaining after every turn.

The encoder is invisible to this check.

Independent verification of BODY events SHALL use:

``` text
ref_transition(V)  =  DATA if V < 32 else SKIP

ref_symbol(remaining, V):
    remaining ≤ 0  →  ""
    remaining = 1  →  V mod 2 as a bit
    remaining ≥ 2  →  half3 as above

ref_bits(mode, remaining, speaker, owner, V):
    "" if speaker ≠ owner or mode ≠ DATA
    else ref_symbol(remaining, V)
```

A conforming implementation’s BODY `bits` and resulting `mode` MUST equal `ref_bits` and `ref_transition` on that event.

Required cases include:

- handshake then session CHAT;
- START of a 5-bit frame;
- owner SKIP then peer BODY;
- owner DATA symbols `10`, `11`, and a final bit;
- `FINISH_ARGUMENT` object `GET CUSTOMER 10111`;
- the same argument with a flipped RESOURCE bit → `GET ORDER 10111`;
- owner FINISH with `remaining > 0` → `INCOMPLETE`;
- peer FINISH → `NOT_OWNER`;
- START while a frame is open → `NEST`;
- owner DATA after the accumulator is full → `PAYLOAD_COMPLETE`;
- the clock-time peer boundary below;
- `Hi.` while no frame is open → `CHAT`;
- `Hi.` while a frame is open → BODY (`V = 17`, `transition` → `DATA`);
- `umbrella` without the session pair, while no frame is open → `CHAT`;
- ordinary conversation before PROBE → `NOT_NCMP`;
- ordinary conversation after FINISH → `CHAT`.

`argument_bits = 0` is legal. START followed immediately by owner FINISH is `INCOMPLETE`. Those rules remain. They are not demonstrated on this handshake.

Clock-time peer boundary:

``` text
FRAME_ACTIVE, owner = A, mode = SKIP
B: Let's meet around 7:30 before the lot fills up.
    → BODY_SKIP
    → V = 14
    → bits = ""
    → mode = DATA
```

Digits in the utterance do not affect `V`. The turn is still BODY.

### Reference transcript

Speakers and exact strings. After FINISH, `last_object` MUST be `{ GET, CUSTOMER, 10111 }`.

``` text
A  Saturday still work for you?
      NOT_NCMP
A  Thinking we could walk Saturday morning—what do you say? I’ll pack an umbrella, just to be on the safe side!
      PROBE
B  Sounds good. I'll bring my umbrella too, just in case.
      ACK     K_session = 0xDCA0B418
              START_PAIR  = (saturday, morning)
              FINISH_PAIR = (sounds, bring)
A  Hi.
      CHAT
A  We can set off Saturday in the morning. The park works!
      START  owner=A  argument_bits=5  header_remaining=2  mode=SKIP
A  How was dinner last night after you sat down?
      BODY_SKIP  V=22  bits=""  mode=DATA  h=2  arg=5
B  The pasta was decent and the bread came out warm.
      BODY_SKIP  V=15  bits=""  mode=DATA  h=2  arg=5
A  Yes, the park gate works if we leave early.
      BODY_DATA  V=12  bits=0  acc=0  h=1  arg=5
A  I packed two bottles and left the extra sweater.
      BODY_DATA  V=6  bits=0  acc=00  h=0  arg=5
A  Should we grab some fresh bread at the market, or do you think we should just bake it later?
      BODY_DATA  V=19  bits=10  acc=0010  arg=3
B  Do you think we should bring jackets this time?
      BODY_SKIP  V=23  bits=""  arg=3
A  What do you think about cooking at home with all our fresh finds, or should we go out and eat instead?
      BODY_DATA  V=11  bits=11  acc=001011  arg=1
A  Mostly yes and the coffee almost made up for it.
      BODY_DATA  V=5  bits=1  acc=0010111  arg=0
A  Alright, that sounds good. I'll bring the notes.
      FINISH_ARGUMENT  GET CUSTOMER 10111
A  See you at the gate.
      CHAT
```

### Out of scope

This protocol does not define:

- an encoder, candidate search, or surface hygiene;
- robustness, loss, duplication, reordering, resynchronization, integrity, or replay;
- distinguishability or camouflage.

------------------------------------------------------------------------

## What has been demonstrated

**Evidence.** Claims below are measured. They are not laws.

### Protocol

- Deterministic baseline specified; prefix conformance demonstrated on two independent machines.
- The Profile bootstraps; the conversation establishes later control vocabulary. START length is `L(K_session, U)`. No reserved control phrase.
- Control recognition is conjunctive. On the held-out ordinary corpus (`N = 99434`), the published walk session had 0 accidental START and 0 accidental FINISH. Five turns contained the START pair `(saturday, morning)`; none also hit `T_START`. The same freeze had 1 accidental PROBE. Measured, not a bound.
- ACTION and RESOURCE are profile codebooks. Selected values are transmitted as a fixed-width BODY header. 2×2 composes; a wider 4×6 header composes on the same machine.
- Arbitrary bit patterns are supported for each Baseline Profile argument length.
- A 128-bit UUID was transmitted end to end as argument under the earlier constant-type Profile 0. That run is evidence of argument transport, not of the header.

### Encoding

In the closed reliability battery (spec-legal sizes 8, 24, 128; ten declared cells):

- 252 / 252 constrained owner-DATA opportunities succeeded;
- no search miss (`NO_CANDIDATE` was 0);
- mean search 3.07 candidates, median 2, p95 8, maximum 16, under a private search budget of 50.

Three of ten frames did not complete. Those stops were exhausted conversation scripts, not search failures.

### Capacity

In the first naturally bounded evaluation (conversation generated with no payload target, then measured):

- chosen bits carried: 2–10 in the search-complete scenes;
- recurring observed density around ~0.3 bits per body turn.

That density is not a bound or a law. The denominator still includes generator persistence after the task is settled.

### Distinguishability

In three intent-paired, job-skeleton conversations, declared surface statistics showed no obvious separation, and the blind preference judge did not identify TREATMENT as less natural in any pair.

This is not a covertness claim. The sample is tiny. One of three treatment payloads did not complete. Both arms were language-model generated.

------------------------------------------------------------------------

## Capacity and conversational runway

NCMP capacity is a property of a conversation, not merely of the carrier.

``` text
natural conversational runway
            ×
protocol state trajectory
            ↓
usable information budget
```

Two ways to spend conversation:

``` text
payload-driven
  I need to send 128 bits,
  therefore manufacture enough conversation.

conversation-driven
  This conversation is happening anyway.
  How much payload can it naturally carry?
```

A 128-bit identifier through the Baseline Profile wants on the order of a few hundred body turns at the observed density. One successful run used 313. The protocol can carry that object. Ordinary conversation should not be asked to.

The current lesson: NCMP should opportunistically use conversation rather than manufacture conversation solely to transport a large object. Plausible objects on the first natural-capacity sample are a few bits to about ten: a decision, a small enum, a status, a short reference, or a fragment of a larger object across later conversations.

When a conversation ends and payload remains, `process` does not invent more turns. Incomplete frame, smaller object, or a later frame are usage policy above this protocol.

------------------------------------------------------------------------

## Security and covertness terminology

| Term | Status |
| --- | --- |
| Deterministic | Demonstrated for the baseline |
| Covert | Not established |
| Encrypted | No |
| Authenticated | Not yet |
| Tamper-resistant | Not yet |

NCMP’s current result is not cryptographic confidentiality. A third party who knows the profile and sees the transcript can run the same referee. “Sparse” and “natural-looking” are not secrecy.

The first distinguishability probe asked a narrower question: inside matched language-model conversations, did a ~17–21% owner-DATA selection constraint leave an obvious surface or naturalness signature? It did not, in that probe. That is not a covertness result.

------------------------------------------------------------------------

## Assumptions and limitations

### Transport

The baseline assumes an ordered, lossless, duplicate-free conversational transport:

``` text
A sends Uₙ
    ↓
B receives exactly Uₙ
    ↓
exactly once, in order
```

There is no specified handling of turn loss, duplication, reordering, crash recovery, resynchronization, or replay.

### Evaluation

- Distinguishability sample is three pairs.
- Conversations in the capacity and distinguishability evaluations were language-model generated.
- Natural-bound quality (task end versus social tail) is unresolved.
- Encoder misses remain possible (one 2-bit miss in the distinguishability probe; none in the reliability battery).
- The Baseline Profile is not optimized.

### Profile

C6, the SKIP/DATA map, `{0, 10, 11}`, the five START lengths, and the example 2×2 codebooks are the first profile. They are not the architecture. Header cost is `ceil(log2 A) + ceil(log2 R)`. A larger table is legal and has been shown; conversation is the scarce resource.

------------------------------------------------------------------------

## Future work

A roadmap, not a promise of solutions:

``` text
Natural-bound characterization
        ↓
Larger distinguishability evaluation
        ↓
Encoder reliability / efficiency
        ↓
Alternative profiles / carriers
        ↓
Loss / duplicate / reorder
        ↓
Repair / resynchronization
        ↓
Integrity / replay protection
```

------------------------------------------------------------------------

## Optional supporting artifacts

This document is sufficient. The following are optional:

- a reference implementation of `process` (`ncmp/reference/`);
- a conformance test suite for the required cases above;
- research notes on how the architecture was found.

A second implementation that never searches for a sendable `U` can still be a conforming decoder. The encoder is not required for conformance.

------------------------------------------------------------------------

## Appendix: research lineage

P7 established deterministic sentence serialization.  
V3 introduced language and history as shared protocol state.  
V4 established sparse stateful transport across conversation.

Those steps are how NCMP was found. They are not how it should be taught.

This release does not amend any earlier numbered specification.

------------------------------------------------------------------------

## Document map

| Question | Sections |
| --- | --- |
| What is NCMP? | Abstract, Motivation, Core idea |
| How does it work? | Protocol object, Session, Control recognition, Ownership, Sparse payload |
| How do I implement it? | C6, Symbol decoding, Control recognition, State, process, Outcomes |
| Did I implement it? | Conformance, Reference transcript |
| What is not the protocol? | Natural-language encoding |
| What have we demonstrated? | Demonstrated, Capacity, Security terminology, Limitations |
