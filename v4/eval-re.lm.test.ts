/**
 * Live reliability cells. Same encoder. k = 50.
 * Does not regenerate 128-a-hike (uses eval-uuid.frozen).
 *   npm run test:v4-eval-re-lm
 *   EVAL_RE_CELLS=8-a-hike,8-a-dinner npm run test:v4-eval-re-lm
 *   EVAL_RE_WRITE_FROZEN=1 npm run test:v4-eval-re-lm
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { openaiKey, openaiModel, proposeIntentSet } from './f4.lm.ts';
import { FROZEN as UUID_RUN } from './eval-uuid.frozen.ts';
import {
  CELLS,
  CONTEXTS,
  dataHits,
  encodeRun,
  measure,
  type DataHit,
  type RunRow,
} from './eval-re.ts';
import { naturalPrompt, parseCandidates, parseNatural, promptIsBlind, promptIsBlindNatural } from './eval-uuid.ts';

if (!openaiKey()) {
  console.error('OPENAI_API_KEY is empty');
  process.exit(2);
}

async function proposeNatural(
  history: readonly { speaker: string; utterance: string }[],
  speaker: string,
  intent: string,
): Promise<string> {
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
          content:
            'You continue a casual conversation with one natural turn. A turn may be more than one sentence. No list of alternatives. No explanation.',
        },
        { role: 'user', content: naturalPrompt(history, speaker, intent) },
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

const frozenPath = resolve(process.cwd(), 'v4/eval-re.frozen.ts');

function loadFrozen(): { rows: Record<string, RunRow>; hits: Record<string, DataHit[]> } {
  if (!existsSync(frozenPath)) return { rows: {}, hits: {} };
  const text = readFileSync(frozenPath, 'utf8');
  const match = text.match(/export const FROZEN = (\{[\s\S]*\}) as const;/);
  if (!match) return { rows: {}, hits: {} };
  const parsed = JSON.parse(match[1]) as { rows?: Record<string, RunRow>; hits?: Record<string, DataHit[]> };
  return { rows: parsed.rows ?? {}, hits: parsed.hits ?? {} };
}

function writeFrozen(rows: Record<string, RunRow>, hits: Record<string, DataHit[]>): void {
  writeFileSync(
    frozenPath,
    `/**
 * Frozen reliability rows. Do not regenerate a completed cell.
 */
export const FROZEN = ${JSON.stringify({ rows, hits }, null, 2)} as const;
`,
  );
}

const want = (process.env.EVAL_RE_CELLS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const { rows, hits } = loadFrozen();
if (!rows['128-a-hike']) {
  const cell = CELLS.find((c) => c.id === '128-a-hike')!;
  const encoded = encodeRun(cell.payload, cell.start, CONTEXTS[cell.context], UUID_RUN.candidates);
  rows['128-a-hike'] = measure(cell, encoded, UUID_RUN.unused);
}
if (!hits['128-a-hike']) {
  const cell = CELLS.find((c) => c.id === '128-a-hike')!;
  const encoded = encodeRun(cell.payload, cell.start, CONTEXTS[cell.context], UUID_RUN.candidates);
  hits['128-a-hike'] = dataHits(encoded.turns);
}

const pending = CELLS.filter((c) => !rows[c.id] && (want.length === 0 || want.includes(c.id)));

console.log(`V4-Eval-RE-LM  model=${openaiModel()}  pending=${pending.map((c) => c.id).join(',') || 'none'}`);

for (const cell of pending) {
  const intents = CONTEXTS[cell.context];
  const sets: string[][] = [];
  const history: { speaker: string; utterance: string }[] = [];
  console.log(`\n${cell.id}  bits=${cell.payload.length}  context=${cell.context}`);
  for (let i = 0; i < intents.length; i++) {
    const soFar = encodeRun(cell.payload, cell.start, intents, sets);
    if (soFar.kind === 'UUID') break;
    if (soFar.kind === 'NO_CANDIDATE' && soFar.index === i - 1) break;
    const intent = intents[i];
    const owner = soFar.machine.frame?.owner ?? 'A';
    const mode = soFar.machine.frame?.mode ?? 'SKIP';
    const rem = soFar.machine.frame?.remaining ?? cell.payload.length;
    const data = intent.speaker === owner && mode === 'DATA' && rem > 0;
    if (data) {
      if (!promptIsBlind(history, intent.speaker, intent.text)) throw new Error(`leak ${cell.id} ${i + 1}`);
      sets.push(parseCandidates(await proposeIntentSet(history, intent.speaker, intent.text)));
    } else {
      if (!promptIsBlindNatural(history, intent.speaker, intent.text)) throw new Error(`leak ${cell.id} ${i + 1}`);
      const u = parseNatural(await proposeNatural(history, intent.speaker, intent.text));
      sets.push(u ? [u] : []);
    }
    const next = encodeRun(cell.payload, cell.start, intents, sets);
    const turn = next.turns[i];
    if (next.kind === 'NO_CANDIDATE' && next.index === i) {
      console.log(`  U${i + 1} ${intent.speaker}  ${next.role}  wanted=${next.wanted || '—'}  NO_CANDIDATE`);
      break;
    }
    if (turn) {
      console.log(`  U${i + 1} ${intent.speaker}  ${turn.role}  ${turn.outcome}  bits=${turn.bits || '—'}  rem=${turn.remaining ?? '—'}`);
      history.push({ speaker: intent.speaker, utterance: turn.utterance });
    }
  }
  const encoded = encodeRun(cell.payload, cell.start, intents, sets);
  const row = measure(cell, encoded, intents.length - sets.length);
  rows[cell.id] = row;
  hits[cell.id] = dataHits(encoded.turns);
  console.log(
    `  → ${row.result}  turns=${row.bodyTurns}  DATA ${row.dataSuccesses}/${row.dataOpportunities}  bits/turn=${row.bitsPerBodyTurn.toFixed(3)}`,
  );
  if (process.env.EVAL_RE_WRITE_FROZEN === '1') writeFrozen(rows, hits);
}

if (process.env.EVAL_RE_WRITE_FROZEN === '1') writeFrozen(rows, hits);

console.log('\nV4-Eval-RE-LM cells');
for (const cell of CELLS) {
  const row = rows[cell.id];
  if (!row) {
    console.log(`${cell.id.padEnd(16)} pending`);
    continue;
  }
  console.log(
    `${cell.id.padEnd(16)} ${row.result.padEnd(14)} DATA ${row.dataSuccesses}/${row.dataOpportunities}  bits/turn=${row.bitsPerBodyTurn.toFixed(3)}`,
  );
}
