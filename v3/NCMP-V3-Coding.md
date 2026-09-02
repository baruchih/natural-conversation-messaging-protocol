# NCMP-V3-Coding

**Status:** Pause note. Published first scheme.
Not an experiment. Not a specification.\
**Date:** August 2026\
**Parent:** A2 (Result #21, PARTIAL, frozen). F3
(V4 Result #3, PASS, frozen).\
**Scope:** The map from a bitstream onto variable
natural choice sets, now small enough to state as
`R`, `π`, and `accept`. There is no A3. F4 is the
V4 experiment of this scheme.

------------------------------------------------------------------------

## 1. Why stop measuring entropy

``` text
M1     can force six bits; sounds worse
M2/M3  natural generation misses an arbitrary 6-bit target
C1     letter-sum wastes some surface; not a 6-bit rescue
A1     independent realizations accumulate; recorded
       windows had one free turn
A2     given exact A₂, B₂ still has ~4.9 bits in 32 replies
```

The old question was:

``` text
application wants 42
        ↓
make the next frame = 42
```

A1/A2 say natural conversation is already producing
shared deterministic state. The missing piece is not
another `H(V | history)`. It is the map

``` text
natural conversation
        ↓
V₁, V₂, V₃, V₄, …
        ↓
R, π, accept
        ↓
protocol information
```

F3 already reassembles a declared argument from
ordered observations. The remaining hole is
encoding.

``` text
application bits
       ↓
R, π, accept
       ↓
natural conversational body
       ↓
carrier observations
       ↓
F3 already knows how to reassemble
```

------------------------------------------------------------------------

## 2. Two families

**Accumulation.** Concatenate or fold the produced
`Vₙ`. The conversation is a shared stream. A later
framing reads chunks of that stream.

That is a source, not a chosen payload. Both parties
obtain the same bits. Neither chose them. Useful as
a beacon or as raw material. Not a way to send a
prior application bitstream unless some later turn
is steered.

**Choice among naturally available states.** This
turn does not have to hit one of 64 residues. It
has to land in one of the `V` values that are
actually available given the history.

``` text
natural candidates this turn
        ↓
20–40 distinguishable V
        ↓
encoder picks a compatible one
```

Rate follows opportunity: a free turn carries more
than a constrained one. That matches M2/M3/A2 better
than “every turn is C6.”

``` text
P7:     payload  →  language
V3 now: language opportunity  ↔  payload
```

A private candidate set is not a code. If only the
speaker sees `{U₁ … Uₖ}`, the listener cannot know
the index, the rate, or the codebook.

``` text
shared state Hₙ
        ↓
rate rₙ and partition πₙ   ←  both parties, no LM
        ↓
speaker seeks natural U with πₙ(V(U)) = next rₙ bits
        ↓
listener computes πₙ(V(U))
```

------------------------------------------------------------------------

## 3. Published first scheme

Three lines. Mechanical. No LM arithmetic. No
private candidate-set state. No six-bit target.

``` text
rₙ = R(Hₙ)
πₙ(V) → rₙ-bit symbol
accept(U) ⇔ πₙ(V(U)) = next payload bits
```

`V` is C6. That is the published alphabet, not a
demand that `V = 42`. C1’s diagnostic `R` is not
this rate function and is not folded into the
carrier.

``` text
V(U)           = C6(U) = letterSum(U) mod 64

Hₙ             = (last, remaining)
last           = START if the body is empty,
                 else the last accepted body turn
remaining      = undeclared argument bits

R(Hₙ)          = min(1 + C6(last) mod 3, remaining)
                 opportunity ∈ {1, 2, 3}

πₙ(V)          = V mod 2^{rₙ}
                 2, 4, or 8 bins

accept(U)      ⇔  πₙ(V(U)) = next rₙ payload bits
```

`R` is known before `U`. `π` is known before `U`.
The speaker searches for a natural `U` whose `V`
lands in the needed bin. The listener never sees
the unused alternatives.

Hitting one of 2, 4, or 8 bins is a different
search from hitting residue 42. A2 says the next
turn still moves. It does not say a 2-bit or 3-bit
target is easy. That is F4.

When `remaining = 0`, `rₙ = 0`. No more payload
bits are accepted. FINISH is the next control, not
another body turn.

Illustration only, on already-published strings.
Not an encoded argument. Not F4.

``` text
last = Shall we begin this round now?
C6   = 41
remaining = 8
r    = min(1 + 41 mod 3, 8) = 3

U    = How was dinner last night after you sat down?
C6   = 22
π    = 22 mod 8 = 110
```

`coding.ts` is the reference for these three
lines. `npm run test:v3-coding`

------------------------------------------------------------------------

## 4. Convergence

Both parties must compute the same `rₙ`, the same
`πₙ`, and the same consumed payload bits from the
same accepted `U` and `Hₙ`. The LM does not own
that arithmetic. `δ` still owns truth.

If `R` or `π` depends on an LM distribution, the
protocol has left NCMP.

------------------------------------------------------------------------

## 5. What F4 tested

F4 is V4 Result #4, PASS, frozen. It carried 8
bits, not 24 or a UUID. F1 boundaries. F3
declared-length verdicts. K4 is not the body
carrier. `R`, `π`, `accept`, and `k = 50` freeze
with it.

F5 and F6 are reliability, both PARTIAL. F6
used independent generations. V4 is paused on
whether `R(H)` is needed at all.
`../v4/NCMP-V4-Rate.md`

``` text
START
  argument_bits = 8
BODY
  natural turn → R(H) = r₁ ∈ {1,2,3}
  natural turn → r₂
  …
  accumulated payload = 8 bits
FINISH
  → argument
```

``` text
F3:  each observation = exact forced 6-bit chunk
F4:  each natural turn chooses among 2^{r} shared bins
```

No turn has to hit arbitrary residue 42. The frame
does not care whether it takes 3, 5, or 12 turns
to finish the argument. Payload size determines
conversation length. Each natural conversational
opportunity contributes only as many bits as `R(Hₙ)`
permits.

F3’s `decode6` of K4 windows is not this
accumulator. F4 would concatenate `π` symbols
until the declared bit count is filled, then apply
the same FINISH verdicts: `INCOMPLETE`,
`OVERFLOW`, `UNDECLARED`, `ARGUMENT`.

------------------------------------------------------------------------

## 6. What this is not

- A3;
- K5;
- F5 changing `R`, `π`, `accept`, or `k`;
- a feature hunt;
- a raised C6 modulus;
- detector-chasing;
- NCMP/3.0 or NCMP/4.0;
- a claim that 2-bit or 3-bit bins are already
  solvable in natural conversation.

``` text
npm run test:v3-coding
```
