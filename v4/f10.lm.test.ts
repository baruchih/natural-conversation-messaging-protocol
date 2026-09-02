/**
 * V4-F10 live sparse argument. One 50-set per body turn.
 * No residue in the prompt. No second call after a miss.
 *   npm run test:v4-f10-lm
 *   F10_WRITE_FROZEN=1 npm run test:v4-f10-lm
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseCandidates } from './f4.ts';
import { openaiKey, openaiModel, proposeIntentSet } from './f4.lm.ts';
import {
  ARGUMENT_BITS_TEXT,
  BATCH,
  INTENTS,
  encodeFromSets,
  intentPrompt,
  interpret,
  promptIsBlind,
  reassemble,
  scheduleOf,
  START_8,
} from './f10.ts';

if (!openaiKey()) {
  console.error('OPENAI_API_KEY is empty. Put it in .env and re-run npm run test:v4-f10-lm');
  process.exit(2);
}

console.log(`V4-F10-LM  model=${openaiModel()}  k=${BATCH}  map=half3`);
console.log('Generator is not given V, mode, bits, or hit/miss.\n');

const sets: string[][] = [];
const history: { speaker: string; utterance: string }[] = [];

for (let i = 0; i < INTENTS.length; i++) {
  const soFar = encodeFromSets(ARGUMENT_BITS_TEXT, sets);
  if (soFar.kind === 'ENCODED') break;
  const intent = INTENTS[i];
  if (!promptIsBlind(history, intent.speaker, intent.text)) {
    throw new Error(`prompt leaked on intent ${i + 1}`);
  }
  const raw = await proposeIntentSet(history, intent.speaker, intent.text);
  const candidates = parseCandidates(raw);
  sets.push(candidates);
  const next = encodeFromSets(ARGUMENT_BITS_TEXT, sets);
  if (next.kind === 'NO_CANDIDATE' && next.index === i) {
    console.log(`U${i + 1} ${intent.speaker}  mode=${next.mode}  wanted=${next.wanted || '—'}  parsed=${candidates.length}  NO_CANDIDATE`);
    break;
  }
  if (next.kind === 'ENCODED' || next.kind === 'INCOMPLETE' || next.kind === 'NO_CANDIDATE') {
    const turn = next.turns[i];
    if (turn) {
      console.log(
        `U${i + 1} ${intent.speaker}  mode=${turn.mode}  bits=${turn.bits || '—'}  next=${turn.next}  C6=${turn.c6}  parsed=${candidates.length}`,
      );
      console.log(`  U*  ${turn.utterance}`);
      history.push({ speaker: intent.speaker, utterance: turn.utterance });
    }
  }
}

const encoded = encodeFromSets(ARGUMENT_BITS_TEXT, sets);
const done = encoded.kind === 'ENCODED' ? reassemble(START_8, encoded.body) : null;
const result =
  encoded.kind === 'ENCODED' && done?.kind === 'ARGUMENT' ? 'ARGUMENT' : encoded.kind === 'NO_CANDIDATE' ? 'NO_CANDIDATE' : 'INCOMPLETE';

if (encoded.kind === 'ENCODED') {
  const read = interpret(encoded.body);
  console.log(`\nreplay ${result}  bits=${read.bits}`);
  console.log(`schedule ${scheduleOf(read.steps)}  DATA=${read.steps.filter((s) => s.mode === 'DATA').length} body=${read.steps.length}`);
} else {
  console.log(`\nreplay ${result}`);
}

if (process.env.F10_WRITE_FROZEN === '1') {
  const turns = encoded.turns.map((t) => ({
    speaker: t.speaker,
    intent: t.intent,
    mode: t.mode,
    bits: t.bits,
    next: t.next,
    utterance: t.utterance,
    c6: t.c6,
  }));
  const path = resolve(process.cwd(), 'v4/f10.frozen.ts');
  writeFileSync(
    path,
    `/**
 * Frozen F10 sparse argument. One run. Do not regenerate.
 */
export const FROZEN = ${JSON.stringify(
      {
        start: START_8,
        argument: ARGUMENT_BITS_TEXT,
        result,
        turns,
        candidates: sets,
      },
      null,
      2,
    )} as const;
`,
  );
  console.log(`wrote ${path}`);
}

console.log(`\nF10-LM: ${result}`);
console.log('Prompt shape:\n');
console.log(intentPrompt([], INTENTS[0].speaker, INTENTS[0].text).split('\n').slice(0, 8).join('\n'));
