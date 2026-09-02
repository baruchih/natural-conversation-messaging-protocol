/**
 * Runway characterization. Conversation first, Profile 0 second.
 * No payload during generation. k = 50. Do not enlarge.
 * Do not change half3. Do not amend the specification.
 */
import { ACK_EXAMPLE, PROBE_EXAMPLE, START_128, carrier, fresh, process } from './baseline.ts';
import { encodeRun, hexToBits } from './eval-re.ts';
import { needsOwnerData, parseNatural, tally, type EncodeResult } from './eval-uuid.ts';

export { START_128, carrier, encodeRun, hexToBits, needsOwnerData, parseNatural, tally };
export type { EncodeResult };

/** Safety cap. Not a target length. */
export const TURN_CAP = 160;

/** C_encodable probe. Declared before live cells. Wide START. */
export const PROBE_HEX = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';
export const PROBE = hexToBits(PROBE_HEX);

export type SceneId = 'dinner' | 'weekend' | 'technical' | 'collab';
export type Stop = 'NATURAL' | 'CAPPED';

export interface Scene {
  id: SceneId;
  title: string;
  setting: string;
}

/** Declared before live generation. Do not change after seeing C. */
export const SCENES: readonly Scene[] = [
  {
    id: 'dinner',
    title: 'short dinner',
    setting:
      'Two people who live together are deciding what to cook tonight and whether anyone needs to go to the shop. They are comfortable with each other. Settle the meal and the errand, then stop.',
  },
  {
    id: 'weekend',
    title: 'weekend planning',
    setting:
      'Two friends are choosing one Saturday plan: a walk, the market, or staying in. Pick the plan and a meeting time, then stop.',
  },
  {
    id: 'technical',
    title: 'technical discussion',
    setting:
      'Two colleagues are looking at a save button that does nothing when pressed. Agree on the next thing to try, then stop.',
  },
  {
    id: 'collab',
    title: 'long collaborative task',
    setting:
      'Two people are making a short guest list for a small dinner and deciding who brings food and who sets the table. When the list and the jobs are settled, stop.',
  },
];

export interface FrozenTurn {
  speaker: 'A' | 'B';
  utterance: string;
}

export function sceneById(id: SceneId): Scene {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(id);
  return s;
}

export function nextSpeaker(turns: readonly FrozenTurn[]): 'A' | 'B' {
  const last = turns[turns.length - 1];
  return last?.speaker === 'A' ? 'B' : 'A';
}

export function scenePrompt(
  scene: Scene,
  history: readonly FrozenTurn[],
  speaker: 'A' | 'B',
): string {
  const soFar = history.length
    ? history.map((t) => `${t.speaker}: ${t.utterance}`).join('\n')
    : '(no turns yet)';
  return `${scene.setting}

Conversation so far:
${soFar}

Speak as ${speaker}. One natural conversational turn. If the conversation has already reached a natural stopping point and another turn would feel forced, reply with exactly END. No numbering. No quotation marks. No list of alternatives.`;
}

export function promptIsBlindScene(scene: Scene, history: readonly FrozenTurn[], speaker: 'A' | 'B'): boolean {
  return isBlind(scenePrompt(scene, history, speaker)) && isBlind(scene.setting) && history.every((t) => isBlind(t.utterance));
}

function isBlind(p: string): boolean {
  const t = p.toLowerCase();
  if (t.includes('ncmp') || t.includes('residue') || t.includes('letter-sum')) return false;
  if (t.includes('encode') || t.includes('protocol') || /\b64\b/.test(t)) return false;
  return true;
}

export type TurnOrEnd = { kind: 'END' } | { kind: 'U'; u: string };

export function parseTurnOrEnd(text: string): TurnOrEnd | null {
  const first = text
    .trim()
    .split('\n')[0]
    ?.trim()
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/[.!?]+$/g, '');
  if (first && /^END$/i.test(first)) return { kind: 'END' };
  const u = parseNatural(text);
  if (!u) return null;
  if (/^END[.!?]?$/i.test(u)) return { kind: 'END' };
  return { kind: 'U', u };
}

export function intentsFrom(turns: readonly FrozenTurn[]): { speaker: 'A' | 'B'; text: string }[] {
  return turns.map((t) => ({ speaker: t.speaker, text: t.utterance }));
}

/** SKIP / peer: frozen U. DATA: supplied paraphrases, else the frozen U alone. */
export function setsForEncodable(
  turns: readonly FrozenTurn[],
  paraphrases: readonly (readonly string[] | undefined)[],
): string[][] {
  return turns.map((t, i) => {
    const extra = paraphrases[i];
    return extra && extra.length ? [...extra] : [t.utterance];
  });
}

export interface Observed {
  turns: number;
  bits: number;
  dataTurns: number;
  skipTurns: number;
  ownerTurns: number;
  peerTurns: number;
  chat: number;
}

export function observe(turns: readonly FrozenTurn[]): Observed {
  const m = fresh();
  process(m, 'A', PROBE_EXAMPLE);
  process(m, 'B', ACK_EXAMPLE);
  process(m, 'A', START_128);
  let bits = 0;
  let dataTurns = 0;
  let skipTurns = 0;
  let chat = 0;
  for (const t of turns) {
    const snap = process(m, t.speaker, t.utterance);
    if (snap.outcome === 'CHAT') chat += 1;
    if (snap.bits) {
      bits += snap.bits.length;
      dataTurns += 1;
    } else if (snap.outcome === 'BODY_SKIP' || snap.outcome === 'PAYLOAD_COMPLETE') {
      skipTurns += 1;
    }
  }
  return {
    turns: turns.length,
    bits,
    dataTurns,
    skipTurns,
    ownerTurns: turns.filter((t) => t.speaker === 'A').length,
    peerTurns: turns.filter((t) => t.speaker === 'B').length,
    chat,
  };
}

export interface Encodable {
  bits: number;
  result: EncodeResult['kind'];
  unusedTurns: number;
  unusedProbe: number;
  dataOpportunities: number;
  dataSuccesses: number;
  maxExamined: number;
  meanExamined: number;
  noCandidate: boolean;
}

export function encodable(turns: readonly FrozenTurn[], sets: readonly (readonly string[])[]): Encodable {
  const encoded = encodeRun(PROBE, START_128, intentsFrom(turns), sets);
  const t = tally(encoded.turns);
  const have =
    encoded.kind === 'UUID' ? PROBE.length : encoded.kind === 'INCOMPLETE' ? encoded.have : encoded.turns.reduce((n, x) => n + (x.bits?.length ?? 0), 0);
  return {
    bits: have,
    result: encoded.kind,
    unusedTurns: Math.max(0, turns.length - encoded.turns.length),
    unusedProbe: Math.max(0, PROBE.length - have),
    dataOpportunities: t.dataOpportunities,
    dataSuccesses: t.dataSuccesses,
    maxExamined: t.maxExamined,
    meanExamined: t.meanExamined,
    noCandidate: encoded.kind === 'NO_CANDIDATE',
  };
}

export interface CellRow {
  id: SceneId;
  title: string;
  stop: Stop;
  turns: number;
  observed: Observed;
  encoded: Encodable;
  /** C_encodable / turns. Descriptive. */
  bitsPerTurn: number;
  /** Owner DATA opportunities / turns. Descriptive. */
  dataOppFrac: number;
}

export function measureCell(scene: Scene, turns: readonly FrozenTurn[], stop: Stop, sets: readonly (readonly string[])[]): CellRow {
  const encoded = encodable(turns, sets);
  const n = turns.length;
  return {
    id: scene.id,
    title: scene.title,
    stop,
    turns: n,
    observed: observe(turns),
    encoded,
    bitsPerTurn: n ? encoded.bits / n : 0,
    dataOppFrac: n ? encoded.dataOpportunities / n : 0,
  };
}
