/**
 * V4-UUID live Profile 0 conversation. k = 50. No second call after a miss.
 *   npm run test:v4-uuid-lm
 *   UUID_WRITE_FROZEN=1 npm run test:v4-uuid-lm
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
  intentPrompt,
  parseCandidates,
  promptIsBlind,
  symbolCount,
  tally,
} from './uuid.ts';

if (!openaiKey()) {
  console.error('OPENAI_API_KEY is empty. Put it in .env and re-run npm run test:v4-uuid-lm');
  process.exit(2);
}

console.log(`V4-UUID-LM  model=${openaiModel()}  k=${BATCH}  bits=${PAYLOAD.length}  symbols=${symbolCount(PAYLOAD)}`);
console.log(`uuid ${UUID}`);
console.log('Generator is not given V, mode, bits, or hit/miss.\n');

const sets: string[][] = [];
const history: { speaker: string; utterance: string }[] = [];

for (let i = 0; i < INTENTS.length; i++) {
  const soFar = encodeFromSets(sets);
  if (soFar.kind === 'UUID') break;
  if (soFar.kind === 'NO_CANDIDATE' && soFar.index === i - 1) break;
  const intent = INTENTS[i];
  if (!promptIsBlind(history, intent.speaker, intent.text)) {
    throw new Error(`prompt leaked on intent ${i + 1}`);
  }
  const raw = await proposeIntentSet(history, intent.speaker, intent.text);
  const candidates = parseCandidates(raw);
  sets.push(candidates);
  const next = encodeFromSets(sets);
  const turn = next.turns[i];
  if (next.kind === 'NO_CANDIDATE' && next.index === i) {
    console.log(`U${i + 1} ${intent.speaker}  wanted=${next.wanted || '—'}  parsed=${candidates.length}  NO_CANDIDATE`);
    break;
  }
  if (turn) {
    console.log(
      `U${i + 1} ${intent.speaker}  ${turn.outcome}  bits=${turn.bits || '—'}  rem=${turn.remaining ?? '—'}  C6=${turn.c6}  exam=${turn.examined}`,
    );
    history.push({ speaker: intent.speaker, utterance: turn.utterance });
  }
}

const encoded = encodeFromSets(sets);
const t = tally(encoded.turns);
const recovered = encoded.kind === 'UUID' ? encoded.snaps[encoded.snaps.length - 1].argument : null;
const match = recovered === PAYLOAD && bitsToUuid(recovered ?? '') === UUID;
const result = encoded.kind === 'UUID' && match ? 'UUID' : encoded.kind;

console.log(`\nresult            ${result}`);
console.log(`payload bits      ${PAYLOAD.length}`);
console.log(`body turns        ${t.body}`);
console.log(`owner / peer      ${t.owner} / ${t.peer}`);
console.log(`owner DATA/SKIP   ${t.ownerData} / ${t.ownerSkip}`);
console.log(`CHAT              ${t.chat}`);
console.log(`searches          ${t.searches}`);
console.log(`max examined      ${t.maxExamined}`);
console.log(`mean examined     ${t.meanExamined.toFixed(2)}`);
console.log(`unused intents    ${INTENTS.length - sets.length}`);
if (encoded.kind === 'UUID') {
  console.log(`recovered         ${recovered}`);
  console.log(`uuid match        ${match}`);
} else if (encoded.kind === 'INCOMPLETE') {
  console.log(`have              ${encoded.have}/${PAYLOAD.length}`);
}

if (process.env.UUID_WRITE_FROZEN === '1') {
  const path = resolve(process.cwd(), 'v4/uuid.frozen.ts');
  writeFileSync(
    path,
    `/**
 * Frozen V4 UUID transcript. One run. Do not regenerate.
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
        turns: encoded.turns.map((x) => ({
          speaker: x.speaker,
          intent: x.intent,
          outcome: x.outcome,
          bits: x.bits,
          remaining: x.remaining,
          utterance: x.utterance,
          c6: x.c6,
          examined: x.examined,
          legal: x.legal,
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

console.log(`\nUUID-LM: ${result}`);
console.log(intentPrompt([], INTENTS[0].speaker, INTENTS[0].text).split('\n').slice(0, 8).join('\n'));
