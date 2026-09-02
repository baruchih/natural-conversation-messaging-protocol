# NCMP-V4-F1

**Status:** V4 Experimental Result #1 — PASS, frozen\
**Date:** August 2026\
**Parent:** `NCMP-V4-Direction.md`. Session gate is P7
S1 (frozen). K4 is not used.\
**Scope:** START / BODY / FINISH only. No action,
resource, accumulator, UUID, or coding layer.

This profile is closed. Two participants can
deterministically delimit a variable-length
application frame inside an active conversational
session, agree on its exact contents, and return to
the active session after the frame closes.

F2 puts frozen K4 in the body. Do not change START
or FINISH.

------------------------------------------------------------------------

## 1. Question

> Can two participants deterministically open a
> variable-length application frame, carry an arbitrary
> number of conversational turns inside it, and close
> the same frame, while the session remains active?

``` text
window ≠ frame
```

``` text
SESSION_ACTIVE
     │
   START
     ↓
FRAME_ACTIVE
     │
     ├── BODY
     ├── BODY
     ├── ...
     │
   FINISH
     ↓
FRAME_COMPLETE
     │
     ↓
SESSION_ACTIVE
```

------------------------------------------------------------------------

## 2. Constructions

``` text
START   begin, round, now
        Shall we begin this round now?

FINISH  close, round, here
        Let us close this round here.
```

------------------------------------------------------------------------

## 3. Controls

``` text
FINISH while no frame is open     NO_FRAME
START while a frame is open       NEST
ordinary text, no open frame      CHAT
after FINISH                      session still ACTIVE
```

No nesting. A second frame can open later.

------------------------------------------------------------------------

## 4. Measurement

``` text
len  agreed  session after
  1  yes     ACTIVE
  4  yes     ACTIVE
  9  yes     ACTIVE
```

Both participants independently produce the same
`{ start, body[], finish }` and digest. Frame length
is not fixed.

------------------------------------------------------------------------

## 5. Verdict

PASS.

This is the first evidence that window ≠ frame.

------------------------------------------------------------------------

## 6. What this does not claim

- K4 inside the body (F2);
- decoding an argument (F3);
- action / resource on START;
- camouflage;
- NCMP/4.0.

``` text
npm run test:v4-f1
```
