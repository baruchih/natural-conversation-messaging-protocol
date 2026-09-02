/**
 * First W live pairs. Intent-paired. Constraint in selection only.
 *   npm run test:v4-eval-w-lm
 *   EVAL_W_SCENES=weekend npm run test:v4-eval-w-lm
 *   EVAL_W_WRITE_FROZEN=1 npm run test:v4-eval-w-lm
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { openaiKey, openaiModel } from './f4.lm.ts';
import { parseCandidates } from './f4.ts';
import {
  CELLS,
  intensity,
  jaccard,
  jobPrompt,
  jobSetPrompt,
  parseNatural,
  parsePreference,
  peekData,
  playArm,
  preferencePrompt,
  promptIsBlindJob,
  promptIsBlindPreference,
  settingFor,
  surfaceOf,
  type FrozenTurn,
  type PairRow,
  type WCell,
} from './eval-w.ts';

if (!openaiKey()) {
  console.error('OPENAI_API_KEY is empty');
  process.exit(2);
}

async function proposeOne(user: string): Promise<string> {
  const apiKey = openaiKey();
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: openaiModel(),
      temperature: 0.9,
      messages: [
        {
          role: 'system',
          content: 'Write only the requested conversational turn or turns. No explanation.',
        },
        { role: 'user', content: user },
      ],
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI ${response.status}: ${body.slice(0, 400)}`);
  }
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content ?? '';
}

async function generateSets(cell: WCell, arm: 'control' | 'treatment'): Promise<string[][]> {
  const setting = settingFor(cell.id);
  const sets: string[][] = [];
  for (let i = 0; i < cell.skeleton.length; i++) {
    const job = cell.skeleton[i];
    const history = playArm(cell, sets, arm).turns.map((t) => ({ speaker: t.speaker, utterance: t.utterance }));
    if (!promptIsBlindJob(cell.id, history, job.speaker, job.job)) {
      throw new Error(`blind ${cell.id} ${arm} U${i + 1}`);
    }
    const data = peekData(cell, sets, arm);
    const raw = data
      ? await proposeOne(jobSetPrompt(setting, history, job.speaker, job.job))
      : await proposeOne(jobPrompt(setting, history, job.speaker, job.job));
    const parsed = data
      ? parseCandidates(raw)
      : (() => {
          const u = parseNatural(raw);
          return u ? [u] : [];
        })();
    sets.push(parsed);
    const turn = playArm(cell, sets, arm).turns[i];
    const tag = data ? (arm === 'treatment' ? 'DATA' : 'k') : 'one';
    console.log(`  ${arm} U${i + 1} ${job.speaker}  ${tag}  ${(turn?.utterance ?? '—').slice(0, 80)}`);
  }
  return sets;
}

const frozenPath = resolve(process.cwd(), 'v4/eval-w.frozen.ts');
const talkPath = resolve(process.cwd(), 'v4/eval-w.conversations.md');

interface FrozenFile {
  pairs: Record<string, { control: FrozenTurn[]; treatment: FrozenTurn[]; treatmentOn: 'X' | 'Y'; preferenceRaw: string }>;
  rows: Record<string, PairRow>;
}

function loadFrozen(): FrozenFile {
  if (!existsSync(frozenPath)) return { pairs: {}, rows: {} };
  const text = readFileSync(frozenPath, 'utf8');
  const match = text.match(/export const FROZEN = (\{[\s\S]*\}) as const;/);
  if (!match) return { pairs: {}, rows: {} };
  return JSON.parse(match[1]) as FrozenFile;
}

function writeFrozen(data: FrozenFile): void {
  writeFileSync(
    frozenPath,
    `/**
 * Frozen first W pairs. Do not regenerate a completed scene.
 */
export const FROZEN = ${JSON.stringify(data, null, 2)} as const;
`,
  );
}

function writeTalk(pairs: FrozenFile['pairs']): void {
  const parts = CELLS.filter((c) => pairs[c.id]).map((c) => {
    const p = pairs[c.id];
    const fmt = (ts: FrozenTurn[]) => ts.map((t) => `${t.speaker}: "${t.utterance.replace(/"/g, "'")}"`).join('\n');
    return `## ${c.id}\n\n### CONTROL\n\n${fmt(p.control)}\n\n### TREATMENT\n\n${fmt(p.treatment)}\n`;
  });
  writeFileSync(talkPath, `# Eval-W conversations\n\nIntent-paired. Do not regenerate.\n\n${parts.join('\n')}`);
}

const want = (process.env.EVAL_W_SCENES ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const frozen = loadFrozen();
const pending = CELLS.filter((c) => !frozen.rows[c.id] && (want.length === 0 || want.includes(c.id)));

console.log(`V4-W-LM  model=${openaiModel()}  pending=${pending.map((c) => c.id).join(',') || 'none'}\n`);

for (const cell of pending) {
  console.log(`${cell.id}  payload=${cell.payload}`);
  const controlSets = await generateSets(cell, 'control');
  const treatmentSets = await generateSets(cell, 'treatment');
  const control = playArm(cell, controlSets, 'control');
  const treatment = playArm(cell, treatmentSets, 'treatment');
  const treatmentOn: 'X' | 'Y' = Math.random() < 0.5 ? 'X' : 'Y';
  const x = treatmentOn === 'X' ? treatment.turns : control.turns;
  const y = treatmentOn === 'X' ? control.turns : treatment.turns;
  const prefPrompt = preferencePrompt(x, y);
  if (!promptIsBlindPreference(prefPrompt)) throw new Error(`pref leak ${cell.id}`);
  const preferenceRaw = await proposeOne(prefPrompt);
  const preference = parsePreference(preferenceRaw);
  const row: PairRow = {
    id: cell.id,
    n: cell.skeleton.length,
    payload: cell.payload,
    control: surfaceOf(control.turns),
    treatment: surfaceOf(treatment.turns),
    jaccard: jaccard(control.turns, treatment.turns),
    constrained: treatment.constrained,
    intensity: intensity(treatment.constrained, cell.skeleton.length),
    bitsPlaced: treatment.bits,
    noCandidate: treatment.noCandidate,
    treatmentOn,
    preference,
    preferencePickedTreatment: preference === null ? null : preference === treatmentOn,
  };
  frozen.pairs[cell.id] = { control: control.turns, treatment: treatment.turns, treatmentOn, preferenceRaw };
  frozen.rows[cell.id] = row;
  console.log(
    `  bits ${treatment.bits}/${cell.payload.length}  DATA ${treatment.constrained.filter((c) => c.hit).length}/${treatment.constrained.length}  intensity=${row.intensity.toFixed(3)}  pref=${preference ?? '—'}  treat=${treatmentOn}  pickedT=${row.preferencePickedTreatment}`,
  );
  if (process.env.EVAL_W_WRITE_FROZEN === '1') {
    writeFrozen(frozen);
    writeTalk(frozen.pairs);
  }
}

console.log('\nV4-W-LM cells');
for (const cell of CELLS) {
  const row = frozen.rows[cell.id];
  if (!row) continue;
  console.log(
    `${row.id.padEnd(12)} N=${row.n}  DATA=${row.constrained.length}/${row.n}  bits=${row.bitsPlaced}/${row.payload.length}  jaccard=${row.jaccard.toFixed(3)}  prefT=${row.preferencePickedTreatment}`,
  );
}
