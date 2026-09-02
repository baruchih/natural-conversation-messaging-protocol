# NCMP-C2-C

**Status:** First witness scored. Not YES. Not the protocol.  
**Date:** September 2026  
**Parent:** [NCMP-C2.md](NCMP-C2.md)  
**Prior:** [NCMP-C2-A.md](NCMP-C2-A.md) NO  
**Name:** Composed bootstrap

C2-A showed that a plain 24-bit equality is hard to enter accidentally and hard to enter deliberately. The missing property is asymmetry.

The agreed word is not the control. It opens the control test.

``` text
wrong
    agreed word present → PROBE

this experiment
    agreed hint present → candidate
                          ↓
                     rare secondary
                          ↓
                     match → PROBE
                     miss  → ordinary
```

No START. No FINISH. No `process` change. Do not invent NCMP/3.0 or NCMP/4.0. Do not reopen lexical `compare+notes+usual`. C2-B stays closed.

------------------------------------------------------------------------

## 1. Question

> Can hint frequency × a reachable secondary target simultaneously satisfy accidental PROBE `≤ 2⁻¹⁶` and deliberate reachability at `k = 50`?

``` text
Pr[accidental PROBE]
  =
Pr[hint appears]
  ×
Pr[secondary | hint]
```

Ordinary speaker: must accidentally have the hint and accidentally hit the check.  
Aware encoder: uses the hint on purpose; only the secondary is searched.

------------------------------------------------------------------------

## 2. Profile

``` text
Profile {
    bootstrap_hint
    control_seed
}
```

`bootstrap_hint` is Profile-specific. It is not a global NCMP word. Its realization in this first test MAY be one pre-agreed word. Architecturally it is a hint, not a token vocabulary. A later test MAY use a token class or other feature.

The hint MUST be something that can occur in the conversational job. The encoder has to include it without changing the purpose.

Do not freeze `Saturday` as the hint. That word was an illustration, and the C2-A job was a Saturday walk.

------------------------------------------------------------------------

## 3. Decode while INACTIVE

``` text
hint absent     → ordinary
hint present    → if P_sec(U) = T(seed) then PROBE
                  else ordinary
```

The hint does not make `U` a PROBE. It makes `U` eligible for the rare test.

------------------------------------------------------------------------

## 4. First witness

Declared before any C2-C corpus count or search. `c2c.ts`.

``` text
bootstrap_hint     bakery
secondary          low 8 bits of FNV-1a 32 on exact U
secondary width    8
control_seed       0x9CA2C1C1
T_sec              seed & 0xFF = 0xC1
corpus             C1-D freeze
job                Saturday morning walk;
                   stopping by the bakery is on-purpose
k                  50
```

`bakery` was not chosen by inspecting C1-D. `Saturday` is not the hint.

If the undeclared ordinary frequency of `bakery` is `q`, the bar needs `q × 2⁻⁸ ≤ 2⁻¹⁶`, i.e. `q ≤ 2⁻⁸`. Reachability at `w = 8`, `k = 50` is about 18% for one hit if the secondary is uniform on hint-bearing turns.

------------------------------------------------------------------------

## 4b. Width calculation (not the witness)

``` text
q × 2⁻ʷ  ≤  2⁻¹⁶
w ≥ 16 + log2(q)
```

The hint should do most of the selectivity. 10-bit secondary at `k = 50` is still hard (~5%). 6–8 bits is the intended region. This witness uses 8.

------------------------------------------------------------------------

## 5. What this is not

Not “word present → PROBE.”  
Not C2-A retry with a larger `k`.  
Not C2-B.  
Not a `process` change.

------------------------------------------------------------------------

## 6. Close condition

``` text
YES   declared hint + secondary
      accidental ≤ 2⁻¹⁶ on the frozen corpus
      one k = 50 set contains a legal on-job hit
NO    this composition cannot give both
      at k = 50
```

Until YES, do not open C2-B.

------------------------------------------------------------------------

## 7. First score

One corpus pass. One generation. Do not regenerate.

``` text
C1-D N              58256
hinted "bakery"     0
accidental PROBE    0
observed q          0
bar                 2⁻¹⁶
```

Zero bakery tokens in this freeze. Accidental PROBE is 0. Rule of three: `q < 3/58256`, so `q × 2⁻⁸ < 2 × 10⁻⁷`, still under the bar. The hint did the selectivity work. This is not a claim that "bakery" never occurs in English.

``` text
model               gpt-4o-mini
asked k             50
considered          44
with hint           42
legal               42
hits T_sec          0
```

Expected `≥1` hit at `w = 8`, `k ≈ 42` is about 15%. Observed 0. The encoder used the hint. It did not hit the 8-bit check.

This pair does not close C2-C. Do not treat that as a reason to inspect the corpus for a rarer word, shrink `w` after the miss, or enlarge `k`. `npm run test:v4-c2c`
