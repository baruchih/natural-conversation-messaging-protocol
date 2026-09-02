/**
 * NCMP-V4-F6. Result #6, PARTIAL, frozen.
 * 18 independent sets, 18/18 HIT, full bin coverage
 * at r ≤ 3 on this N = 6. Do not enlarge N. Do not
 * change R. Rate design is NCMP-V4-Rate.md.
 */
import { carrier, rate, symbol, symbolBits } from '../v3/coding.ts';
import { BATCH, intentPrompt, promptIsBlind, selectAccepted, turnOk } from './f4.ts';

export { BATCH, intentPrompt, promptIsBlind, rate, selectAccepted, symbol, symbolBits, turnOk };

export const DRAWS = 6;

export interface Opportunity {
  id: string;
  topic: string;
  history: readonly { speaker: string; utterance: string }[];
  speaker: string;
  intent: string;
  need: string;
}

/** Six fresh contexts per rate. Lasts are not F5's. Need declared before generation. */
export const OPPORTUNITIES: readonly Opportunity[] = [
  {
    id: 'r1a',
    topic: 'travel',
    history: [
      { speaker: 'A', utterance: 'Was the listing anything like the photos they posted?' },
      { speaker: 'B', utterance: 'The cabin was colder than the listing had suggested.' },
    ],
    speaker: 'A',
    intent: 'Ask whether they stayed the night or looked for another place.',
    need: '0',
  },
  {
    id: 'r1b',
    topic: 'travel',
    history: [
      { speaker: 'A', utterance: 'Did you make the second flight after the scramble?' },
      { speaker: 'B', utterance: 'We missed the connection and waited by the wrong door.' },
    ],
    speaker: 'A',
    intent: 'Ask how long they stood there before someone redirected them.',
    need: '1',
  },
  {
    id: 'r1c',
    topic: 'weekend',
    history: [
      { speaker: 'A', utterance: 'I thought we were going to keep this trip cheap.' },
      { speaker: 'B', utterance: 'The tickets cost more once the weekend crowd arrived.' },
    ],
    speaker: 'A',
    intent: 'Ask if they still want to go or wait for a quieter week.',
    need: '0',
  },
  {
    id: 'r1d',
    topic: 'lecture',
    history: [
      { speaker: 'A', utterance: 'I waited outside because I thought it was already over.' },
      { speaker: 'B', utterance: 'She said the lecture ran long after the questions started.' },
    ],
    speaker: 'A',
    intent: 'Ask whether the extra questions were actually useful.',
    need: '1',
  },
  {
    id: 'r1e',
    topic: 'weather',
    history: [
      { speaker: 'A', utterance: 'You looked soaked when you came through the door.' },
      { speaker: 'B', utterance: 'I left the umbrella on the bus after the last stop.' },
    ],
    speaker: 'A',
    intent: 'Ask if they went back for it or just bought another one.',
    need: '0',
  },
  {
    id: 'r1f',
    topic: 'home',
    history: [
      { speaker: 'A', utterance: 'I could hear them from the kitchen after midnight.' },
      { speaker: 'B', utterance: 'The neighbors were loud until someone finally called.' },
    ],
    speaker: 'A',
    intent: 'Ask whether it actually got quiet after the call.',
    need: '1',
  },
  {
    id: 'r2a',
    topic: 'travel',
    history: [
      { speaker: 'A', utterance: 'I saw your message from the terminal but could not reply.' },
      { speaker: 'B', utterance: 'Our flight got delayed and we just sat at the gate.' },
    ],
    speaker: 'A',
    intent: 'Ask whether they announced a new time or just kept stalling.',
    need: '00',
  },
  {
    id: 'r2b',
    topic: 'football',
    history: [
      { speaker: 'A', utterance: 'I stopped watching after the second cheap foul.' },
      { speaker: 'B', utterance: 'They scored late and the whole stand went quiet.' },
    ],
    speaker: 'A',
    intent: 'Ask if that goal decided it or they still had time left.',
    need: '01',
  },
  {
    id: 'r2c',
    topic: 'work',
    history: [
      { speaker: 'A', utterance: 'I blocked the hour and then nothing happened.' },
      { speaker: 'B', utterance: 'The meeting slipped because the slides were not ready.' },
    ],
    speaker: 'A',
    intent: 'Ask whether they rescheduled for today or just cancelled.',
    need: '10',
  },
  {
    id: 'r2d',
    topic: 'dinner',
    history: [
      { speaker: 'A', utterance: 'We were already in the lobby when I texted you.' },
      { speaker: 'B', utterance: 'He forgot the reservation and we stood in the hall.' },
    ],
    speaker: 'A',
    intent: 'Ask if they got a table anyway or left for somewhere else.',
    need: '11',
  },
  {
    id: 'r2e',
    topic: 'travel',
    history: [
      { speaker: 'A', utterance: 'I told you the extra legroom was worth it.' },
      { speaker: 'B', utterance: 'I booked the cheaper seat and regretted it immediately.' },
    ],
    speaker: 'A',
    intent: 'Ask whether they will pay for the upgrade on the way back.',
    need: '00',
  },
  {
    id: 'r2f',
    topic: 'football',
    history: [
      { speaker: 'A', utterance: 'Even the replay looked obvious from our angle.' },
      { speaker: 'B', utterance: 'The referee missed the handball and nobody argued long.' },
    ],
    speaker: 'A',
    intent: 'Ask if the players even noticed or they just played on.',
    need: '01',
  },
  {
    id: 'r3a',
    topic: 'insurance',
    history: [
      { speaker: 'A', utterance: 'I thought they said the letter would be here Friday.' },
      { speaker: 'B', utterance: 'The insurance letter arrived later than they promised.' },
    ],
    speaker: 'A',
    intent: 'Ask whether the date on it still matches what they told you.',
    need: '000',
  },
  {
    id: 'r3b',
    topic: 'football',
    history: [
      { speaker: 'A', utterance: 'I almost skipped it after the week we had.' },
      { speaker: 'B', utterance: 'Saturday football was messy but everyone still showed up.' },
    ],
    speaker: 'A',
    intent: 'Ask if it was still worth going despite the mess.',
    need: '001',
  },
  {
    id: 'r3c',
    topic: 'weather',
    history: [
      { speaker: 'A', utterance: 'I carried the coat all day for nothing.' },
      { speaker: 'B', utterance: 'The forecast said rain and then it stayed dry all afternoon.' },
    ],
    speaker: 'A',
    intent: 'Ask whether they trust that forecast for tomorrow at all.',
    need: '010',
  },
  {
    id: 'r3d',
    topic: 'errand',
    history: [
      { speaker: 'A', utterance: 'I was already hungry when we got to the corner.' },
      { speaker: 'B', utterance: 'The bakery was closed so we walked back empty handed.' },
    ],
    speaker: 'A',
    intent: 'Ask if they found something else or just waited until dinner.',
    need: '011',
  },
  {
    id: 'r3e',
    topic: 'football',
    history: [
      { speaker: 'A', utterance: 'The kids were already changing when I arrived.' },
      { speaker: 'B', utterance: 'They cancelled practice once the field turned to mud.' },
    ],
    speaker: 'A',
    intent: 'Ask whether they moved it indoors or sent everyone home.',
    need: '100',
  },
  {
    id: 'r3f',
    topic: 'cafe',
    history: [
      { speaker: 'A', utterance: 'I still went in because I needed somewhere to sit.' },
      { speaker: 'B', utterance: 'The coffee was burnt but the place was still packed.' },
    ],
    speaker: 'A',
    intent: 'Ask if they stayed anyway or took the cup and left.',
    need: '101',
  },
];

export function lastOf(opp: Opportunity): string {
  return opp.history[opp.history.length - 1]?.utterance ?? '';
}

export function declaredRate(opp: Opportunity): number {
  return rate(lastOf(opp), 8);
}

export function binsPresent(candidates: readonly string[], r: number): number[] {
  const seen = new Set<number>();
  for (const u of candidates) {
    if (!turnOk(u)) continue;
    seen.add(symbol(carrier(u), r));
  }
  return [...seen].sort((a, b) => a - b);
}

export interface ScoredOpportunity {
  id: string;
  r: number;
  need: string;
  hit: boolean;
  examined: number;
  legal: number;
  covered: number;
  bins: number;
  chosen: string | null;
}

export function scoreOpportunity(opp: Opportunity, candidates: readonly string[]): ScoredOpportunity {
  const r = declaredRate(opp);
  const sel = selectAccepted(candidates, r, opp.need);
  const bins = 1 << r;
  const present = binsPresent(candidates, r);
  return {
    id: opp.id,
    r,
    need: opp.need,
    hit: sel.chosen !== null,
    examined: sel.chosen === null ? sel.legal.length : sel.chosenIndex + 1,
    legal: sel.legal.length,
    covered: present.length,
    bins,
    chosen: sel.chosen,
  };
}

export function groupByRate(rows: readonly ScoredOpportunity[]): { r: number; hit: number; miss: number; n: number }[] {
  return [1, 2, 3].map((r) => {
    const at = rows.filter((x) => x.r === r);
    return { r, n: at.length, hit: at.filter((x) => x.hit).length, miss: at.filter((x) => !x.hit).length };
  });
}
