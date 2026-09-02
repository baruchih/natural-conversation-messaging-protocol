# NCMP-C2

**Status:** C2-D YES. C2-E not YES. C2-F first steerer YES. C2-B YES. Not the protocol.  
**Date:** September 2026  
**Parent:** [NCMP-Control.md](NCMP-Control.md)  
**Prior:** [NCMP-C1.md](NCMP-C1.md) YES · [NCMP-C1-D.md](NCMP-C1-D.md) PASS

C0: control can be orthogonal to BODY.  
C1: control can be selective enough (`≈ 2⁻²⁴` model, bar `≤ 2⁻¹⁶`).

C2 asks whether the conversation can bootstrap the complete control lifecycle. Do not start at START/FINISH. First: can two ordinary turns create ephemeral shared session state?

``` text
pre-agreed
    control_seed
INACTIVE
    ↓
U_probe satisfies T_probe(seed)
    ↓
PROBE recognized
WAIT_ACK
    ↓
T_ack = F(seed, U_probe)
    ↓
U_ack satisfies T_ack
    ↓
ACK recognized
K_session = F(seed, U_probe, U_ack)
    ↓
ACTIVE
```

C2-A is NO. [NCMP-C2-A.md](NCMP-C2-A.md) 24-bit equality is selective and not cheaply reachable.

C2-C first witness was a useful miss. [NCMP-C2-C.md](NCMP-C2-C.md)

C2-D is YES. [NCMP-C2-D.md](NCMP-C2-D.md)

C2-E is not YES. [NCMP-C2-E.md](NCMP-C2-E.md) Same hint as PROBE. Derived residual `0x0F`. Accidental ACK rare. Blind ACK not found.

C2-F first steerer is YES. [NCMP-C2-F.md](NCMP-C2-F.md) Local paraphrase enumeration hit derived `T_ack = 0x0F`. `K_session = 0xDCA0B418`. The LM is not the search.

C2-B is YES. [NCMP-C2-B.md](NCMP-C2-B.md) `K_session + state` derives `T_START = 0x25` and `T_FINISH = 0x08`. Same hint. Same steerer. No new pre-agreed phrase.

No BODY change. Do not invent NCMP/3.0 or NCMP/4.0. The cascade is now in `process`.

------------------------------------------------------------------------

## Program

``` text
C2-A   natural 24-bit U_probe / U_ack             NO
C2-C   bakery × 8-bit, C1-D corpus                not YES
C2-D   umbrella × 6-bit, held-out                 YES
C2-E   derived ACK / K_session                    not YES
C2-F   steer the 6-bit residual                   YES
C2-B   K_session → START / FINISH                YES
```

C3 is YES. [NCMP-C3.md](NCMP-C3.md)
