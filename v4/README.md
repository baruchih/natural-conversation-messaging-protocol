# NCMP V4

**Status:** Experimental program, closed at F10.
Not a specification. Not NCMP/4.0.\
**Parent:** V3 is paused. P7 and NCMP/2.0 are
frozen.

``` text
window ≠ frame
```

F1–F4 PASS. F5–F6 PARTIAL. F7–F10 PASS.
Experiments stop. There is no F11.

What V4 is: a stateful conversational
transport. Ordered lossless transport is
assumed. Profile 0 baseline is locked
and specified. Inside a frame, every
non-control `U` is BODY. `turnOk` is
encoder hygiene.
Historical Profile 0: `baseline.ts`
`npm run test:v4-baseline`

UUID (open): first 128-bit id through
the then-current Profile 0.
`NO_CANDIDATE`. Do not regenerate.
`NCMP-V4-UUID.md`

Spec evaluation: 128-bit UUID
matched. One run. Do not regenerate.
`NCMP-V4-Eval-UUID.md`
`npm run test:v4-eval-uuid`

Reliability + efficiency (closed):
spec-legal sizes 8, 24, 128.
7/10 complete. DATA 252/252.
3 incompletes: runway exhausted.
Search comfortable. Runway scarce.
`NCMP-V4-Eval-RE.md`
`NCMP-V4-Runway.md`
`npm run test:v4-eval-re`

Runway characterization (paused):
4/4 NATURAL. C_enc 2–10.
Capacity is of a conversation.
Do not expand. First W stopped.
No obvious footprint. Not covert.
Checkpoint: `NCMP-V4-Checkpoint.md`
`NCMP-V4-Eval-C.md`
`NCMP-V4-Capacity.md`
`NCMP-V4-W.md`
`npm run test:v4-eval-w`
`npm run test:v4-eval-c`

Eligibility audit: `V` is total.
`NCMP-V4-Eligible.md`
`npm run test:v4-eligible`
Body membership: locked yes.
`NCMP-V4-Body.md`

v0.1 specification: `../ncmp/NCMP.md`
`NCMP-Baseline-Protocol.md` is retired.

`NCMP-V4-Architecture.md` `NCMP-V4-Baseline.md`
`NCMP-V4-Terminate.md`

``` text
F1   framing                                 PASS
F2   accumulation                            PASS
F3   declared-length reassembly              PASS
F4   natural-language argument coding        PASS
F5   initial reliability                     PARTIAL
F6   independent opportunity reliability     PARTIAL
F7   payload status is state                 PASS
F8   sparse schedule                         PASS
F9   joint decode(mode, V)                   PASS
F10  complete sparse argument                PASS
```

v0.1 Experimental is a draft.
Not published. Not frozen.
Control research closed: `NCMP-Control.md`
Bootstrap cascade plus C5-U frame pairs are in `../ncmp/reference/ncmp.ts`.
C0 is YES: `NCMP-C0.md`
`npm run test:v4-c0`
C1 is YES: `NCMP-C1.md`
C1-D PASS: `NCMP-C1-D.md`
`npm run test:v4-c1`
`npm run test:v4-c1d`
C2-A is NO: `NCMP-C2-A.md`
C2-C first witness, not YES: `NCMP-C2-C.md`
C2-D is YES: `NCMP-C2-D.md`
C2-E not YES: `NCMP-C2-E.md`
C2-F first steerer YES: `NCMP-C2-F.md`
`npm run test:v4-c2f`
C2-B YES: `NCMP-C2-B.md`
`npm run test:v4-c2b`
C3 YES: `NCMP-C3.md`
`npm run test:v4-c3`
C4 session hint scored: `NCMP-C4.md`
`npm run test:v4-c4`
C5 handshake hints scored: `NCMP-C5.md`
`npm run test:v4-c5`
C5-E word extractor scored: `NCMP-C5-E.md`
`npm run test:v4-c5e`
C5-P ordered-pair hints scored: `NCMP-C5-P.md`
`npm run test:v4-c5p`
C5-G cross-job pairs scored: `NCMP-C5-G.md`
`npm run test:v4-c5g`
C5-A pair availability scored: `NCMP-C5-A.md`
`npm run test:v4-c5a`
C5-H pair/fallback hierarchy scored: `NCMP-C5-H.md`
`npm run test:v4-c5h`
C5-U uniform two-word cues in `process`: `NCMP-C5-U.md`
`npm run test:v4-c5u`
C5-S shadow machine, then promoted: `NCMP-C5-S.md`
`npm run test:v4-c5s`
Codebooks are profile parameters.
Example Baseline Profile is 2×2.
4×6 is extensibility.
`../ncmp/reference/ncmp.ts`
`NCMP-V4-Profile.md`
`npm test`
`NCMP-V4-AR.md` `NCMP-V4-Vocab.md`
`NCMP-V4-Vocab-Scale.md`
`NCMP-V4-AR-C1.md` `NCMP-V4-AR-C2.md`
`NCMP-V4-Header-Budget.md`
`npm run test:v4-ar-c1`
`npm run test:v4-ar-c2`
`npm run test:v4-header-budget`

Pause notes remain pause notes.
`NCMP-V4-Direction.md` `NCMP-V4-Sparse.md`
`NCMP-V4-Joint.md` `NCMP-V4-J.md`
`NCMP-V4-Code.md` `NCMP-V4-Geom.md`
`NCMP-V4-Rate.md` `NCMP-V4-Body.md`
`NCMP-V4-Runway.md` `NCMP-V4-Eval-C.md`
`NCMP-V4-Capacity.md` `NCMP-V4-W.md`
`NCMP-V4-Checkpoint.md`

Do not invent NCMP/4.0.
