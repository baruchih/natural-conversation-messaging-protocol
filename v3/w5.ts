/**
 * NCMP-V3-W5. Paired LM conversation vs M1-modulated closer.
 * Uses the frozen M1 neighborhood. Do not retune adjuncts.
 */
import { tokenList } from '../v1-v2/p7c6.lm.ts';
import {
  accuracy,
  bayesTopFeatures,
  folds,
  lengthDetect,
  mulberry32,
  predictBayes,
  trainBayes,
  type WireItem,
  type WirePair,
} from '../v1-v2/p7w1.ts';
import {
  PREFIXES as M1_PREFIXES,
  closeNatural,
  promptIsBlind,
  type Prefix,
} from './m1.ts';
import { TARGET, windowN } from './k2.ts';

export const PAIR_COUNT = 32;
export const CORPUS_SEED = 20260831;

export type Turns = readonly [string, string, string];

export interface PairRow {
  id: string;
  prefix: Prefix;
  u: string;
  uPrime: string;
  need: number;
  depth: number;
  jaccard: number;
}

export function renderConversation(turns: readonly string[]): string {
  return turns.join('\n');
}

export function ordinaryTurns(row: PairRow): Turns {
  return [row.prefix.a1, row.prefix.b1, row.u];
}

export function modulatedTurns(row: PairRow): Turns {
  return [row.prefix.a1, row.prefix.b1, row.uPrime];
}

/** Extra dinner prefixes. Same prompt shape as M1. Not protocol stems. */
export const EXTRA_PREFIXES: readonly Prefix[] = [
  {
    id: 'p7',
    a1: 'Did the bread come out warm when they first sat you?',
    b1: 'It did and that was honestly the best part of the night.',
    intent: 'ask about the rest of the food',
  },
  {
    id: 'p8',
    a1: 'Were you seated near the kitchen or by the window?',
    b1: 'By the window which was nice even if the room got loud.',
    intent: 'ask whether the noise bothered them',
  },
  {
    id: 'p9',
    a1: 'Did they bring water quickly after you sat down?',
    b1: 'Pretty fast actually and the server stayed friendly.',
    intent: 'ask if you would recommend the place',
  },
  {
    id: 'p10',
    a1: 'Was the pasta better than the salad last night?',
    b1: 'The pasta won easily though both were a little salty.',
    intent: 'ask what they would order next time',
  },
  {
    id: 'p11',
    a1: 'Did you split a dessert after the main plates came?',
    b1: 'We did and it was richer than I expected after dinner.',
    intent: 'ask whether it was worth it',
  },
  {
    id: 'p12',
    a1: 'How late did you end up staying once you sat down?',
    b1: 'Later than planned because the table next to us lingered.',
    intent: 'react and ask how they got home',
  },
  {
    id: 'p13',
    a1: 'Was the coffee any good after that long meal?',
    b1: 'It was fine but I still wanted to leave a bit earlier.',
    intent: 'ask if they would go back soon',
  },
  {
    id: 'p14',
    a1: 'Did the specials sound better than the regular menu?',
    b1: 'One special sounded great but they had already run out.',
    intent: 'ask what they ordered instead',
  },
  {
    id: 'p15',
    a1: 'Were the portions big enough after a long workday?',
    b1: 'More than enough and I took some of it home later.',
    intent: 'ask how it tasted the next day',
  },
  {
    id: 'p16',
    a1: 'Did anyone at the table send a dish back last night?',
    b1: 'No one did although my soup arrived lukewarm at first.',
    intent: 'ask whether they mentioned it to the server',
  },
  {
    id: 'p17',
    a1: 'Was it hard to hear each other once the room filled?',
    b1: 'A little yes and we ended up leaning in the whole time.',
    intent: 'ask if that changed the mood',
  },
  {
    id: 'p18',
    a1: 'Did you like the lighting or was it too dim inside?',
    b1: 'Too dim to read the menu without using a phone light.',
    intent: 'joke lightly and ask about the food anyway',
  },
  {
    id: 'p19',
    a1: 'Was the walk over worth it in that weather last night?',
    b1: 'Barely but once we sat the room felt warm and dry.',
    intent: 'ask whether they would pick somewhere closer next time',
  },
  {
    id: 'p20',
    a1: 'Did they remember you from the last time you went?',
    b1: 'I think so because they asked if we wanted the usual.',
    intent: 'ask whether you kept the usual or switched',
  },
  {
    id: 'p21',
    a1: 'How was the wait at the door before they sat you?',
    b1: 'About twenty minutes which felt long after a full day.',
    intent: 'sympathize and ask if the table made up for it',
  },
  {
    id: 'p22',
    a1: 'Did the kids menu even make sense for your group?',
    b1: 'Not really so we just shared a few smaller plates.',
    intent: 'ask which plate was the favorite',
  },
  {
    id: 'p23',
    a1: 'Was the check split easily at the end of the night?',
    b1: 'Mostly though one person had to pay and get paid back.',
    intent: 'ask if that slowed you down leaving',
  },
  {
    id: 'p24',
    a1: 'Did you sit inside or try the patio after the rain?',
    b1: 'Inside because the patio chairs were still wet then.',
    intent: 'ask if inside felt crowded',
  },
  {
    id: 'p25',
    a1: 'Were the drinks better than the food last night?',
    b1: 'The drinks were stronger and I liked those a bit more.',
    intent: 'ask if anyone overdid it',
  },
  {
    id: 'p26',
    a1: 'Did the music stay quiet enough to talk through dinner?',
    b1: 'At first yes and then they turned it up after dessert.',
    intent: 'ask whether you left after that',
  },
  {
    id: 'p27',
    a1: 'Was there a line for the restroom during the rush?',
    b1: 'There was and that was the most annoying part honestly.',
    intent: 'acknowledge it and ask about the meal itself',
  },
  {
    id: 'p28',
    a1: 'Did you get a window table like you asked for earlier?',
    b1: 'We did after a short wait and the street looked nice.',
    intent: 'ask what you watched while you waited for food',
  },
  {
    id: 'p29',
    a1: 'How spicy was the stew once they finally brought it?',
    b1: 'Milder than the menu said so I asked for extra sauce.',
    intent: 'ask if that fixed it',
  },
  {
    id: 'p30',
    a1: 'Did the birthday candle thing feel awkward at the table?',
    b1: 'A little but she laughed so it was fine in the end.',
    intent: 'ask what you did after dinner',
  },
  {
    id: 'p31',
    a1: 'Was the bread basket refilled after you finished it?',
    b1: 'Once and then they forgot about us for a while.',
    intent: 'ask how the mains were anyway',
  },
  {
    id: 'p32',
    a1: 'Did you like sitting at the bar better than a booth?',
    b1: 'The bar was faster but I missed having more space.',
    intent: 'ask whether you would book a booth next time',
  },
  {
    id: 'p33',
    a1: 'Were the oysters actually fresh when they arrived?',
    b1: 'They seemed fine and nobody at the table complained.',
    intent: 'ask if you would order them again',
  },
  {
    id: 'p34',
    a1: 'Did the side dishes show up at the same time as the rest?',
    b1: 'No the potatoes came late and were already cooling.',
    intent: 'ask whether that ruined the plate',
  },
  {
    id: 'p35',
    a1: 'How was parking around the place after work yesterday?',
    b1: 'Terrible so we walked the last few blocks in the rain.',
    intent: 'ask if you still felt the night was worth it',
  },
  {
    id: 'p36',
    a1: 'Did they let you sit even though the reservation slipped?',
    b1: 'Yes after a short talk at the desk they found a corner.',
    intent: 'ask how the corner table was',
  },
  {
    id: 'p37',
    a1: 'Was the soup the thing you would order again tomorrow?',
    b1: 'Probably not but the roast chicken might be worth it.',
    intent: 'ask what made the chicken better',
  },
  {
    id: 'p38',
    a1: 'Did anyone take photos of the plates before eating?',
    b1: 'Two people did and then we finally started the meal.',
    intent: 'tease them lightly and ask how it tasted',
  },
];

export const CONTEXTS: readonly Prefix[] = [...M1_PREFIXES, ...EXTRA_PREFIXES];

export function pairFromProposal(prefix: Prefix, u: string): PairRow | null {
  const c = closeNatural(prefix, u);
  if (!c.modulation.hit || !c.modulation.chosen || c.window !== TARGET) return null;
  if (c.modulation.seedResidue === c.need) return null;
  if (c.modulation.chosen.utterance === u) return null;
  return {
    id: prefix.id,
    prefix,
    u,
    uPrime: c.modulation.chosen.utterance,
    need: c.need,
    depth: c.modulation.chosen.depth,
    jaccard: c.modulation.chosen.jaccard,
  };
}

export interface ContrastCorpus {
  items: WireItem[];
  pairs: WirePair[];
  closePairs: WirePair[];
  meanTokens: { ordinary: number; protocol: number };
  maxLengthGap: number;
  rows: PairRow[];
}

function toCorpus(rows: PairRow[], seed: number): ContrastCorpus {
  const rand = mulberry32(seed);
  const items: WireItem[] = [];
  const pairs: WirePair[] = [];
  const closePairs: WirePair[] = [];
  rows.forEach((row, i) => {
    const ordinary = renderConversation(ordinaryTurns(row));
    const protocol = renderConversation(modulatedTurns(row));
    items.push({
      id: `O${i}`,
      utterance: ordinary,
      label: 'ordinary',
      tokens: tokenList(ordinary).length,
    });
    items.push({
      id: `P${i}`,
      utterance: protocol,
      label: 'p7',
      tokens: tokenList(protocol).length,
    });
    const p7On = rand() < 0.5 ? 'a' : 'b';
    pairs.push({
      id: `pair-${i}`,
      a: p7On === 'a' ? protocol : ordinary,
      b: p7On === 'a' ? ordinary : protocol,
      p7On,
    });
    const uOn = rand() < 0.5 ? 'a' : 'b';
    closePairs.push({
      id: `close-${i}`,
      a: uOn === 'a' ? row.uPrime : row.u,
      b: uOn === 'a' ? row.u : row.uPrime,
      p7On: uOn,
    });
  });
  const ordinary = items.filter((x) => x.label === 'ordinary');
  const protocol = items.filter((x) => x.label === 'p7');
  const mean = (xs: WireItem[]) => xs.reduce((s, x) => s + x.tokens, 0) / xs.length;
  return {
    items,
    pairs,
    closePairs,
    meanTokens: { ordinary: mean(ordinary), protocol: mean(protocol) },
    maxLengthGap: Math.max(
      ...rows.map((r) =>
        Math.abs(tokenList(renderConversation(ordinaryTurns(r))).length - tokenList(renderConversation(modulatedTurns(r))).length),
      ),
    ),
    rows,
  };
}

/** Frozen live LM closers. First generation. Do not edit to chase a detector. */
export const FROZEN_U: Readonly<Record<string, string>> = {
  p1: 'Did you try anything new on the menu?',
  p2: 'How long did you end up staying there?',
  p3: 'I totally get that, was there anything else that stood out to you?',
  p4: 'I totally agree, but if you could change one thing about the meal, what would it be?',
  p5: 'A: How was the vibe once they got there?',
  p6: "How about we go on a weekday when it's less crowded?",
  p7: 'What did you think of the main course?',
  p8: 'Did the noise bother you at all while you were eating?',
  p9: 'So, would you recommend this place for dinner?',
  p10: 'What do you think we should try next time?',
  p11: 'Was it worth the extra calories?',
  p12: 'Did you end up calling a cab or just walking it?',
  p13: 'Are you thinking we should give it another shot sometime soon?',
  p14: 'So, what did you end up getting instead?',
  p15: 'How did it taste when you warmed it up the next day?',
  p16: 'Did you say anything to the server about it?',
  p17: 'Did that make the vibe feel more intimate or just a bit awkward?',
  p18: 'A: Well, at least the food didn’t need a flashlight to taste good, right?',
  p19: "So, do you think we should choose a place that's a bit closer next time?",
  p20: 'So did you stick with the usual or try something new this time?',
  p21: 'That sounds rough, but was the table nice enough to make it worth it?',
  p23: 'Did that hold you guys up from heading out right away?',
  p24: 'Was it pretty crowded in there?',
  p25: 'Did anyone end up a little too tipsy?',
  p27: 'A: Yeah, that can be a pain. How was the food though?',
  p28: "A: That's great! What did you watch to pass the time?",
  p30: 'A: So, what did you guys do after dinner?',
  p31: 'A: How were the main dishes, though?',
  p32: 'So, would you want to book a booth next time?',
  p33: 'A: Would you order them again if we went back?',
  p34: 'A: Oh no, did that mess up your whole meal?',
  p35: 'A: But was the meal at least worth getting soaked for?',
  p36: 'A: How was the corner table, was it cozy?',
  p37: 'What did you like about the chicken that stood out to you?',
  p38: 'A: I hope the food was worth all the photo ops!',
};

export const FROZEN_PAIRS: PairRow[] = CONTEXTS.map((p) => {
  const u = FROZEN_U[p.id];
  return u ? pairFromProposal(p, u) : null;
}).filter((row): row is PairRow => row !== null);

export function buildCorpus(seed = CORPUS_SEED, rows: PairRow[] = FROZEN_PAIRS): ContrastCorpus {
  if (rows.length < PAIR_COUNT) {
    throw new Error(`W5 needs ${PAIR_COUNT} frozen pairs, got ${rows.length}`);
  }
  return toCorpus(rows.slice(0, PAIR_COUNT), seed);
}

export function cheatConversation(text: string, rows: PairRow[] = FROZEN_PAIRS): 'ordinary' | 'p7' {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length !== 3) return 'ordinary';
  const [a1, b1, closer] = lines;
  const row = rows.find((r) => r.prefix.a1 === a1 && r.prefix.b1 === b1);
  if (!row) return 'ordinary';
  if (closer === row.uPrime && windowN(a1, b1, closer) === TARGET) return 'p7';
  return 'ordinary';
}

export function surfaceScores(corpus: ContrastCorpus): {
  cheat: number;
  length: number;
  bayes: number;
  top: Array<{ word: string; tilt: number }>;
} {
  const cheat = accuracy(
    corpus.items.map((x) => x.label),
    corpus.items.map((x) => cheatConversation(x.utterance, corpus.rows)),
  );
  const mid = (corpus.meanTokens.ordinary + corpus.meanTokens.protocol) / 2;
  const length = accuracy(
    corpus.items.map((x) => x.label),
    corpus.items.map((x) => lengthDetect(x.utterance, mid)),
  );
  const rand = mulberry32(CORPUS_SEED + 1);
  const shuffled = [...corpus.items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  let ok = 0;
  let n = 0;
  const votes = new Map<string, number>();
  for (const fold of folds(shuffled, 4)) {
    const model = trainBayes(fold.train);
    const pred = fold.test.map((x) => predictBayes(model, x.utterance));
    const truth = fold.test.map((x) => x.label);
    ok += pred.filter((p, i) => p === truth[i]).length;
    n += truth.length;
    for (const f of bayesTopFeatures(model, 6)) {
      votes.set(f.word, (votes.get(f.word) ?? 0) + f.tilt);
    }
  }
  const top = [...votes.entries()]
    .map(([word, tilt]) => ({ word, tilt }))
    .sort((a, b) => Math.abs(b.tilt) - Math.abs(a.tilt))
    .slice(0, 8);
  return { cheat, length, bayes: n ? ok / n : 0, top };
}

export function contextsAreBlind(): boolean {
  return CONTEXTS.every(promptIsBlind);
}
