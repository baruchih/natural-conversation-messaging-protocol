# Natural Conversation Messaging Protocol

**Canonical document:** [NCMP.md](NCMP.md)

> *Natural Conversation Messaging Protocol*  
> NCMP v0.1 Experimental · Not frozen · September 2026

`NCMP.md` is the v0.1 Experimental protocol. ACTION and RESOURCE codebooks are profile parameters. The Baseline Profile is an example 2×2 table, not the NCMP vocabulary. Baseline control is bootstrap hint plus residual, then session pairs derived from the handshake. C0–C3 and C5-U are in `process`. C4 through C5-S remain the research trail: [../v4/NCMP-Control.md](../v4/NCMP-Control.md).

The reference decoder is [`reference/`](reference/README.md). It demonstrates the machine. It does not define it.

``` text
npm test
```

A static explainer of this document lives in [`../website/`](../website/).

``` text
What is NCMP?          architecture
How does it work?      architecture + Baseline Profile
What have we shown?    evidence
```
