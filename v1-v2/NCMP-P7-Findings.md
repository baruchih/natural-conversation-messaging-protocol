# NCMP-P7 Experimental Findings

**Status:** Frozen. P7 closed after Result #11. No Result #12.\
**Date:** August 2026\
**Parent:** NCMP/2.0 remains frozen. These results do not amend it.

``` text
NCMP/2.0          hypothesis
P7 experiments    evidence
P7 Findings       this note
```

Do not fold the evidence back into the spec. The spec was the
hypothesis. This note is the evidence. It does not invent a
use case.

------------------------------------------------------------------------

## 1. Claim

Two ambitions were bundled at the start:

``` text
A  Natural language can be the wire representation of a
   deterministic stateful protocol.
B  That wire can look indistinguishable from ordinary
   conversation.
```

P7 supported a narrowed A and rejected B on the present
language. The surviving thesis is the conceptual center:

> Natural-language strings can serve as the exact serialized
> wire representation of a deterministic, stateful,
> compositional machine protocol.

``` text
exact U  +  state S  →  δ(U,S)  →  frame
```

The strongest sentence still justified for a demonstration is
the X1 claim, kept verbatim:

> Two independent participants establish conversational protocol
> state and subsequently exchange an ordinary-language utterance
> that the receiver deterministically reconstructs as GET CUSTOMER 42;
> the identical utterance outside that state is ordinary conversation.

That is a tiny deterministic conversational protocol. It is not
NCMP/2.0. The wording is closed. Do not inflate it.

R1 made A literal. Meaning may not be freely paraphrased and
remain the same frame. JSON `{"id":42}` cannot be rewritten
to “the identifier is forty-two” and remain JSON. An NCMP
sentence cannot be casually rewritten and remain the same
frame. That is a serialization, not a semantic messaging
system.

The work started as “it’s like a cipher, right?” After five
experiments the answer is more precise:

> Not really. It’s a stateful protocol in which natural-language
> utterances are the wire representation, and deterministic
> interpretation depends on both the utterance and established
> conversational state.

------------------------------------------------------------------------

## 2. What changed

The work began as natural language plus a hidden encoding. That
reads as steganography.

What exists now is different. The protocol meaning is not
intrinsic to the string.

``` text
meaning = δ(U, S)
```

``` text
                    OPEN TEXT CHANNEL
                           │
                           ▼
                 ordinary conversation
                           │
              ┌────────────┴────────────┐
              │                         │
            IDLE                      ACTIVE
              │                         │
        human meaning             human meaning
                                      +
                              protocol semantics
                                      │
                              ┌───────┼───────┐
                              D       E       N
                              │       │       │
                             GET  CUSTOMER    42
```

The wire carries `U` only. Residues, modes, and frames never
cross the channel. The same bytes, under the same decoder code,
are conversation before the handshake and `GET CUSTOMER 42`
after it.

HTTP is the same kind of fact: bytes acquire meaning relative
to protocol state and grammar.

------------------------------------------------------------------------

## 3. Results

**#1 C6** — Carrier. One natural proposition can carry six
deterministic independent bits. Letter-sum modulo 64. The
visible dinner sentence is preserved. Do not raise the modulus.

**#2 D1** — Composition. A discourse bit `D ∈ {GET, ALLOW}`
coexists with C6 under separated mutation spaces. Not free
orthogonality of overlapping linguistic dimensions.

**#3 E1** — Composition. Entity class is a construction
(`DET + PARTY` / `DET + EVENT`), not the words `customer` or
`transaction`. `D`, `E`, and `N` can be read independently from
one utterance. Under the published decoders, a sentence can
deterministically say `GET CUSTOMER 42`.

**#4 S1** — State. Whether to decode is a handshake, not token
recognition. Unsolicited ACK does nothing. Half-completed
states do not interpret application messages.

``` text
initiator                     responder
IDLE                          IDLE
  ↓ PROBE                       ↓ PROBE
ACK_WAIT                     ACK_REQUIRED
  ↓ ACK                         ↓ ACK
ACTIVE                        ACTIVE
```

``` text
S → should U be interpreted as NCMP?
D → what kind of operation?
E → what class of object?
N → what argument?
```

**#5 X1** — Exchange. Two independent participants, strings-only
channel, published probe and ACK, then the published E1
sentence. Control: the identical utterance before the handshake
is `NOT_NCMP`.

These are a dependency chain, not five demos:

``` text
C6   Can natural language carry deterministic extra information?
 │   YES
 ↓
D1   Can another deterministic dimension coexist?
 │   YES — with separated mutation spaces
 ↓
E1   Can another structured dimension compose too?
 │   YES
 ↓
S1   When should those dimensions mean anything?
 │   only after handshake
 ↓
X1   Can two independent participants actually use it?
 │   YES
 ↓
tiny stateful conversational protocol
 │
 ↓
E2   Can one locked construction be loosened and stay deterministic?
 │   YES — published grammar of several forms, not a classifier
 ↓
G1   Can an LM speak that grammar without becoming the decoder?
 │   PARTIAL — informed can; free does not land
 ↓
W1   Does the wire look like ordinary conversation?
 │   NO — on this matched dinner corpus, surface is distinguishable
 ↓
I1   Can a session reject replay and accept a fresh bound frame?
 │   YES in-session — cross-session cloned handshake still binds
 ↓
R1   Does a meaning-preserving rewrite preserve the frame?
 │   NO — D often; E rarely; N never; I1 desyncs
 ↓
D6   Can discourse expand from 2 to 6 without breaking composition?
 │   YES — 768/768, 3–4 cue tokens per opcode
```

The chain is YES, YES, YES, YES, YES, YES, PARTIAL, NO,
in-session YES, NO, YES. That mix is the point. All eleven
results are frozen. P7 is closed.

------------------------------------------------------------------------

## 4. What this is not

- covert (W1);
- semantic, in the sense that paraphrases preserve frames (R1);
- cryptographically authenticated (I1);
- open English (G1, E2);
- agents inventing a secret language;
- NCMP/2.0, including §21.

C6, D1, and E1 are a constrained language. S1 and X1 make that
language a protocol. E2 loosens one construction inside that
language. It does not make the language open English. The X1
claim stays that narrow.

------------------------------------------------------------------------

## 5. Result #6 — E2

Chosen because the strongest remaining objection to the thesis
was: this is only a small controlled language. Opcode expansion
and integrity do not answer that. Loosening `E` does.

E2 keeps `δ` as a published matcher and adds structurally
distinct forms, including several that E1 maps to `NONE`
(`whoever held it`, `their account holder`, `those folks`,
`anyone seated`). Near-miss customer-like sentences stay
`NONE`. `GET CUSTOMER 42` exists on an E1-invisible form.
C6 coverage holds.

Justified claim, no more:

> NCMP semantics do not require a single fixed lexical
> construction; a protocol class can have multiple structurally
> distinct natural-language realizations while remaining
> deterministically decodable.

That is still a grammar. `whoever ate there` is not CUSTOMER.
The classifier trap was the failure mode. It did not occur.

S1 and X1 still use E1. Switching the session to E2 is a later
composition, not this result. E2 is frozen.

------------------------------------------------------------------------

## 6. Result #7 — G1

The LM proposes `P+D+E`. It never sees `N`. It never judges
success. C6-HY finishes 42. `δ` accepts or rejects.

Informed (grammar in the prompt): 7/8 used an E2 CUSTOMER
construction; 1/8 also kept the dinner poles. That one was a
novel carrier and finished `GET CUSTOMER 42`. Most misses
substituted `food` for the restaurant pole. This was not a
template picker appending a listed tail to the published frame.

Free (category in ordinary language, no grammar list): 0/8 DE.
Ordinary instruction does not land in E2.

So an LM can navigate a published deterministic language
without decoding, and code can still own `N`. The language is
still too small to enter from ordinary instruction. That is
the scalability tension, measured rather than guessed.

G1 is frozen, including the free-condition failure.

------------------------------------------------------------------------

## 7. Result #8 — W1

Not “can someone who knows `δ_N` read 42?” Corpus first:
length-matched GET questions, same dinner `P`. Labels stripped.

Length-only control 0.50. Cheat `δ` 1.00. Grammar-free naive
Bayes 1.00. Blinded LLM judge 16/16.

The wire has a visible signature (`for` + E2 tail vs ordinary
glaze). The original intuition that the channel looks like
ordinary conversation is not supported on this corpus.

G1’s free-condition failure and W1 are the same boundary:
ordinary generation does not enter the grammar, and membership
is visible. Do not “fix” W1 by broadening the grammar against
a detector. That would become steganography.

W1 is frozen as NO.

------------------------------------------------------------------------

## 8. Result #9 — I1

Next because A is the remaining thesis: can the tiny protocol
behave like a protocol. The wire stays strings-only.

In-session: exact replay → `REPLAY`; a fresh realization
re-encoded for the updated transcript bind → `GET CUSTOMER 42`.
S1/X1 still accept the same replay as a second frame.

Cross-session replay of the first frame succeeds if the
handshake strings are cloned. That is not a bug. It is an
information-budget failure:

``` text
N = 6 bits
payload = 6 bits
remaining = 0
```

There are no leftover bits for session identity, sequence,
MAC, or nonce. Hashing the transcript into `N` changes
interpretation. It does not add authentication capacity.
Identical handshakes collide.

If a later carrier had more reliable bits, those bits would
be scarce protocol resources, not a free 24-bit payload.
Operation, entity, argument, sequence, and integrity would
compete for the same linguistic capacity. I1 is the first
measured version of that tradeoff.

I1 is frozen. Honest sentence:

> In-session, B can distinguish an exact replay from a fresh
> bound realization while the wire remains strings-only.
> Cross-session replay protection is not achieved.

Remaining after I1 was rewriting robustness.

------------------------------------------------------------------------

## 9. Result #10 — R1

An intermediary who does not know NCMP paraphrases a valid
I1 frame. `δ` judges.

D 7/8, E 1/8, N 0/8, full frame 0/8. I1 recovers 42 on none
of the fresh rewrites. `that party` becomes `that group`.

> NCMP currently requires a text-preserving transport path.
> Semantic preservation by an intermediary is insufficient
> for protocol preservation.

R1 is frozen as NO. Do not try to make paraphrases survive.

------------------------------------------------------------------------

## 10. Result #11 — D6

Discourse expanded from `{GET, ALLOW}` to six opcodes. E1 and
C6 unchanged. Cue sets are disjoint and do not use the opcode
names. All 12 families cover 64/64. 768/768. Footprint is 3
or 4 tokens per opcode (23 total).

> The discourse alphabet can expand from 2 to 6 under the
> same composition invariants. Each added opcode costs a
> small disjoint cue set, not a collapsing mutation space.

S1 still uses D1. The new prefixes are often awkward. That is
consistent with R1: the wire is a serialization. D6 is frozen.

The grammar did not explode at this scale. Combinatorial
impossibility of added operations is not supported here. It
may happen later. P7 did not hit it.

------------------------------------------------------------------------

## 11. P7 is closed

**Works:** deterministic carrier; compositional dimensions;
broader entity grammar; session state; strings-only two-agent
exchange; informed LM generation; in-session replay detection;
six-opcode discourse alphabet.

**Boundaries:** free LM entry; surface indistinguishability;
cross-session authentication inside six bits; semantic
rewriting.

The experimental phase succeeded because it changed the
question. We started with agents secretly talking. W1 killed
a meaningful part of that story. What remains is a machine
protocol whose serialization is constrained natural language.

The next activity is not Result #12. It is the question this
program did not answer:

> What is NCMP for?

Not what can be added technically, but what property would make
this architecture useful enough to justify existing rather than
remaining a protocol experiment. That question is recorded. It
is not answered here. Evidence has constrained the story. This
note does not invent a use case.

------------------------------------------------------------------------

## 12. Sources

| Result | File |
| --- | --- |
| #1 C6 | `NCMP-P7-C6.md` |
| #2 D1 | `NCMP-P7-D1.md` |
| #3 E1 | `NCMP-P7-E1.md` |
| #4 S1 | `NCMP-P7-S1.md` |
| #5 X1 | `NCMP-P7-X1.md` |
| #6 E2 | `NCMP-P7-E2.md` |
| #7 G1 | `NCMP-P7-G1.md` |
| #8 W1 | `NCMP-P7-W1.md` |
| #9 I1 | `NCMP-P7-I1.md` |
| #10 R1 | `NCMP-P7-R1.md` |
| #11 D6 | `NCMP-P7-D6.md` |
| Parent (frozen) | `NCMP-Specification-v2.md` |
