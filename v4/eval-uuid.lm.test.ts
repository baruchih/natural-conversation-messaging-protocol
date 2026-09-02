/**
 * Spec UUID live evaluation. Peer / owner SKIP: one natural U.
 * Owner DATA: k = 50. No second call after a miss.
 *   npm run test:v4-eval-uuid-lm
 *   EVAL_UUID_WRITE_FROZEN=1 npm run test:v4-eval-uuid-lm
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { openaiKey, openaiModel, proposeIntentSet } from './f4.lm.ts';
import {
  BATCH,
  INTENTS,
  PAYLOAD,
  UUID,
  bitsToUuid,
  encodeFromSets,
  naturalPrompt,
  parseCandidates,
  parseNatural,
  promptIsBlind,
  promptIsBlindNatural,
  symbolCount,
  tally,
} from './eval-uuid.ts';

if (!openaiKey()) {
  console.error('OPENAI_API_KEY is empty. Put it in .env and re-run npm run test:v4-eval-uuid-lm');
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
  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? '';
}

console.log(`V4-Eval-UUID-LM  model=${openaiModel()}  DATA k=${BATCH}  bits=${PAYLOAD.length}  symbols=${symbolCount(PAYLOAD)}`);
console.log(`uuid ${UUID}`);
console.log('Peer and owner SKIP: one natural U. Owner DATA: search. Blind generator.\n');

const sets: string[][] = [];
const history: { speaker: string; utterance: string }[] = [];

for (let i = 0; i < INTENTS.length; i++) {
  const soFar = encodeFromSets(sets);
  if (soFar.kind === 'UUID') break;
  if (soFar.kind === 'NO_CANDIDATE' && soFar.index === i - 1) break;
  const intent = INTENTS[i];
  const owner = soFar.machine.frame?.owner ?? 'A';
  const mode = soFar.machine.frame?.mode ?? 'SKIP';
  const rem = soFar.machine.frame?.remaining ?? PAYLOAD.length;
  const data = intent.speaker === owner && mode === 'DATA' && rem > 0;
  if (data) {
    if (!promptIsBlind(history, intent.speaker, intent.text)) {
      throw new Error(`prompt leaked on intent ${i + 1}`);
    }
    const raw = await proposeIntentSet(history, intent.speaker, intent.text);
    sets.push(parseCandidates(raw));
  } else {
    if (!promptIsBlindNatural(history, intent.speaker, intent.text)) {
      throw new Error(`natural prompt leaked on intent ${i + 1}`);
    }
    const raw = await proposeNatural(history, intent.speaker, intent.text);
    const u = parseNatural(raw);
    sets.push(u ? [u] : []);
  }
  const next = encodeFromSets(sets);
  const turn = next.turns[i];
  if (next.kind === 'NO_CANDIDATE' && next.index === i) {
    console.log(`U${i + 1} ${intent.speaker}  ${next.role}  wanted=${next.wanted || '—'}  parsed=${sets[i].length}  NO_CANDIDATE`);
    break;
  }
  if (turn) {
    console.log(
      `U${i + 1} ${intent.speaker}  ${turn.role}  ${turn.outcome}  bits=${turn.bits || '—'}  rem=${turn.remaining ?? '—'}  C6=${turn.c6}  exam=${turn.examined}`,
    );
    history.push({ speaker: intent.speaker, utterance: turn.utterance });
  }
}

const encoded = encodeFromSets(sets);
const t = tally(encoded.turns);
const recovered = encoded.kind === 'UUID' ? encoded.snaps[encoded.snaps.length - 1].argument : null;
const match = recovered === PAYLOAD && bitsToUuid(recovered ?? '') === UUID;
const result = encoded.kind === 'UUID' && match ? 'UUID' : encoded.kind;

console.log(`\nresult                 ${result}`);
console.log(`payload bits           ${PAYLOAD.length}`);
console.log(`required codewords     ${symbolCount(PAYLOAD)}`);
console.log(`total turns            ${t.body}`);
console.log(`owner / peer           ${t.owner} / ${t.peer}`);
console.log(`owner DATA opportunities  ${t.dataOpportunities}`);
console.log(`owner DATA successes   ${t.dataSuccesses}`);
console.log(`owner SKIP             ${t.ownerSkip}`);
console.log(`CHAT                   ${t.chat}`);
console.log(`NO_CANDIDATE           ${encoded.kind === 'NO_CANDIDATE' ? `U${encoded.index + 1} ${encoded.role}` : 'no'}`);
console.log(`candidates/DATA hit    max=${t.maxExamined}  mean=${t.meanExamined.toFixed(2)}`);
console.log(`conversation length    ${t.body}`);
console.log(`peer turns with digits ${t.peerDigits}`);
console.log(`unused intents         ${INTENTS.length - sets.length}`);
if (encoded.kind === 'UUID') {
  console.log(`recovered              ${recovered}`);
  console.log(`final UUID match       ${match}`);
} else if (encoded.kind === 'INCOMPLETE') {
  console.log(`have                   ${encoded.have}/${PAYLOAD.length}`);
  console.log(`final UUID match       no`);
} else {
  console.log(`final UUID match       no`);
}

if (process.env.EVAL_UUID_WRITE_FROZEN === '1') {
  const path = resolve(process.cwd(), 'v4/eval-uuid.frozen.ts');
  writeFileSync(
    path,
    `/**
 * Frozen spec UUID evaluation. One run. Do not regenerate.
 */
export const FROZEN = ${JSON.stringify(
      {
        uuid: UUID,
        payload: PAYLOAD,
        result,
        match,
        tally: t,
        unused: INTENTS.length - sets.length,
        have: encoded.kind === 'INCOMPLETE' ? encoded.have : encoded.kind === 'UUID' ? 128 : null,
        miss:
          encoded.kind === 'NO_CANDIDATE'
            ? { index: encoded.index, role: encoded.role, wanted: encoded.wanted }
            : null,
        turns: encoded.turns.map((x) => ({
          speaker: x.speaker,
          intent: x.intent,
          role: x.role,
          outcome: x.outcome,
          bits: x.bits,
          remaining: x.remaining,
          utterance: x.utterance,
          c6: x.c6,
          examined: x.examined,
          legal: x.legal,
          searched: x.searched,
        })),
        candidates: sets,
      },
      null,
      2,
    )} as const;
`,
  );
  console.log(`wrote ${path}`);
}

console.log(`\nEval-UUID-LM: ${result}`);
