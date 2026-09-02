/**
 * Live runway characterization. Conversation first. No payload target.
 *   npm run test:v4-eval-c-lm
 *   EVAL_C_SCENES=dinner,weekend npm run test:v4-eval-c-lm
 *   EVAL_C_WRITE_FROZEN=1 npm run test:v4-eval-c-lm
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { openaiKey, openaiModel, proposeIntentSet } from './f4.lm.ts';
import { parseCandidates } from './eval-uuid.ts';
import { encodeRun } from './eval-re.ts';
import {
  PROBE,
  SCENES,
  START_128,
  TURN_CAP,
  intentsFrom,
  measureCell,
  needsOwnerData,
  nextSpeaker,
  parseTurnOrEnd,
  promptIsBlindScene,
  scenePrompt,
  type CellRow,
  type FrozenTurn,
  type Scene,
  type SceneId,
  type Stop,
} from './eval-c.ts';

if (!openaiKey()) {
  console.error('OPENAI_API_KEY is empty');
  process.exit(2);
}

async function proposeTurn(scene: Scene, history: readonly FrozenTurn[], speaker: 'A' | 'B'): Promise<string> {
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
            'You are one speaker in a casual conversation. Write only that speaker next turn. A turn may be more than one sentence. If the conversation has naturally concluded, reply with exactly END. No list. No explanation.',
        },
        { role: 'user', content: scenePrompt(scene, history, speaker) },
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

const frozenPath = resolve(process.cwd(), 'v4/eval-c.frozen.ts');
const talkPath = resolve(process.cwd(), 'v4/eval-c.conversations.md');

interface FrozenFile {
  transcripts: Record<string, { stop: Stop; turns: FrozenTurn[] }>;
  rows: Record<string, CellRow>;
}

function loadFrozen(): FrozenFile {
  if (!existsSync(frozenPath)) return { transcripts: {}, rows: {} };
  const text = readFileSync(frozenPath, 'utf8');
  const match = text.match(/export const FROZEN = (\{[\s\S]*\}) as const;/);
  if (!match) return { transcripts: {}, rows: {} };
  return JSON.parse(match[1]) as FrozenFile;
}

function writeFrozen(data: FrozenFile): void {
  writeFileSync(
    frozenPath,
    `/**
 * Frozen runway conversations. Do not regenerate a completed scene.
 */
export const FROZEN = ${JSON.stringify(data, null, 2)} as const;
`,
  );
}

function writeConversations(transcripts: FrozenFile['transcripts']): void {
  const parts = SCENES.filter((s) => transcripts[s.id]).map((s) => {
    const rec = transcripts[s.id];
    const body = rec.turns.map((t) => `${t.speaker}: "${t.utterance.replace(/"/g, "'")}"`).join('\n');
    return `## ${s.id}  ${rec.stop}  ${rec.turns.length} turns\n\n${body}\n`;
  });
  writeFileSync(
    talkPath,
    `# Eval-C conversations\n\nNo payload during generation. Do not regenerate.\n\n${parts.join('\n')}`,
  );
}

async function generateScene(scene: Scene): Promise<{ stop: Stop; turns: FrozenTurn[] }> {
  const turns: FrozenTurn[] = [];
  while (turns.length < TURN_CAP) {
    const speaker = nextSpeaker(turns);
    if (!promptIsBlindScene(scene, turns, speaker)) {
      throw new Error(`blind ${scene.id} U${turns.length + 1}`);
    }
    const raw = await proposeTurn(scene, turns, speaker);
    const parsed = parseTurnOrEnd(raw);
    if (parsed?.kind === 'END') return { stop: 'NATURAL', turns };
    if (parsed?.kind === 'U') {
      turns.push({ speaker, utterance: parsed.u });
      console.log(`  U${turns.length} ${speaker}  ${parsed.u.slice(0, 88)}`);
      continue;
    }
    throw new Error(`parse ${scene.id} U${turns.length + 1}`);
  }
  return { stop: 'CAPPED', turns };
}

async function encodeScene(turns: readonly FrozenTurn[]): Promise<string[][]> {
  const sets: string[][] = [];
  const intents = intentsFrom(turns);
  for (let i = 0; i < turns.length; i++) {
    const soFar = encodeRun(PROBE, START_128, intents, sets);
    if (soFar.kind === 'UUID') break;
    if (soFar.kind === 'NO_CANDIDATE' && soFar.index === i - 1) break;
    const turn = turns[i];
    const owner = soFar.machine.frame?.owner ?? 'A';
    const mode = soFar.machine.frame?.mode ?? 'SKIP';
    const rem = soFar.machine.frame?.remaining ?? PROBE.length;
    const data = needsOwnerData(turn.speaker, owner, mode, rem);
    if (data) {
      const history = soFar.turns.map((t) => ({ speaker: t.speaker, utterance: t.utterance }));
      sets.push(parseCandidates(await proposeIntentSet(history, turn.speaker, turn.utterance)));
      console.log(`  DATA ${i + 1}/${turns.length}  k=${sets[sets.length - 1].length}`);
    } else {
      sets.push([turn.utterance]);
    }
    const next = encodeRun(PROBE, START_128, intents, sets);
    if (next.kind === 'NO_CANDIDATE' && next.index === i) {
      console.log(`  U${i + 1} ${turn.speaker}  ${next.role}  wanted=${next.wanted || '—'}  NO_CANDIDATE`);
      break;
    }
  }
  return sets;
}

const want = (process.env.EVAL_C_SCENES ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean) as SceneId[];

const frozen = loadFrozen();
const pending = SCENES.filter((s) => !frozen.rows[s.id] && (want.length === 0 || want.includes(s.id)));

console.log(`V4-Eval-C-LM  model=${openaiModel()}  pending=${pending.map((s) => s.id).join(',') || 'none'}\n`);

for (const scene of pending) {
  console.log(`${scene.id}  ${scene.title}`);
  let rec = frozen.transcripts[scene.id];
  if (!rec) {
    rec = await generateScene(scene);
    frozen.transcripts[scene.id] = rec;
    if (process.env.EVAL_C_WRITE_FROZEN === '1') {
      writeFrozen(frozen);
      writeConversations(frozen.transcripts);
    }
    console.log(`  → ${rec.stop}  ${rec.turns.length} turns`);
  } else {
    console.log(`  frozen transcript  ${rec.stop}  ${rec.turns.length} turns`);
  }
  const sets = await encodeScene(rec.turns);
  frozen.rows[scene.id] = measureCell(scene, rec.turns, rec.stop, sets);
  const row = frozen.rows[scene.id];
  console.log(
    `  C_observed=${row.observed.bits}  C_encodable=${row.encoded.bits}  bits/turn=${row.bitsPerTurn.toFixed(3)}  DATA_opp=${row.encoded.dataOpportunities}/${row.turns}  ${row.encoded.result}`,
  );
  if (process.env.EVAL_C_WRITE_FROZEN === '1') {
    writeFrozen(frozen);
    writeConversations(frozen.transcripts);
  }
}

for (const scene of SCENES) {
  const row = frozen.rows[scene.id];
  if (!row) continue;
  console.log(
    `${row.id.padEnd(12)} ${row.stop.padEnd(8)} turns=${String(row.turns).padStart(3)}  C_obs=${String(row.observed.bits).padStart(3)}  C_enc=${String(row.encoded.bits).padStart(3)}  bits/turn=${row.bitsPerTurn.toFixed(3)}  DATA_opp=${row.encoded.dataOpportunities}/${row.turns}`,
  );
}
console.log('\nV4-Eval-C-LM cells  CAPPED is a negative result');
