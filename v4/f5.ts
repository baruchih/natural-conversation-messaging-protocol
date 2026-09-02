/**
 * NCMP-V4-F5. Result #5, PARTIAL, frozen.
 * Declared battery hit every tested bin. Not an
 * independent p. Not a long-frame rate. Do not
 * enlarge k. Do not change R. Do not send a UUID.
 */
import { acceptBits, carrier, rate, symbolBits } from '../v3/coding.ts';
import { BATCH, START_8, encodeFromSets, intentPrompt, promptIsBlind, selectAccepted, type EncodeResult, type TraceTurn } from './f4.ts';

export { BATCH, START_8, acceptBits, carrier, encodeFromSets, intentPrompt, promptIsBlind, rate, selectAccepted, symbolBits };
export type { EncodeResult, TraceTurn };

export const PAYLOADS = ['11001010', '00110101', '11100011'] as const;
export const FRAME_PAYLOADS = ['11001010', '00110101'] as const;

export interface Context {
  id: string;
  topic: string;
  history: readonly { speaker: string; utterance: string }[];
  speaker: string;
  intent: string;
}

/** Two lasts per rate. Not the F4 dinner script. */
export const CONTEXTS: readonly Context[] = [
  {
    id: 't1',
    topic: 'travel',
    history: [
      { speaker: 'A', utterance: 'Are we still heading west this weekend after work?' },
      { speaker: 'B', utterance: 'We should pack lighter next time we go west.' },
    ],
    speaker: 'A',
    intent: 'Ask what they want to leave behind so the bags stay light.',
  },
  {
    id: 'h1',
    topic: 'hiking',
    history: [
      { speaker: 'A', utterance: 'How was the trail once you got past the first hill?' },
      { speaker: 'B', utterance: 'The hiking trail was quieter than I expected yesterday.' },
    ],
    speaker: 'A',
    intent: 'Ask whether they would go back and try a longer loop.',
  },
  {
    id: 'w1',
    topic: 'weather',
    history: [
      { speaker: 'A', utterance: 'Did you get soaked walking back from the station?' },
      { speaker: 'B', utterance: 'The wind picked up right after we left the station.' },
    ],
    speaker: 'A',
    intent: 'Ask if they found a cafe to wait it out.',
  },
  {
    id: 's1',
    topic: 'software',
    history: [
      { speaker: 'A', utterance: 'The suite was red again this morning after the deploy.' },
      { speaker: 'B', utterance: 'Did the tests pass once you restarted the runner?' },
    ],
    speaker: 'A',
    intent: 'Say a restart is not a fix and ask what actually broke.',
  },
  {
    id: 'w2',
    topic: 'weather',
    history: [
      { speaker: 'A', utterance: 'I almost cancelled because the sky looked awful.' },
      { speaker: 'B', utterance: 'I think the train was late because of the weather.' },
    ],
    speaker: 'A',
    intent: 'Ask how late it ran and whether they still made dinner.',
  },
  {
    id: 's2',
    topic: 'software',
    history: [
      { speaker: 'A', utterance: 'CI has been angry since that dependency bump.' },
      { speaker: 'B', utterance: 'That build failed again after the last merge landed.' },
    ],
    speaker: 'A',
    intent: 'Ask which test failed and whether they reverted the merge.',
  },
];

export const SCRIPTS = [
  {
    id: 'weather',
    intents: [
      { speaker: 'A', text: 'Ask if the weekend still works if Saturday stays wet.' },
      { speaker: 'B', text: 'Say Saturday looks messy but Sunday morning might clear.' },
      { speaker: 'A', text: 'Ask whether they want to move the walk to the afternoon.' },
      { speaker: 'B', text: 'Suggest the covered market if the rain does not stop.' },
      { speaker: 'A', text: 'Ask what time they can leave if the forecast holds.' },
      { speaker: 'B', text: 'Say after breakfast is fine and they will bring a jacket.' },
    ],
  },
  {
    id: 'travel',
    intents: [
      { speaker: 'A', text: 'Ask how long the delay at the gate has already been.' },
      { speaker: 'B', text: 'Say they have been sitting there almost an hour now.' },
      { speaker: 'A', text: 'Ask whether the airline offered anything besides an apology.' },
      { speaker: 'B', text: 'Mention a voucher and a later connection that might work.' },
      { speaker: 'A', text: 'Ask if they should just rebook and get a hotel tonight.' },
      { speaker: 'B', text: 'Say they want to wait one more update before giving up.' },
    ],
  },
  {
    id: 'software',
    intents: [
      { speaker: 'A', text: 'Ask whether the failed job is the same flake as last week.' },
      { speaker: 'B', text: 'Say it looks new and started after the dependency bump.' },
      { speaker: 'A', text: 'Ask if anyone has a local reproduction yet.' },
      { speaker: 'B', text: 'Mention they can reproduce it after a clean install.' },
      { speaker: 'A', text: 'Ask whether they should revert before the next release cut.' },
      { speaker: 'B', text: 'Say yes revert now and write the note for the morning.' },
    ],
  },
] as const;

export function lastOf(context: Context): string {
  return context.history[context.history.length - 1]?.utterance ?? '';
}

export function opportunityRate(context: Context): number {
  return rate(lastOf(context), 8);
}

export interface Opportunity {
  context: Context;
  payload: string;
  r: number;
  wanted: string;
  hit: boolean;
  examined: number;
  legal: number;
  considered: number;
  chosen: string | null;
  c6: number | null;
}

export function scoreOpportunity(context: Context, payload: string, candidates: readonly string[]): Opportunity {
  const r = opportunityRate(context);
  const wanted = payload.slice(0, r);
  const sel = selectAccepted(candidates, r, wanted);
  return {
    context,
    payload,
    r,
    wanted,
    hit: sel.chosen !== null,
    examined: sel.chosen === null ? sel.legal.length : sel.chosenIndex + 1,
    legal: sel.legal.length,
    considered: sel.considered.length,
    chosen: sel.chosen,
    c6: sel.chosen ? carrier(sel.chosen) : null,
  };
}

export function encodeScript(
  payload: string,
  intents: readonly { speaker: string; text: string }[],
  sets: readonly (readonly string[])[],
): EncodeResult {
  let last = START_8;
  let remaining = payload;
  const turns: TraceTurn[] = [];
  for (let i = 0; i < intents.length; i++) {
    if (remaining.length === 0) break;
    const intent = intents[i];
    const r = rate(last, remaining.length);
    const wanted = remaining.slice(0, r);
    const sel = selectAccepted(sets[i] ?? [], r, wanted);
    if (sel.chosen === null) {
      return {
        kind: 'NO_CANDIDATE',
        turns,
        intentIndex: i,
        r,
        wanted,
        legal: sel.legal.length,
        considered: sel.considered.length,
      };
    }
    const c6 = carrier(sel.chosen);
    const pi = symbolBits(c6, r);
    turns.push({
      speaker: intent.speaker,
      intent: intent.text,
      r,
      wanted,
      utterance: sel.chosen,
      c6,
      pi,
      recovered: pi,
      legal: sel.legal.length,
      considered: sel.considered.length,
      chosenIndex: sel.chosenIndex,
    });
    remaining = remaining.slice(r);
    last = sel.chosen;
  }
  if (remaining.length > 0) {
    return { kind: 'NO_CANDIDATE', turns, intentIndex: intents.length, r: 0, wanted: remaining, legal: 0, considered: 0 };
  }
  return { kind: 'ENCODED', turns, bits: payload };
}

export function bitsCarried(result: EncodeResult): number {
  return result.turns.reduce((n, t) => n + t.r, 0);
}

export interface RateRow {
  r: number;
  attempts: number;
  successes: number;
}

export function rateTable(rows: readonly Opportunity[]): RateRow[] {
  return [1, 2, 3].map((r) => {
    const at = rows.filter((x) => x.r === r);
    return { r, attempts: at.length, successes: at.filter((x) => x.hit).length };
  });
}
