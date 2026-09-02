# NCMP v0.1 reference decoder

This is a small standalone implementation of the machine in [`../NCMP.md`](../NCMP.md). It demonstrates how to implement NCMP v0.1. It does not define NCMP v0.1.

`../NCMP.md` is authoritative. If this code and that document would diverge, the document is decisive and this code MUST be corrected.

Decoder only. No encoder, candidate search, language model, or surface hygiene.

``` text
npm test
npm run test:audit
```

``` ts
import { NCMP } from './ncmp.ts';

const ncmp = new NCMP();
ncmp.process('A', 'Thinking we could walk Saturday morning—what do you say? I’ll pack an umbrella, just to be on the safe side!');
ncmp.process('B', "Sounds good. I'll bring my umbrella too, just in case.");
ncmp.state;
```

The constructor MAY take a Profile. The default is the published Baseline example: GET|SET × CUSTOMER|ORDER.

Implemented pieces, all from `NCMP.md`:

``` text
tokenize / bootstrap hint
word-runs / eligible words / completePair
P_sec / T_ack / K_session / L
PROBE / ACK / START_PAIR / FINISH_PAIR
C6
transition
symbol
profile codebooks
frame state (stores U_ack)
process
header parsing
FINISH / outcomes
independent referee
```
