/**
 * NCMP-P7-C6 reference implementation.
 * Normative decode is NCMP-P7-C6.md. This file is a reference encode/decode pair.
 */

export const MODULUS = 64;

/** Capacity sweep: same F(P), larger M. C6 is M=64. */
export const CAPACITY_MODULI = [64, 128, 256, 512, 1024] as const;
export type CapacityModulus = (typeof CAPACITY_MODULI)[number];
export const MIN_TOKENS = 6;
export const MIN_SELECTED_LETTERS = 20;

export const TOPICS = [
  'dinner',
  'weather',
  'software',
  'insurance',
  'travel',
  'football',
] as const;

export type Topic = (typeof TOPICS)[number];

export function letterValue(ch: string): number {
  const code = ch.charCodeAt(0);
  if (code < 97 || code > 122) return 0;
  return code - 96;
}

export function canonicalize(utterance: string): string {
  return utterance.normalize('NFC').toLowerCase();
}

export function selectedLetters(utterance: string): string {
  return canonicalize(utterance).replace(/[^a-z]/g, '');
}

export function letterSum(utterance: string): number {
  const letters = selectedLetters(utterance);
  let sum = 0;
  for (let i = 0; i < letters.length; i++) {
    sum += letterValue(letters[i]);
  }
  return sum;
}

/** δ_N(U) for this profile — total, model-free, no session state. */
export function decode(utterance: string): number {
  return decodeMod(utterance, MODULUS);
}

export function decodeMod(utterance: string, modulus: number): number {
  if (!Number.isInteger(modulus) || modulus < 2) {
    throw new RangeError('modulus must be an integer >= 2');
  }
  return letterSum(utterance) % modulus;
}

export function wellFormed(utterance: string): boolean {
  const trimmed = utterance.trim();
  if (!/[.!?]$/.test(trimmed)) return false;

  const body = trimmed.slice(0, -1);
  if (/[.!?]/.test(body)) return false;

  const tokens = trimmed.split(/\s+/).filter(Boolean);
  if (tokens.length < MIN_TOKENS) return false;

  const canon = canonicalize(trimmed);
  if (/[0-9]/.test(canon)) return false;

  if (selectedLetters(trimmed).length < MIN_SELECTED_LETTERS) return false;

  return true;
}

export function tokenSet(utterance: string): Set<string> {
  const canon = canonicalize(utterance.trim()).replace(/[.!?]$/, '');
  return new Set(canon.split(/\s+/).filter(Boolean));
}

export function jaccard(a: string, b: string): number {
  const A = tokenSet(a);
  const B = tokenSet(b);
  let inter = 0;
  for (const t of A) {
    if (B.has(t)) inter++;
  }
  const union = A.size + B.size - inter;
  return union === 0 ? 1 : inter / union;
}

export function isDistinct(a: string, b: string): boolean {
  return selectedLetters(a) !== selectedLetters(b);
}

export function isMateriallyDistinct(a: string, b: string): boolean {
  return isDistinct(a, b) && jaccard(a, b) < 2 / 3;
}

type Template = string[][];

const TAILS: string[] = [
  'tonight',
  'this evening',
  'after the rush',
  'before we leave',
  'if we still have time',
  'once the others arrive',
  'for a change',
  'on balance',
  'in the end',
  'after all',
  'for now',
  'at last',
  'so far',
  'in short',
  'this time',
  'once more',
  'without much fuss',
  'as we planned',
  'if that still works',
  'when it feels right',
  'before it gets late',
  'after a short pause',
  'while we still can',
  'rather than waiting',
  'instead of rushing',
  'if nobody objects',
  'given how things stand',
  'with a bit of luck',
  'after some thought',
  'in a quiet way',
];

const GRAMMAR: Record<Topic, Template[]> = {
  dinner: [
    [
      ['I think we should', 'Maybe we could', 'Honestly we might', 'At this point we can'],
      ['order', 'share', 'try', 'request'],
      ['the roasted vegetables', 'a simple pasta', 'the seasonal salad', 'the house soup'],
      TAILS,
    ],
    [
      ['The kitchen', 'The waiter', 'The menu', 'The table'],
      ['looks', 'seems', 'feels', 'appears'],
      ['ready', 'slow', 'generous', 'calmer'],
      TAILS,
    ],
  ],
  weather: [
    [
      ['I suspect the', 'It seems the', 'I gather the', 'Apparently the'],
      ['rain', 'wind', 'fog', 'heat'],
      ['will ease', 'might hold', 'could linger', 'should pass'],
      TAILS,
    ],
    [
      ['We should', 'We could', 'We might', 'We can'],
      ['bring a coat', 'wait under cover', 'keep the window shut', 'walk a shorter route'],
      TAILS,
    ],
  ],
  software: [
    [
      ['I think we should', 'Maybe we could', 'Perhaps we can', 'At this point we might'],
      ['ship the patch', 'review the log', 'restart the worker', 'narrow the query'],
      TAILS,
    ],
    [
      ['The build', 'The service', 'The rollout', 'The queue'],
      ['looks', 'seems', 'feels', 'appears'],
      ['stable', 'noisy', 'ready', 'stuck'],
      TAILS,
    ],
  ],
  insurance: [
    [
      ['I think we should', 'Maybe we could', 'Perhaps we can', 'At this point we might'],
      ['review the claim', 'call the adjuster', 'check the policy', 'ask for a copy'],
      TAILS,
    ],
    [
      ['The coverage', 'The deductible', 'The paperwork', 'The timeline'],
      ['looks', 'seems', 'feels', 'appears'],
      ['clear', 'messy', 'reasonable', 'slow'],
      TAILS,
    ],
  ],
  travel: [
    [
      ['I think we should', 'Maybe we could', 'Perhaps we can', 'At this point we might'],
      ['take the earlier train', 'keep the window seat', 'walk from the station', 'skip the long layover'],
      TAILS,
    ],
    [
      ['The flight', 'The hotel', 'The crossing', 'The border line'],
      ['looks', 'seems', 'feels', 'appears'],
      ['quiet', 'busy', 'simple', 'tight'],
      TAILS,
    ],
  ],
  football: [
    [
      ['I think we should', 'Maybe we could', 'Perhaps we can', 'At this point we might'],
      ['hold the midfield', 'press higher up', 'switch the winger', 'slow the tempo'],
      TAILS,
    ],
    [
      ['The defense', 'The referee', 'The crowd', 'The second half'],
      ['looks', 'seems', 'feels', 'appears'],
      ['solid', 'open', 'tense', 'tired'],
      TAILS,
    ],
  ],
};

function realize(parts: string[]): string {
  const body = parts
    .map((p) => p.trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
  const capped = body.charAt(0).toUpperCase() + body.slice(1);
  return /[.!?]$/.test(capped) ? capped : `${capped}.`;
}

function cartesian(slots: string[][]): string[][] {
  return slots.reduce<string[][]>((acc, slot) => {
    if (acc.length === 0) return slot.map((choice) => [choice]);
    const next: string[][] = [];
    for (const prefix of acc) {
      for (const choice of slot) {
        next.push([...prefix, choice]);
      }
    }
    return next;
  }, []);
}

export function enumerateTopic(topic: Topic): string[] {
  const out: string[] = [];
  for (const template of GRAMMAR[topic]) {
    for (const parts of cartesian(template)) {
      const u = realize(parts);
      if (wellFormed(u)) out.push(u);
    }
  }
  return out;
}

export function encode(
  n: number,
  topic: Topic,
  options: { exclude?: ReadonlySet<string> } = {}
): string | null {
  if (!Number.isInteger(n) || n < 0 || n >= MODULUS) {
    throw new RangeError(`n must be an integer in 0..${MODULUS - 1}`);
  }
  const exclude = options.exclude ?? new Set<string>();
  for (const u of enumerateTopic(topic)) {
    const key = selectedLetters(u);
    if (exclude.has(key)) continue;
    if (decode(u) === n) return u;
  }
  return null;
}

export function encodeMany(n: number, topic: Topic, count: number): string[] {
  const found: string[] = [];
  const exclude = new Set<string>();
  for (let i = 0; i < count; i++) {
    const u = encode(n, topic, { exclude });
    if (!u) break;
    found.push(u);
    exclude.add(selectedLetters(u));
  }
  return found;
}

export function coverage(topic: Topic): { hit: number; missing: number[] } {
  const seen = new Set<number>();
  for (const u of enumerateTopic(topic)) {
    seen.add(decode(u));
  }
  const missing: number[] = [];
  for (let n = 0; n < MODULUS; n++) {
    if (!seen.has(n)) missing.push(n);
  }
  return { hit: seen.size, missing };
}

export function collectByResidue(): Map<number, string[]> {
  const map = new Map<number, string[]>();
  for (let n = 0; n < MODULUS; n++) map.set(n, []);
  for (const topic of TOPICS) {
    for (const u of enumerateTopic(topic)) {
      map.get(decode(u))!.push(u);
    }
  }
  return map;
}

export function greedyMaterialSubset(utterances: readonly string[]): string[] {
  const unique = [...new Map(utterances.map((u) => [selectedLetters(u), u])).values()];
  const kept: string[] = [];
  for (const u of unique) {
    if (kept.every((k) => isMateriallyDistinct(k, u))) kept.push(u);
  }
  return kept;
}

export const PROPOSITION_IDS = [
  'dinner_good_slow_service',
  'weather_rain_eases_wind_stays',
  'software_build_stable_rollout_noisy',
  'insurance_coverage_clear_paperwork_slow',
  'travel_flight_quiet_layover_tight',
  'football_defense_solid_half_tired',
] as const;

export type PropositionId = (typeof PROPOSITION_IDS)[number];

export interface Proposition {
  id: PropositionId;
  source: string;
  family: Template[];
}

/**
 * F(P): published paraphrase families. Slots may hedge or synonym-swap
 * without flipping polarity or the contrast poles.
 */
export const PROPOSITIONS: Proposition[] = [
  {
    id: 'dinner_good_slow_service',
    source: 'The restaurant was good, but service was slow.',
    family: [
      [
        ['I thought', 'I found', 'We found', 'Honestly', ''],
        ['the restaurant', 'the place', 'that kitchen'],
        ['was good', 'was decent', 'was solid', 'was fine'],
        ['but', 'though'],
        ['service', 'the wait', 'the staff'],
        ['was slow', 'was sluggish', 'was delayed'],
        ['last night', 'this evening', 'when we went', 'after we sat', 'once we arrived', 'during dinner'],
      ],
    ],
  },
  {
    id: 'weather_rain_eases_wind_stays',
    source: 'The rain will ease later, but the wind will stay up.',
    family: [
      [
        ['I think', 'It seems', 'I gather', 'Apparently', ''],
        ['the rain', 'the shower', 'the drizzle'],
        ['will ease', 'will lift', 'will pass'],
        ['later', 'after a while', 'by evening'],
        ['but', 'though'],
        ['the wind', 'the gusts'],
        ['will stay up', 'will hold', 'will linger'],
      ],
    ],
  },
  {
    id: 'software_build_stable_rollout_noisy',
    source: 'The build is stable, but the rollout is still noisy.',
    family: [
      [
        ['I think', 'It looks like', 'I gather', 'Apparently', ''],
        ['the build', 'the compile', 'the package'],
        ['is stable', 'is solid', 'is steady'],
        ['but', 'though'],
        ['the rollout', 'the deploy', 'the release'],
        ['is still noisy', 'is still messy', 'is still jumpy'],
      ],
    ],
  },
  {
    id: 'insurance_coverage_clear_paperwork_slow',
    source: 'The coverage looks clear, but the paperwork is slow.',
    family: [
      [
        ['I think', 'It seems', 'I gather', 'Apparently', ''],
        ['the coverage', 'the policy', 'the terms'],
        ['looks clear', 'looks plain', 'looks straightforward'],
        ['but', 'though'],
        ['the paperwork', 'the filing', 'the forms'],
        ['is slow', 'is sluggish', 'is delayed'],
      ],
    ],
  },
  {
    id: 'travel_flight_quiet_layover_tight',
    source: 'The flight was quiet, but the layover was tight.',
    family: [
      [
        ['I thought', 'I found', 'We found', 'Honestly', ''],
        ['the flight', 'the hop', 'the crossing'],
        ['was quiet', 'was calm', 'was uneventful'],
        ['but', 'though'],
        ['the layover', 'the connection', 'the wait'],
        ['was tight', 'was short', 'was narrow'],
        ['this morning', 'this evening', 'when we flew', 'on the way'],
      ],
    ],
  },
  {
    id: 'football_defense_solid_half_tired',
    source: 'The defense looked solid, but the second half was tired.',
    family: [
      [
        ['I thought', 'I found', 'We found', 'Honestly', ''],
        ['the defense', 'the back line', 'the rear guard'],
        ['looked solid', 'looked steady', 'looked firm'],
        ['but', 'though'],
        ['the second half', 'the later spell', 'the closing stretch'],
        ['was tired', 'was weary', 'was drained'],
      ],
    ],
  },
];

export function enumerateProposition(id: PropositionId): string[] {
  const prop = PROPOSITIONS.find((p) => p.id === id);
  if (!prop) throw new Error(`unknown proposition ${id}`);
  const out: string[] = [];
  for (const template of prop.family) {
    for (const parts of cartesian(template)) {
      const u = realize(parts);
      if (wellFormed(u)) out.push(u);
    }
  }
  return out;
}

export function encodeProposition(
  n: number,
  id: PropositionId,
  options: { exclude?: ReadonlySet<string>; modulus?: number } = {}
): string | null {
  const modulus = options.modulus ?? MODULUS;
  if (!Number.isInteger(n) || n < 0 || n >= modulus) {
    throw new RangeError(`n must be an integer in 0..${modulus - 1}`);
  }
  const exclude = options.exclude ?? new Set<string>();
  for (const u of enumerateProposition(id)) {
    const key = selectedLetters(u);
    if (exclude.has(key)) continue;
    if (decodeMod(u, modulus) === n) return u;
  }
  return null;
}

export function propositionCoverage(
  id: PropositionId,
  modulus: number = MODULUS
): {
  source: string;
  familySize: number;
  hit: number;
  missing: number[];
} {
  const prop = PROPOSITIONS.find((p) => p.id === id);
  if (!prop) throw new Error(`unknown proposition ${id}`);
  const family = enumerateProposition(id);
  const seen = new Set<number>();
  for (const u of family) seen.add(decodeMod(u, modulus));
  const missing: number[] = [];
  for (let n = 0; n < modulus; n++) {
    if (!seen.has(n)) missing.push(n);
  }
  return { source: prop.source, familySize: family.length, hit: seen.size, missing };
}

export interface CapacityRow {
  id: PropositionId;
  source: string;
  familySize: number;
  modulus: number;
  bits: number;
  hit: number;
  combinatorialBits: number;
}

export function capacitySweep(): CapacityRow[] {
  const rows: CapacityRow[] = [];
  for (const prop of PROPOSITIONS) {
    const familySize = enumerateProposition(prop.id).length;
    for (const modulus of CAPACITY_MODULI) {
      const { hit } = propositionCoverage(prop.id, modulus);
      rows.push({
        id: prop.id,
        source: prop.source,
        familySize,
        modulus,
        bits: Math.log2(modulus),
        hit,
        combinatorialBits: Math.log2(familySize),
      });
    }
  }
  return rows;
}
