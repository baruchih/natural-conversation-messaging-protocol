# Natural Conversation Messaging Protocol

**NCMP v0.1 Experimental** · Not frozen · September 2026

[GitHub](https://github.com/baruchih/natural-conversation-messaging-protocol) · [Explainer](website/index.html) · [Protocol](ncmp/NCMP.md)

A deterministic, stateful messaging protocol carried through natural-language conversation.

Participants agree a Profile — ACTION and RESOURCE codebooks — before interpretation begins. The conversation then transmits which values occurred:

``` text
PROFILE
    ACTION / RESOURCE codebooks
    control_seed + bootstrap_hint
        ↓
PROBE → ACK → K_session
        ↓
START(length)
        ↓
BODY
[action][resource][argument]
        ↓
FINISH
        ↓
{ ACTION, RESOURCE, ARGUMENT }
```

The protocol object is the conversation. Shared state decides which utterances carry application data, how those fragments are decoded, and how they reconstruct one framed message.

This is NCMP v0.1 Experimental. Not frozen. The Profile bootstraps; the conversation establishes later control vocabulary. Research notes live in [`v4/NCMP-Control.md`](v4/NCMP-Control.md).

## Documents

| Artifact | Role |
| --- | --- |
| [`ncmp/NCMP.md`](ncmp/NCMP.md) | NCMP v0.1 Experimental |
| [`v4/NCMP-Control.md`](v4/NCMP-Control.md) | Control research notes. C0–C3 and C5-U are in `process`. |
| [`v4/NCMP-C0.md`](v4/NCMP-C0.md) | C0 — exceptional-turn primitive. YES. |
| [`v4/NCMP-C1.md`](v4/NCMP-C1.md) | C1 — bootstrap selectivity. YES. |
| [`v4/NCMP-C1-D.md`](v4/NCMP-C1-D.md) | C1-D — bootstrap distribution. PASS. |
| [`v4/NCMP-C2.md`](v4/NCMP-C2.md) | C2 — control lifecycle. C2-D YES. C2-B YES. |
| [`v4/NCMP-C2-A.md`](v4/NCMP-C2-A.md) | C2-A — bootstrap reachability. NO. |
| [`v4/NCMP-C2-C.md`](v4/NCMP-C2-C.md) | C2-C — composed bootstrap. First witness. Not YES. |
| [`v4/NCMP-C2-D.md`](v4/NCMP-C2-D.md) | C2-D — held-out composed bootstrap. YES. |
| [`v4/NCMP-C2-E.md`](v4/NCMP-C2-E.md) | C2-E — derived ACK / K_session. Not YES. |
| [`v4/NCMP-C2-F.md`](v4/NCMP-C2-F.md) | C2-F — steered residual. First steerer YES. |
| [`v4/NCMP-C2-B.md`](v4/NCMP-C2-B.md) | C2-B — derived START / FINISH. YES. |
| [`v4/NCMP-C3.md`](v4/NCMP-C3.md) | C3 — START length. YES. |
| [`v4/NCMP-C4.md`](v4/NCMP-C4.md) | C4 — session hint after ACK. Scored. Not a process change. |
| [`v4/NCMP-C5.md`](v4/NCMP-C5.md) | C5 — handshake-derived hints. Scored. Not a process change. |
| [`v4/NCMP-C5-E.md`](v4/NCMP-C5-E.md) | C5-E — eligible control-hint words. Scored. Not a process change. |
| [`v4/NCMP-C5-P.md`](v4/NCMP-C5-P.md) | C5-P — handshake-donated ordered pairs. Scored. Not a process change. |
| [`v4/NCMP-C5-G.md`](v4/NCMP-C5-G.md) | C5-G — pair donation across jobs. Scored. Not a process change. |
| [`v4/NCMP-C5-A.md`](v4/NCMP-C5-A.md) | C5-A — pair availability on ordinary handshakes. Scored. Not a process change. |
| [`v4/NCMP-C5-H.md`](v4/NCMP-C5-H.md) | C5-H — pair / session-word hierarchy. Scored. Not a process change. |
| [`v4/NCMP-C5-U.md`](v4/NCMP-C5-U.md) | C5-U — uniform two-word cues. Promoted into `process`. |
| [`v4/NCMP-C5-S.md`](v4/NCMP-C5-S.md) | C5-S — C5-U shadow machine. Prefix-conformed, then promoted. |
| [`NCMP-Baseline-Protocol.md`](NCMP-Baseline-Protocol.md) | Retired. Not a specification. |
| [`ncmp/reference/`](ncmp/reference/README.md) | Reference decoder (does not define the protocol) |
| [`website/`](website/index.html) | Public explainer |

A reader who has only `ncmp/NCMP.md` can write `process(transcript) → protocol state` correctly. The other artifacts are optional.

## Baseline Profile

The published 2×2 table is a conformance example, not the NCMP vocabulary:

``` text
ACTION           GET | SET
RESOURCE         CUSTOMER | ORDER
header           2 bits
control_seed     0x9CA2C1C1
bootstrap_hint   umbrella
```

A wider 4×6 table has been shown on the same machine. Header cost is `ceil(log2 A) + ceil(log2 R)`. Conversation budget — not decoder architecture — is what constrains how large a useful profile should be.

## Conformance

``` text
npm test
```

`v4/baseline.ts` is the historical argument-only Profile 0 machine. Frozen evaluations are not replayed through the header.

The public explainer is static HTML in `website/`. It is not a Vite app.

## Lineage

Frozen research, not the published protocol:

| Folder | What it is |
| --- | --- |
| [`v1-v2/`](v1-v2/README.md) | NCMP/2.0 and P7 |
| [`v3/`](v3/README.md) | language as session state |
| [`v4/`](v4/README.md) | sparse conversational transport |

## What this is not

NCMP 0.1 is not encryption, authentication, tamper-resistance, or proven covertness. It does not amend NCMP/2.0.
