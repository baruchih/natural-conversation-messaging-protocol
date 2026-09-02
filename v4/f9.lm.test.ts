/**
 * V4-F9 live joint sequence. One 50-set per body turn.
 * No residue in the prompt. No second call after a miss.
 *   npm run test:v4-f9-lm
 *   F9_WRITE_FROZEN=1 npm run test:v4-f9-lm
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { openaiKey, openaiModel, proposeIntentSet } from './f4.lm.ts';
import {
  BATCH,
  EXPECTED_BITS,
  INTENTS,
  MAP,
  TARGETS,
  carrier,
  encodeFromSets,
  intentPrompt,
  interpret,
  parseCandidates,
  promptIsBlind,
  selectJoint,
} from './f9.ts';

if (!openaiKey()) {
  console.error('OPENAI_API_KEY is empty. Put it in .env and re-run npm run test:v4-f9-lm');
  process.exit(2);
}

console.log(`V4-F9-LM  model=${openaiModel()}  k=${BATCH}  map=half3`);
console.log('Generator is not given V, mode, bits, or hit/miss.\n');

const sets: string[][] = [];
const history: { speaker: string; utterance: string }[] = [];
let miss: { index: number; mode: string; bits: string; next: string; legal: number } | null = null;

for (let i = 0; i < INTENTS.length; i++) {
  const intent = INTENTS[i];
  const want = TARGETS[i];
  if (!promptIsBlind(history, intent.speaker, intent.text)) {
    throw new Error(`prompt leaked on intent ${i + 1}`);
  }
  const raw = await proposeIntentSet(history, intent.speaker, intent.text);
  const candidates = parseCandidates(raw);
  sets.push(candidates);
  const sel = selectJoint(candidates, want);
  console.log(
    `U${i + 1} ${intent.speaker}  mode=${want.mode}  bits=${want.bits || '—'}  next=${want.next}  parsed=${candidates.length}  legal=${sel.legal.length}  hit=${sel.chosen !== null}`,
  );
  if (sel.chosen === null) {
    miss = {
      index: i,
      mode: want.mode,
      bits: want.bits,
      next: want.next,
      legal: sel.legal.length,
    };
    console.log('NO_CANDIDATE  (do not enlarge k, mutate, or regenerate)');
    break;
  }
  const v = carrier(sel.chosen);
  const got = MAP(v);
  console.log(`  U*  C6=${v}  ${got.bits}+${got.next[0]}  ${sel.chosen}`);
  history.push({ speaker: intent.speaker, utterance: sel.chosen });
}

const encoded = encodeFromSets(sets);
const result = encoded.kind === 'ENCODED' ? 'JOINT' : 'NO_CANDIDATE';
if (encoded.kind === 'ENCODED') {
  const read = interpret(encoded.body);
  console.log(`\nreplay ${result}  bits=${read.bits}  expected=${EXPECTED_BITS}`);
  console.log(`schedule ${read.steps.map((s) => s.mode[0]).join(' ')}`);
} else {
  console.log(`\nreplay ${result}  at U${encoded.index + 1}`);
}

if (process.env.F9_WRITE_FROZEN === '1') {
  const turns = history.map((t, i) => ({
    speaker: t.speaker,
    intent: INTENTS[i].text,
    mode: TARGETS[i].mode,
    bits: TARGETS[i].bits,
    next: TARGETS[i].next,
    utterance: t.utterance,
    c6: carrier(t.utterance),
  }));
  const path = resolve(process.cwd(), 'v4/f9.frozen.ts');
  writeFileSync(
    path,
    `/**
 * Frozen F9 joint transcript. One run. Do not regenerate.
 */
export const FROZEN = ${JSON.stringify(
      {
        map: 'half3',
        bits: EXPECTED_BITS,
        result,
        miss,
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

console.log(`\nF9-LM: ${result}`);
console.log('Prompt shape:\n');
console.log(intentPrompt([], INTENTS[0].speaker, INTENTS[0].text).split('\n').slice(0, 8).join('\n'));
