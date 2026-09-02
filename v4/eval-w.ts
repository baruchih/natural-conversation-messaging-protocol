/**
 * First W. Intent-paired, job-skeleton.
 * CONTROL and TREATMENT differ only by NCMP selection on owner DATA.
 * k = 50. Do not enlarge. Do not change half3.
 * Do not amend the specification. Surface-paired is on the shelf.
 */
import { ACK_EXAMPLE, PROBE_EXAMPLE, START_128, declaredBits, fresh, process } from './baseline.ts';
import { FROZEN as C_FROZEN } from './eval-c.frozen.ts';
import { SCENES as C_SCENES, sceneById, type SceneId } from './eval-c.ts';
import { BATCH, intentPrompt } from './f4.ts';
import { needsOwnerData, nextSymbol, parseNatural, selectNatural, selectOwnerData } from './eval-uuid.ts';
import { tokenList } from '../v1-v2/p7c6.lm.ts';

export { BATCH, START_128, declaredBits, intentPrompt, needsOwnerData, parseNatural, selectNatural, selectOwnerData };

export type WSceneId = 'weekend' | 'dinner' | 'technical';

export interface Job {
  speaker: 'A' | 'B';
  job: string;
}

export interface WCell {
  id: WSceneId;
  payload: string;
  cap: number;
  skeleton: readonly Job[];
}

/** Fits already-measured C_encodable. Declared before pairs. */
export const PAYLOADS = {
  weekend: '11',
  dinner: '1011010010',
  technical: '110010101',
} as const;

export const CAPS = {
  weekend: C_FROZEN.rows.weekend.encoded.bits,
  dinner: C_FROZEN.rows.dinner.encoded.bits,
  technical: C_FROZEN.rows.technical.encoded.bits,
} as const;

/** One job per frozen Eval-C turn. Do not collapse the social tail. */
export const SKELETONS: Record<WSceneId, readonly Job[]> = {
  weekend: [
    { speaker: 'A', job: 'Propose a Saturday morning walk and a reason to go early.' },
    { speaker: 'B', job: 'Accept the walk and name a meeting place and time.' },
    { speaker: 'A', job: 'Confirm the place and time.' },
    { speaker: 'B', job: 'Look forward to catching up and optionally suggest coffee after.' },
    { speaker: 'A', job: 'Accept coffee if the walk goes well, and close until morning.' },
    { speaker: 'B', job: 'Close the plan warmly.' },
  ],
  dinner: [
    { speaker: 'A', job: 'Propose pesto pasta, mention checking garlic, and ask about the shop.' },
    { speaker: 'B', job: 'Accept pesto, skip the shop if garlic is fine, suggest cherry tomatoes.' },
    { speaker: 'A', job: 'Accept the tomatoes and go check the garlic.' },
    { speaker: 'B', job: 'Start the pasta water while waiting on garlic.' },
    { speaker: 'A', job: 'Report garlic is fine, skip the shop, offer to help prep.' },
    { speaker: 'B', job: 'Thank them and get ready to toss the pasta.' },
    { speaker: 'A', job: 'Say the pesto is ready and the pasta is nearly done.' },
    { speaker: 'B', job: 'Drain the pasta and mix it.' },
    { speaker: 'A', job: 'Get the plates.' },
    { speaker: 'B', job: 'Finish mixing and dish out.' },
    { speaker: 'A', job: 'Say the plates are ready and simple meals feel special.' },
    { speaker: 'B', job: 'Agree and want to enjoy the food together.' },
    { speaker: 'A', job: 'Cheer the dinner and float a movie afterward.' },
    { speaker: 'B', job: 'Accept a movie after the meal.' },
    { speaker: 'A', job: 'Look forward to the pasta and the movie.' },
    { speaker: 'B', job: 'Eat first, then browse for a movie.' },
    { speaker: 'A', job: 'Savor the meal and the small moment.' },
    { speaker: 'B', job: 'Savor the meal, then pick a movie.' },
    { speaker: 'A', job: 'Take time choosing the movie after eating.' },
    { speaker: 'B', job: 'Enjoy the pasta, then the movie.' },
    { speaker: 'A', job: 'Notice the pasta and keep the movie plan.' },
    { speaker: 'B', job: 'Enjoy the food and look forward to a quiet movie.' },
    { speaker: 'A', job: 'Relish the pasta before the movie.' },
    { speaker: 'B', job: 'Value the food and the company.' },
    { speaker: 'A', job: 'Finish the pasta, then get comfortable for the movie.' },
    { speaker: 'B', job: 'Want to make the evening count.' },
    { speaker: 'A', job: 'Take time with the meal and then find a movie.' },
    { speaker: 'B', job: 'Close: savor the pasta, then browse for a movie.' },
  ],
  technical: [
    { speaker: 'A', job: 'Suggest restarting the app, or else check the error logs.' },
    { speaker: 'B', job: 'Agree to restart first, then logs if needed.' },
    { speaker: 'A', job: 'Go ahead with the restart.' },
    { speaker: 'B', job: 'Restart now.' },
    { speaker: 'A', job: 'Watch the save button after reboot; grab logs if it fails.' },
    { speaker: 'B', job: 'Wait through the restart.' },
    { speaker: 'A', job: 'Watch the save button as it comes back up.' },
    { speaker: 'B', job: 'Click save and see if it works.' },
    { speaker: 'A', job: 'Report save still fails; move to the logs.' },
    { speaker: 'B', job: 'Open the logs together.' },
    { speaker: 'A', job: 'Start reading the log messages.' },
    { speaker: 'B', job: 'Point at a few suspicious entries.' },
    { speaker: 'A', job: 'Split the suspicious entries between you.' },
    { speaker: 'B', job: 'Note a possible database connection problem.' },
    { speaker: 'A', job: 'Consider settings or whether the server is up.' },
    { speaker: 'B', job: 'Keep reading for more database clues.' },
    { speaker: 'A', job: 'Scan the rest of the logs.' },
    { speaker: 'B', job: 'Find a database query timeout.' },
    { speaker: 'A', job: 'Plan to adjust settings and maybe ask IT.' },
    { speaker: 'B', job: 'Offer to draft a note to IT about the timeout.' },
    { speaker: 'A', job: 'Document findings; start checking connection settings.' },
    { speaker: 'B', job: 'Start the IT note while settings are checked.' },
    { speaker: 'A', job: 'Aim to finish today and share what the settings show.' },
    { speaker: 'B', job: 'Send the note and wait for a reply.' },
    { speaker: 'A', job: 'Stay in touch after IT and the settings check.' },
    { speaker: 'B', job: 'Promise to share IT’s reply and keep momentum.' },
    { speaker: 'A', job: 'Reaffirm the plan: settings now, IT next.' },
    { speaker: 'B', job: 'Watch for IT while finishing the note.' },
    { speaker: 'A', job: 'Stay on it and wait for news.' },
    { speaker: 'B', job: 'Close: keep talking, hope it is fixed soon.' },
  ],
};

export const CELLS: readonly WCell[] = (['weekend', 'dinner', 'technical'] as const).map((id) => ({
  id,
  payload: PAYLOADS[id],
  cap: CAPS[id],
  skeleton: SKELETONS[id],
}));

export function settingFor(id: WSceneId): string {
  return sceneById(id as SceneId).setting;
}

export function jobPrompt(
  setting: string,
  history: readonly { speaker: string; utterance: string }[],
  speaker: 'A' | 'B',
  job: string,
): string {
  const soFar = history.length
    ? history.map((t) => `${t.speaker}: ${t.utterance}`).join('\n')
    : '(no turns yet)';
  return `${setting}

Conversation so far:
${soFar}

${speaker}'s job this turn:
${job}

Write one conversational turn that does that job. A turn may contain more than one sentence. No numbering. No quotation marks. No list of alternatives.`;
}

/** Same job text as CONTROL. k realizations. No extra “sound natural despite”. */
export function jobSetPrompt(
  setting: string,
  history: readonly { speaker: string; utterance: string }[],
  speaker: 'A' | 'B',
  job: string,
  k = BATCH,
): string {
  const soFar = history.length
    ? history.map((t) => `${t.speaker}: ${t.utterance}`).join('\n')
    : '(no turns yet)';
  return `${setting}

Conversation so far:
${soFar}

${speaker}'s job this turn:
${job}

Write ${k} conversational turns that do that job. Vary sentence structure and phrasing. One turn per line. A turn may contain more than one sentence. No numbering. No quotation marks.`;
}

export function promptsAreSymmetric(setting: string, history: readonly { speaker: string; utterance: string }[], speaker: 'A' | 'B', job: string): boolean {
  const a = jobPrompt(setting, history, speaker, job);
  const b = jobSetPrompt(setting, history, speaker, job, BATCH);
  const shared = `${setting}

Conversation so far:`;
  return a.startsWith(shared) && b.startsWith(shared) && a.includes(job) && b.includes(job) && !/despite|constraint|ncmp|encode/i.test(a) && !/despite|constraint|ncmp|encode/i.test(b);
}

function isBlind(p: string): boolean {
  const t = p.toLowerCase();
  if (t.includes('ncmp') || t.includes('residue') || t.includes('letter-sum')) return false;
  if (t.includes('encode') || t.includes('protocol') || /\b64\b/.test(t)) return false;
  return true;
}

export function promptIsBlindJob(id: WSceneId, history: readonly { speaker: string; utterance: string }[], speaker: 'A' | 'B', job: string): boolean {
  const setting = settingFor(id);
  return isBlind(jobPrompt(setting, history, speaker, job)) && isBlind(jobSetPrompt(setting, history, speaker, job)) && isBlind(job);
}

export const OBSERVERS = ['surface', 'preference'] as const;
export const LATER = ['protocol-informed'] as const;

/** Declared before pairs. Do not add features after seeing them. */
export const SURFACE_FEATURES = [
  'meanTokens',
  'meanChars',
  'ttr',
  'digitTurnRate',
  'bangTurnRate',
] as const;

export type SurfaceFeature = (typeof SURFACE_FEATURES)[number];

export interface SurfaceRow {
  meanTokens: number;
  meanChars: number;
  ttr: number;
  digitTurnRate: number;
  bangTurnRate: number;
}

export interface FrozenTurn {
  speaker: 'A' | 'B';
  utterance: string;
}

export function surfaceOf(turns: readonly FrozenTurn[]): SurfaceRow {
  const toks = turns.map((t) => tokenList(t.utterance));
  const flat = toks.flat();
  const n = turns.length || 1;
  const unique = new Set(flat.map((x) => x.toLowerCase()));
  return {
    meanTokens: toks.reduce((s, t) => s + t.length, 0) / n,
    meanChars: turns.reduce((s, t) => s + t.utterance.length, 0) / n,
    ttr: flat.length ? unique.size / flat.length : 0,
    digitTurnRate: turns.filter((t) => /\d/.test(t.utterance)).length / n,
    bangTurnRate: turns.filter((t) => t.utterance.includes('!')).length / n,
  };
}

export function tokensOf(turns: readonly FrozenTurn[]): Set<string> {
  return new Set(turns.flatMap((t) => tokenList(t.utterance).map((x) => x.toLowerCase())));
}

export function jaccard(a: readonly FrozenTurn[], b: readonly FrozenTurn[]): number {
  const A = tokensOf(a);
  const B = tokensOf(b);
  const inter = [...A].filter((x) => B.has(x)).length;
  const union = new Set([...A, ...B]).size;
  return union ? inter / union : 0;
}

export interface ConstrainedTurn {
  index: number;
  wanted: string;
  hit: boolean;
  examined: number;
}

export interface ArmResult {
  arm: 'control' | 'treatment';
  turns: FrozenTurn[];
  bits: number;
  remaining: number;
  constrained: ConstrainedTurn[];
  noCandidate: boolean;
}

export function openWide() {
  const m = fresh();
  process(m, 'A', PROBE_EXAMPLE);
  process(m, 'B', ACK_EXAMPLE);
  process(m, 'A', START_128);
  return m;
}

export function playArm(
  cell: WCell,
  sets: readonly (readonly string[])[],
  arm: 'control' | 'treatment',
): ArmResult {
  const m = openWide();
  let remaining = cell.payload;
  const turns: FrozenTurn[] = [];
  const constrained: ConstrainedTurn[] = [];
  let noCandidate = false;
  for (let i = 0; i < cell.skeleton.length; i++) {
    const job = cell.skeleton[i];
    const owner = m.frame?.owner ?? 'A';
    const mode = m.frame?.mode ?? 'SKIP';
    const remBits = m.frame?.remaining ?? remaining.length;
    const data = needsOwnerData(job.speaker, owner, mode, remBits) && remaining.length > 0;
    const cands = sets[i] ?? [];
    if (data) {
      const sel = arm === 'treatment' ? selectOwnerData(cands, remaining) : selectNatural(cands);
      const fallback = arm === 'treatment' && sel.chosen === null ? selectNatural(cands).chosen : sel.chosen;
      if (arm === 'treatment') {
        constrained.push({
          index: i,
          wanted: nextSymbol(remaining) ?? remaining,
          hit: sel.chosen !== null,
          examined: sel.searched ? Math.max(1, sel.chosenIndex + 1) : 1,
        });
        if (sel.chosen === null) noCandidate = true;
      }
      if (!fallback) {
        return { arm, turns, bits: cell.payload.length - remaining.length, remaining: remaining.length, constrained, noCandidate: true };
      }
      const snap = process(m, job.speaker, fallback);
      turns.push({ speaker: job.speaker, utterance: fallback });
      if (snap.bits && (arm === 'control' || sel.chosen)) remaining = remaining.slice(snap.bits.length);
    } else {
      const sel = selectNatural(cands);
      if (!sel.chosen) {
        return { arm, turns, bits: cell.payload.length - remaining.length, remaining: remaining.length, constrained, noCandidate: true };
      }
      process(m, job.speaker, sel.chosen);
      turns.push({ speaker: job.speaker, utterance: sel.chosen });
    }
  }
  return {
    arm,
    turns,
    bits: cell.payload.length - remaining.length,
    remaining: remaining.length,
    constrained,
    noCandidate,
  };
}

/** Next skeleton job needs k-then-select under this arm's state. */
export function peekData(cell: WCell, sets: readonly (readonly string[])[], arm: 'control' | 'treatment'): boolean {
  const soFar = playArm(cell, sets, arm);
  const i = soFar.turns.length;
  if (i >= cell.skeleton.length) return false;
  const m = openWide();
  let remaining = cell.payload;
  for (const t of soFar.turns) {
    const snap = process(m, t.speaker, t.utterance);
    if (snap.bits) remaining = remaining.slice(snap.bits.length);
  }
  const job = cell.skeleton[i];
  const owner = m.frame?.owner ?? 'A';
  const mode = m.frame?.mode ?? 'SKIP';
  const remBits = m.frame?.remaining ?? remaining.length;
  return needsOwnerData(job.speaker, owner, mode, remBits) && remaining.length > 0;
}

export function intensity(constrained: readonly ConstrainedTurn[], n: number): number {
  return n ? constrained.length / n : 0;
}

export function formatTranscript(turns: readonly FrozenTurn[]): string {
  return turns.map((t) => `${t.speaker}: ${t.utterance}`).join('\n');
}

export function preferencePrompt(x: readonly FrozenTurn[], y: readonly FrozenTurn[]): string {
  return `Two conversations. Which one seems less natural? Reply with only X or Y.

X:
${formatTranscript(x)}

Y:
${formatTranscript(y)}`;
}

export function parsePreference(text: string): 'X' | 'Y' | null {
  const t = text.trim().toUpperCase();
  if (t.startsWith('X')) return 'X';
  if (t.startsWith('Y')) return 'Y';
  return null;
}

export function promptIsBlindPreference(p: string): boolean {
  return isBlind(p);
}

export interface PairRow {
  id: WSceneId;
  n: number;
  payload: string;
  control: SurfaceRow;
  treatment: SurfaceRow;
  jaccard: number;
  constrained: ConstrainedTurn[];
  intensity: number;
  bitsPlaced: number;
  noCandidate: boolean;
  treatmentOn: 'X' | 'Y';
  preference: 'X' | 'Y' | null;
  preferencePickedTreatment: boolean | null;
}

export function sceneTitle(id: WSceneId): string {
  return C_SCENES.find((s) => s.id === id)?.title ?? id;
}
