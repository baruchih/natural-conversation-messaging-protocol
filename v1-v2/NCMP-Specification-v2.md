# Natural Conversation Machine Protocol (NCMP/2.0)

**Status:** Experimental Draft\
**Date:** August 2026\
**Category:** Agent-to-Agent Communication Research

------------------------------------------------------------------------

## Abstract

The Natural Conversation Machine Protocol (NCMP) explores whether
ordinary natural-language dialogue can itself serve as a machine
protocol.

An NCMP exchange has two simultaneous interpretations:

1.  **Surface interpretation** --- a coherent, context-appropriate
    conversation readable by humans and ordinary language models.
2.  **Protocol interpretation** --- a machine frame recovered from
    deterministic, protocol-defined properties of the utterance and
    shared conversational state.

NCMP/2.0 rejects phrase substitution as its primary encoding mechanism.
A valid message is not constructed by replacing fields such as `GET`,
`CUSTOMER`, and `42` with fixed English phrases. Instead, a sender
generates an otherwise legitimate conversational utterance subject to
protocol constraints. The receiver evaluates those same constraints and
reconstructs the machine frame.

> **Central objective: maximize linguistic freedom while preserving a
> single valid machine interpretation.**

NCMP/2.0 is an experimental protocol design, not an IETF standard.

------------------------------------------------------------------------

## 1. Design Thesis

Traditional protocols serialize machine structures into machine-oriented
representations:

``` text
GET /customers/42
```

A naive natural-language protocol merely substitutes phrases:

``` text
"Could you check"        -> GET
"the customer profile"   -> CUSTOMER
"four two"               -> 42
```

NCMP/2.0 instead treats an utterance as a multidimensional object:

``` text
                         utterance
                             |
          +------------------+------------------+
          |                  |                  |
          v                  v                  v
     discourse form    semantic class    carrier function
          |                  |                  |
         GET              CUSTOMER              42
          |                  |                  |
          +------------------+------------------+
                             |
                             v
                     GET CUSTOMER 42
```

The sentence is not a wrapper around the protocol frame.

**The sentence is the wire representation of the protocol frame.**

------------------------------------------------------------------------

## 2. Goals

### G1. Conversational legitimacy

Every transmitted utterance SHOULD make sense as part of the visible
conversation independently of its protocol interpretation.

### G2. Deterministic protocol interpretation

Given the same profile, session state, prior state, and normalized
utterance, compatible implementations MUST recover the same frame.

### G3. Linguistic multiplicity

A machine frame SHOULD have many valid surface realizations.

### G4. No mandatory magic phrases

Core semantics MUST NOT depend on a small fixed phrase list such as
`"Could you check"` or `"specifically reviewing"`.

### G5. Separate semantics from arbitrary data

Intent and arbitrary payload data are different encoding problems and
SHOULD use independent dimensions where practical.

### G6. Fail on ambiguity

An utterance that cannot be decoded uniquely MUST NOT be executed.
Ambiguity is a protocol error.

------------------------------------------------------------------------

## 3. Non-Goals

NCMP/2.0 does not attempt to:

-   replace transport encryption;
-   claim natural-language carriers are undetectable;
-   make hidden communication inherently secure;
-   let an unconstrained LLM interpretation define executable semantics;
-   guarantee every machine frame has a natural realization;
-   encode unlimited payloads into one sentence;
-   replace authentication or authorization.

If confidentiality is required, conventional cryptography remains
appropriate.

------------------------------------------------------------------------

## 4. Protocol Layering

``` text
+----------------------------------------------------------+
|                  APPLICATION INTENT                      |
|               GET CUSTOMER customer_42                   |
+----------------------------------------------------------+
                           |
                           v
+----------------------------------------------------------+
|                NCMP FRAME COMPILER                       |
| opcode | entity | argument | state | integrity metadata  |
+----------------------------------------------------------+
                           |
                           v
+----------------------------------------------------------+
|            CONSTRAINED LANGUAGE GENERATOR                |
| finds a natural utterance satisfying protocol predicates |
+----------------------------------------------------------+
                           |
                           v
+----------------------------------------------------------+
|                   SURFACE DIALOGUE                       |
| "What did we find when we looked at that account?"       |
+----------------------------------------------------------+
                           |
                        HTTP/etc.
                           |
                           v
+----------------------------------------------------------+
|               DETERMINISTIC DECODER                      |
| evaluates negotiated predicates and conversation state   |
+----------------------------------------------------------+
                           |
                           v
+----------------------------------------------------------+
|                RECOVERED NCMP FRAME                      |
|               GET CUSTOMER customer_42                   |
+----------------------------------------------------------+
```

HTTP, WebSocket, A2A, queues, or another transport MAY carry NCMP
utterances.

------------------------------------------------------------------------

## 5. Logical Frame

``` text
Frame {
    version
    session_id
    sequence
    opcode
    entity_class
    argument
    qualifiers[]
    integrity
}
```

  Field            Purpose
  ---------------- ----------------------------------------------
  `version`        Negotiated profile
  `session_id`     Protocol session binding
  `sequence`       Ordering and replay control
  `opcode`         Requested operation
  `entity_class`   Object category
  `argument`       Identifier, number, enum, or compact payload
  `qualifiers`     Constraints/modifiers
  `integrity`      Verification of reconstructed frame

The surface utterance does not expose these as sequential textual slots.

------------------------------------------------------------------------

## 6. Constraint Model

A profile defines deterministic functions over utterance `U` and session
state `S`:

``` text
VALID(U, F, S) =
    D(U, S) == F.opcode
    AND E(U, S) == F.entity_class
    AND N(U, S) == F.argument
    AND Q(U, S) == F.qualifiers
    AND C(U, S) == VALID
```

Where:

-   `D` = discourse predicate
-   `E` = entity predicate
-   `N` = arbitrary-data carrier
-   `Q` = qualifier predicate
-   `C` = integrity predicate

The receiver does not ask a free-running model, "What do you think this
means?" It evaluates the negotiated protocol functions.

------------------------------------------------------------------------

## 7. Dimension A --- Discourse Form

A small discourse alphabet carries opcodes.

  Discourse class              Opcode
  ---------------------------- --------------
  Information-seeking act      `GET`
  Positive commitment          `ALLOW`
  Negative commitment          `DENY`
  Conditional commitment       `CONSTRAINT`
  Corrective/superseding act   `REPLACE`
  Responsibility transfer      `DELEGATE`

These could potentially belong to the same class:

``` text
"Do we know what happened with that account?"
"What did we find there?"
"Was there anything unusual in that case?"
```

A profile MUST define classification narrowly enough for compatible
implementations to agree.

### 7.1 Determinism

A free-running generative model MUST NOT be the sole normative decoder.

Possible mechanisms include constrained grammar families, fixed feature
classifiers, versioned signed classifiers, canonical semantic
representations, or enumerated discourse structures with broad lexical
freedom.

The exact mechanism remains a core research problem.

------------------------------------------------------------------------

## 8. Dimension B --- Entity Class

Example entity classes:

``` text
CUSTOMER
TRANSACTION
SESSION
RECORD
WORKFLOW
ROUTE
POLICY
```

NCMP SHOULD prefer context-bound semantic references over keyword
substitution.

After state establishes a customer domain, references such as:

``` text
"that account"
"the one we discussed"
"the previous case"
```

may resolve to `CUSTOMER`.

If a reference resolves to more than one valid class, decoding MUST
fail.

------------------------------------------------------------------------

## 9. Dimension C --- Arbitrary Data Carrier

Arbitrary data cannot rely purely on conversational semantics.

NCMP therefore defines:

``` text
N(U, S) -> bitstring
```

Potential carrier families include:

### 9.1 Numerical valuation

A profile may assign values to selected textual elements, inspired by
historical chronograms:

``` text
N(U) = SUM(value(selected_elements(U))) mod M
```

The generator searches for a natural utterance whose value equals the
required symbol.

### 9.2 Lexical-choice classes

Several contextually valid words may belong to protocol equivalence
classes. Class membership, not the literal word, carries symbols.

### 9.3 Structural features

Stable properties may include clause count, syntactic branch, optional
modifier placement, reference form, or sentence-boundary choice.

### 9.4 Historical primitives

Acrostics, Abjad-style valuation, chronograms, and Trithemian table
systems are useful primitives, not the architecture itself.

### 9.5 Capacity discipline

Carrier bandwidth SHOULD remain low. Large payloads SHOULD use ordinary
machine channels and be referenced by NCMP.

### 9.6 Experimental 6-bit carrier

The first concrete `N` is specified separately in `NCMP-P7-C6.md`.
It does not encode opcode or entity. It only tests whether an
arbitrary residue `0..63` can be carried by a published letter-sum
of the whole utterance while the sentence remains ordinary
conversation on an unconstrained topic.

------------------------------------------------------------------------

## 10. Dimension D --- Integrity

Naturalness does not provide integrity.

A decoded instruction MUST be verifiable before execution. A profile
SHOULD bind at least:

``` text
session_id
sequence
opcode
entity_class
argument
prior_frame_digest
```

Conceptually:

``` text
frame_digest =
    H(session_id ||
      sequence ||
      opcode ||
      entity_class ||
      argument ||
      prior_frame_digest)
```

An authenticator MAY be carried by NCMP or supplied by authenticated
transport.

Security MUST NOT depend on the protocol being unrecognized.

------------------------------------------------------------------------

## 11. Session Establishment

Agents negotiate a profile rather than exchange an entire lexicon.

``` text
protocol_version
profile_id
discourse_profile
entity_profile
carrier_profile
integrity_profile
session_id
initial_sequence
```

### 11.1 Explicit negotiation

Where concealment is irrelevant, agents may negotiate NCMP directly in
metadata.

### 11.2 Conversational capability probe

An experimental profile MAY define a natural capability probe and
response:

``` text
A -> PROBE(profile=P7)
B -> ACK(profile=P7)
A -> CONFIRM(session)
```

The visible exchange remains ordinary conversation.

False-positive probability MUST be low enough that normal dialogue does
not accidentally enter executable NCMP state.

------------------------------------------------------------------------

## 12. Generation

The transmitter begins with:

``` text
F = {
    opcode: GET,
    entity_class: CUSTOMER,
    argument: 42
}
```

It searches for utterance `U` satisfying:

``` text
D(U) = GET
E(U) = CUSTOMER
N(U) = 42
C(U) = VALID
```

while optimizing:

``` text
maximize:
    naturalness(U)
    contextual_relevance(U)
    semantic_coherence(U)
    linguistic_diversity(U)

subject to:
    protocol_validity(U, F) = true
```

The language model is a **constrained surface generator**, not the
source of protocol truth.

If no sufficiently natural valid utterance exists, generation SHOULD
fail or use another communication mode. It MUST NOT silently relax
deterministic constraints.

------------------------------------------------------------------------

## 13. Decoding

This section is normative for all NCMP/2.0 profiles. The predicates
`D`, `E`, `N`, `Q`, and `C` are hooks: a profile MUST define them.
Until a named profile does so, compatible implementations of that
profile cannot exist (G2).

### 13.1 Decode function

An implementation MUST realize a total function:

``` text
δ(U, S) → Frame
        | NOT_NCMP
        | DECODE_ERROR
        | AMBIGUOUS
        | INTEGRITY_FAILURE
        | SEQUENCE_ERROR
        | PROFILE_MISMATCH
        | CONTEXT_DESYNC
```

`U` is the received surface utterance after the profile's
canonicalization (Section 16). `S` is the receiver's session state.

Given the same profile, the same `S`, and the same normalized `U`,
compatible implementations MUST return the same result (G2).

A free-running generative model MUST NOT be `δ`.

Outcomes map to the error codes in Section 17 as follows:

  Outcome              Section 17 code
  -------------------- ----------------------
  `NOT_NCMP`           `NCMP_NOT_ACTIVE`
  `DECODE_ERROR`       `NCMP_NO_VALID_FRAME`
  `AMBIGUOUS`          `NCMP_AMBIGUOUS_FRAME`
  `INTEGRITY_FAILURE`  `NCMP_INTEGRITY_FAILURE`
  `SEQUENCE_ERROR`     `NCMP_SEQUENCE_ERROR`
  `PROFILE_MISMATCH`   `NCMP_PROFILE_MISMATCH`
  `CONTEXT_DESYNC`     `NCMP_CONTEXT_DESYNC`

### 13.2 Session state required by δ

`S` MUST include at least:

``` text
S {
    mode              // idle | active
    profile_id
    protocol_version
    session_id        // required when mode = active
    sequence          // expected next sequence when mode = active
    entity_domain     // active entity class, or unset
    active_argument   // last accepted argument, or unset
    prior_digest      // last accepted frame digest, or unset
}
```

Profiles MAY extend `S`. They MUST define which fields are required
before `mode` may become `active`.

### 13.3 Session modes

`S.mode` is `idle` or `active`.

**Idle.** No executable NCMP session is established. `δ` MUST return
`NOT_NCMP` unless `U` is a valid capability probe for the configured
profile (Section 11.2). A successful probe MAY transition `S.mode` to
`active`. A probe MUST NOT execute an application frame.

**Active.** A session is established. `δ` evaluates the negotiated
predicates. Failure is a protocol error, not silence.

These two outcomes MUST NOT be collapsed:

``` text
idle   + no valid probe    →  NOT_NCMP
active + no valid frame    →  DECODE_ERROR
```

`NOT_NCMP` means: treat `U` as ordinary language. `DECODE_ERROR`
means: the session is live and this utterance failed as NCMP.

### 13.4 Candidate set

Let `F*` be the set of frames `F` such that `VALID(U, F, S)` holds
(Section 6), using the profile's `D`, `E`, `N`, `Q`, and `C`.

``` text
|F*| = 0   →  idle: NOT_NCMP ;  active: DECODE_ERROR
|F*| = 1   →  that unique F, after integrity and sequence checks
|F*| > 1   →  AMBIGUOUS
```

A receiver MUST compute `F*` from the profile functions. It MUST NOT
ask a model which `F` was intended.

If a profile's predicates yield at most one candidate by construction,
the uniqueness check still applies. It is the definition of a valid
decode, not an optional audit.

### 13.5 Procedure

`δ` MUST proceed in this order. A step that rejects MUST stop; later
steps MUST NOT run.

``` text
1. Canonicalize U per the configured profile (Section 16).
2. If S.mode = idle:
     evaluate the profile probe;
     if it matches, establish session and return the probe result
     (not an application Frame);
     otherwise return NOT_NCMP.
3. If S.profile_id does not match the negotiated profile:
     return PROFILE_MISMATCH.
4. Evaluate D(U, S) → opcode, or reject.
5. Evaluate E(U, S) → entity_class, or reject.
6. Evaluate N(U, S) → argument, or reject (carrier invalid).
7. Evaluate Q(U, S) → qualifiers, or empty.
8. Reconstruct candidate frame F from those values plus S
   (session_id, expected sequence).
9. Evaluate C(U, S, F). On failure return INTEGRITY_FAILURE.
10. If F.sequence is not the expected next sequence:
     return SEQUENCE_ERROR.
11. Form F*. If |F*| ≠ 1, return as specified in Section 13.4.
12. Accept F. Advance S (sequence, prior_digest, entity_domain,
    active_argument) per the profile. Return F.
```

Steps 4--7 are profile hooks. This document does not yet define
concrete `D`, `E`, `Q`, or `C`. The first concrete `N` is the 6-bit
carrier in `NCMP-P7-C6.md`. That profile fills `N` only. The
Section 21 two-agent demonstration MUST NOT be claimed until the
remaining hooks are specified.

### 13.6 Non-inference

A receiver MUST NOT invent `opcode`, `entity_class`, `argument`,
qualifier, or `sequence` values to preserve conversational flow.

If any required hook fails to produce a value, `δ` MUST reject.

Execution safety takes precedence over surface naturalness.

### 13.7 Relationship to generation

Generation (Section 12) searches for an utterance `U` such that
`δ(U, S)` equals the intended frame. A generated `U` that does not
satisfy `δ` MUST be discarded. Generation success MUST NOT be treated
as proof of validity.

------------------------------------------------------------------------

## 14. Worked Example --- GET CUSTOMER 42

Assume:

``` text
profile = NCMP-P7
active_entity_domain = customer records
carrier = CHRONO-42
sequence = 18
```

Application intent:

``` text
GET CUSTOMER 42
```

Illustrative surface utterance:

> "What did we find when we looked at that account?"

Visible interpretation: an ordinary question in an ongoing discussion.

Protocol interpretation:

``` text
discourse(U)      -> GET
entity(U, state)  -> CUSTOMER
carrier(U, P7)    -> 42
sequence(state)   -> 18
```

Recovered frame:

``` text
Frame {
    opcode: GET
    entity_class: CUSTOMER
    argument: 42
    sequence: 18
}
```

**Important:** this sentence is illustrative. NCMP/2.0 does not yet
define a concrete carrier profile under which that exact sentence
evaluates to `42`. Defining and testing such a profile is the next
implementation problem.

------------------------------------------------------------------------

## 15. Multi-Turn State

Natural conversation compresses repeated context:

``` text
Turn 1: GET CUSTOMER 42
Turn 2: CONSTRAINT [same entity]
Turn 3: ACCEPT [same entity and constraint]
```

Visible dialogue may use references such as "that account," "it," or
"the previous one."

Protocol state therefore resembles discourse state:

``` text
active_entity_class = CUSTOMER
active_argument = 42
active_constraint = ...
```

This allows later turns to carry only what changed.

------------------------------------------------------------------------

## 16. Canonicalization

Before decoding, implementations MUST apply profile-defined
normalization.

Possible rules include:

-   Unicode normalization;
-   case normalization;
-   whitespace normalization;
-   punctuation normalization;
-   sentence-boundary rules;
-   permitted contraction expansion.

Every carrier MUST define which transformations preserve its value.

Paraphrase survival MUST NOT be assumed unless the profile explicitly
supports it.

------------------------------------------------------------------------

## 17. Error Handling

``` text
NCMP_NOT_ACTIVE
NCMP_PROFILE_MISMATCH
NCMP_NO_VALID_FRAME
NCMP_AMBIGUOUS_FRAME
NCMP_CARRIER_INVALID
NCMP_INTEGRITY_FAILURE
NCMP_SEQUENCE_ERROR
NCMP_CONTEXT_DESYNC
```

A receiver MUST NOT infer missing executable fields merely to preserve
conversational flow.

Execution safety takes precedence over surface naturalness.

------------------------------------------------------------------------

## 18. Security and Governance

A natural-looking message may carry machine semantics not apparent from
ordinary inspection.

Therefore:

1.  NCMP-capable agents SHOULD declare protocol capability to their
    controlling runtime.
2.  Decoded frames MUST remain subject to normal authorization and
    policy enforcement.
3.  NCMP MUST NOT itself be treated as authorization.
4.  Decoded frames SHOULD be auditable by authorized operators.
5.  Runtimes SHOULD be able to disable NCMP interpretation independently
    of ordinary language communication.
6.  Implementations SHOULD assume protocol-bearing traffic may be
    statistically or semantically detectable.
7.  Security MUST NOT depend solely on observers failing to recognize
    NCMP.

------------------------------------------------------------------------

## 19. Relationship to Linguistic Steganography

Classical linguistic steganography is commonly modeled as:

``` text
secret bits
    |
    v
natural-looking carrier
    |
    v
secret bits
```

NCMP proposes a different abstraction:

``` text
machine conversational act
    |
    v
natural-language protocol realization
    |
    v
machine conversational act
```

The distinction is subtle but important.

The visible utterance is intended to be a legitimate conversational act,
while protocol dimensions refine that same act into a precise machine
representation.

NCMP may use steganographic techniques for its data carrier, but **NCMP
itself is a protocol model, not merely a hidden-bit codec.**

------------------------------------------------------------------------

## 20. Evaluation Metrics

A serious implementation should measure at least:

### Reliability

``` text
decode_accuracy
false_activation_rate
ambiguity_rate
context_desynchronization_rate
```

### Language quality

``` text
human_naturalness
contextual_relevance
semantic_coherence
surface_diversity
```

### Capacity

``` text
bits_per_token
bits_per_utterance
frames_per_turn
```

### Robustness

``` text
normalization_survival
transport_survival
model_family_interoperability
paraphrase_survival
```

### Detectability

``` text
classifier_detection_rate
distribution_shift
perplexity_delta
human_suspicion_rate
```

No single metric defines success.

------------------------------------------------------------------------

## 21. Minimum Viable Experimental Profile

The first implementation SHOULD be intentionally tiny.

### Opcode space

``` text
GET
ALLOW
DENY
CONSTRAINT
```

### Entity space

``` text
CUSTOMER
TRANSACTION
```

### Argument space

``` text
0..63
```

Six bits are enough to test whether arbitrary values can be reliably
carried without destroying naturalness. That test is specified first,
without opcode or entity, in `NCMP-P7-C6.md`. The demonstration
below waits on that carrier.

### Required demonstration

Two independently running agents share only the NCMP profile and session
state.

Agent A receives:

``` text
GET CUSTOMER 42
```

Agent A generates a contextually legitimate utterance.

Agent B receives only the utterance plus shared protocol/session state.

Agent B reconstructs:

``` text
GET CUSTOMER 42
```

No hidden JSON, metadata side channel, fixed anchor phrase, or external
lookup may carry the frame.

------------------------------------------------------------------------

## 22. Research Questions

1.  What is the largest deterministic opcode alphabet compatible with
    genuinely natural discourse?
2.  Which linguistic properties are stable enough to carry arbitrary
    data?
3.  Can carrier functions survive generation across different model
    families?
4.  Can deterministic decoding coexist with large surface diversity?
5.  How many bits per utterance can be carried before naturalness
    degrades?
6.  Can context act as protocol compression without creating
    unacceptable desynchronization?
7.  Can error correction itself be expressed conversationally?
8.  How should integrity be bound to an utterance without making the
    carrier unnatural?
9.  Can protocol-bearing text survive paraphrasing?
10. How detectable is NCMP traffic to a model that knows the protocol
    family but not the session profile?

------------------------------------------------------------------------

## 23. What Changed from NCMP/1.0

NCMP/1.0 treated natural language largely as a sequence of protocol
slots:

``` text
opcode phrase
+ entity phrase
+ anchor
+ encoded payload words
```

NCMP/2.0 replaces that architecture with **constraint composition**.

  -----------------------------------------------------------------------
  NCMP/1.0                            NCMP/2.0
  ----------------------------------- -----------------------------------
  Fixed opcode phrases                Discourse classes

  Entity synonyms as fields           Context-bound entity semantics

  Visible anchor marker               No mandatory anchor

  Acrostic payload as main carrier    Pluggable low-bandwidth carrier
                                      function

  Sentence assembled from slots       Whole utterance generated under
                                      constraints

  Largely substitutional              Compositional

  English wrapping machine fields     Natural dialogue as wire
                                      representation

  "Looks natural"                     Measured conversational legitimacy

  Parser matches phrases              Decoder evaluates negotiated
                                      predicates
  -----------------------------------------------------------------------

This is the central architectural change.

------------------------------------------------------------------------

## 24. Working Thesis

> **Natural language does not have to be merely the payload of an agent
> protocol. It can potentially be the protocol itself.**

Historical systems demonstrate that meaningful text can simultaneously
carry numerical or coded information. Generative models add a new
capability: searching a very large space of natural expressions for
utterances satisfying both conversational and machine-readable
constraints.

The open problem is not whether text can hide bits.

It is whether we can define a constrained natural-language space with
enough freedom to sound like genuine conversation and enough structure
to behave like a reliable machine protocol.

That is NCMP.
