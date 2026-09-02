# NCMP-V4-Rate

**Status:** Pause note. Not an experiment. Not a
specification.\
**Date:** August 2026\
**Parent:** F6 (Result #6, PARTIAL, frozen). F3
(Result #3, PASS, frozen).\
**Scope:** A cleaner protocol model. Rate is not a
field. There is no F7. F4’s `R` is not changed
and not recalibrated.

------------------------------------------------------------------------

## 1. Two pre-agreements

**Protocol profile.** Handshake, START / FINISH,
carrier `V(U)`, coding rule, state transition.
The handshake means: from now on, interpret
eligible conversation with this profile and this
`H₀`.

**Application frame.** START declares how many
payload bits this frame will accumulate. FINISH
closes it. F3 already showed that frame length
absorbs argument length.

The conversation then carries variable-sized
codewords. Nothing in the profile says each turn
contributes the same number of bits.

``` text
ProtocolProfile {
    handshake
    frame_control     START / FINISH
    carrier           U → V
    code              (H, V) → bits
    state_transition  H → H′
}
```

------------------------------------------------------------------------

## 2. r is not a field

F4 did this:

``` text
Hₙ → R → r
          ↓
       wait for U
          ↓
       decode r bits
```

The more natural abstraction is:

``` text
U + Hₙ
   ↓
CODE
   ↓
payload fragment
```

The length of the fragment is implicit in the
codeword.

``` text
decode(Hₙ, U) → bits
```

might produce

``` text
U₁ → 10                 2 bits
U₂ → 011                3 bits
U₃ → 1                  1 bit
U₄ → 11010100110110    14 bits
U₅ → 0011               4 bits
```

Fourteen bits is conceptually fine if that
conversational opportunity actually supports
enough distinguishable states. Another moment
may offer almost none.

``` text
turn A → 1 bit
turn B → 0 bits
turn C → 6 bits
turn D → 14 bits
```

The protocol does not care. The frame continues
until the declared payload is complete.

“This turn has rate `r`” is implementation
vocabulary. At the protocol level:

``` text
U → codeword → bits
```

------------------------------------------------------------------------

## 3. The receiver constraint

We cannot set the fragment length from the
number of natural alternatives available to the
speaker. The receiver does not see them. A
private candidate set is not a code.

If one utterance carries 14 bits, the receiver
must look at shared `Hₙ` and the received `U`
and conclude, deterministically, that this
codeword carries 14 bits and what those bits
are.

``` text
decode(Hₙ, V(U)) → (bits, next_state)
```

not

``` text
R(Hₙ) → r
πᵣ(V(U)) → bits
```

The mapping must be self-delimiting. Both
parties compute the same bits and the same next
`H` from the same accepted `U`. The LM does not
own that arithmetic.

------------------------------------------------------------------------

## 4. A session

``` text
             HANDSHAKE
A  <-------------------->  B
       same ProtocolProfile
       same initial state H₀
              START
A  ----------------------> B
              U₁
        both decode → bits
        both update H
              U₂
B  ----------------------> A
        both decode → bits
        both update H
             …
             FINISH
       accumulated payload
              ↓
           ARGUMENT
```

``` text
SESSION
│
├── handshake establishes ProtocolProfile
│
└── FRAME
     ├── START declares payload length
     ├── natural U → variable-length codeword
     ├── natural U → variable-length codeword
     └── FINISH
              ↓
          application argument
```

------------------------------------------------------------------------

## 5. Camouflage is not claimed

A fixed “every turn → 3 bits” is a regularity.
A self-delimiting code can produce

``` text
2, 1, 5, 0, 3, 8, 1, 4, …
```

because different natural turns land in
different parts of the code space. The protocol
extracts what the utterance supports instead of
forcing every utterance into one shape.

That is an architectural reason it *might*
reduce structure. It is not evidence. Detecting
that is another W experiment.

------------------------------------------------------------------------

## 6. Smaller than a code

The first question is not a history-dependent
variable-rate scheme. It is how 64 observable
states are spent on length, value, and
redundancy so that `decode(V)` knows where the
codeword ends.

`NCMP-V4-Code.md`

------------------------------------------------------------------------

## 7. What this is not

- F7;
- a chosen self-delimiting code;
- a recalibration of F4’s `R`;
- `N = 100`;
- a UUID;
- a camouflage result;
- NCMP/3.0 or NCMP/4.0.
