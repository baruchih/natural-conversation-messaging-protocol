/**
 * V4-F5 live reliability. Declared contexts and payloads.
 * No residue in the prompt. No second call after a miss.
 *   npm run test:v4-f5-lm
 *   F5_WRITE_FROZEN=1 npm run test:v4-f5-lm
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { proposeIntentSet, openaiKey, openaiModel } from './f4.lm.ts';
import { parseCandidates } from './f4.ts';
import {
  BATCH,
  CONTEXTS,
  FRAME_PAYLOADS,
  PAYLOADS,
  SCRIPTS,
  bitsCarried,
  encodeScript,
  intentPrompt,
  promptIsBlind,
  scoreOpportunity,
} from './f5.ts';

if (!openaiKey()) {
  console.error('OPENAI_API_KEY is empty. Put it in .env and re-run npm run test:v4-f5-lm');
  process.exit(2);
}

console.log(`V4-F5-LM  model=${openaiModel()}  k=${BATCH}`);
console.log('Declared before generation. No r, π, residue, or hit/miss in the prompt.\n');

const opportunityCandidates: string[][] = [];
const opportunities = [];

for (const context of CONTEXTS) {
  if (!promptIsBlind(context.history, context.speaker, context.intent)) {
    throw new Error(`prompt leaked on ${context.id}`);
  }
  const raw = await proposeIntentSet(context.history, context.speaker, context.intent);
  const candidates = parseCandidates(raw);
  opportunityCandidates.push(candidates);
  for (const payload of PAYLOADS) {
    const scored = scoreOpportunity(context, payload, candidates);
    opportunities.push({
      id: context.id,
      payload,
      r: scored.r,
      wanted: scored.wanted,
      hit: scored.hit,
      examined: scored.examined,
      legal: scored.legal,
      chosen: scored.chosen,
      c6: scored.c6,
    });
    console.log(
      `${context.id} r=${scored.r} ${payload} wanted=${scored.wanted} legal=${scored.legal} hit=${scored.hit}${scored.chosen ? ` examined=${scored.examined}` : ''}`,
    );
  }
}

const frameCandidates: string[][][] = [];
const frames = [];

for (const script of SCRIPTS) {
  for (const payload of FRAME_PAYLOADS) {
    const sets: string[][] = [];
    const history: { speaker: string; utterance: string }[] = [];
    let remaining = payload;
    let miss = false;
    for (let i = 0; i < script.intents.length; i++) {
      if (remaining.length === 0) break;
      const intent = script.intents[i];
      if (!promptIsBlind(history, intent.speaker, intent.text)) {
        throw new Error(`prompt leaked on ${script.id} ${i + 1}`);
      }
      const raw = await proposeIntentSet(history, intent.speaker, intent.text);
      const candidates = parseCandidates(raw);
      sets.push(candidates);
      const encoded = encodeScript(payload, script.intents, sets);
      if (encoded.kind === 'NO_CANDIDATE' && encoded.turns.length === sets.length - 1) {
        miss = true;
        console.log(`${script.id} ${payload} NO_CANDIDATE at turn ${i + 1} r=${encoded.r} wanted=${encoded.wanted}`);
        break;
      }
      const turn = encoded.turns[encoded.turns.length - 1];
      history.push({ speaker: intent.speaker, utterance: turn.utterance });
      remaining = remaining.slice(turn.r);
      console.log(`${script.id} ${payload} turn ${i + 1} r=${turn.r} C6=${turn.c6} ${turn.pi}`);
    }
    const encoded = encodeScript(payload, script.intents, sets);
    frameCandidates.push(sets);
    frames.push({
      script: script.id,
      payload,
      result: encoded.kind === 'ENCODED' ? 'ARGUMENT' : 'NO_CANDIDATE',
      bits: bitsCarried(encoded),
      turns: encoded.turns.map((t) => ({
        r: t.r,
        wanted: t.wanted,
        utterance: t.utterance,
        c6: t.c6,
        pi: t.pi,
      })),
    });
    console.log(`${script.id} ${payload} → ${encoded.kind} bits=${bitsCarried(encoded)}${miss ? ' (miss)' : ''}`);
  }
}

if (process.env.F5_WRITE_FROZEN === '1') {
  const path = resolve(process.cwd(), 'v4/f5.frozen.ts');
  writeFileSync(
    path,
    `/**
 * Frozen F5 reliability transcript. One run. Do not regenerate.
 */
export const FROZEN = ${JSON.stringify({ opportunities, opportunityCandidates, frames, frameCandidates }, null, 2)} as const;
`,
  );
  console.log(`\nwrote ${path}`);
}

console.log('\nF5-LM done. Measure with npm run test:v4-f5');
console.log(intentPrompt(CONTEXTS[0].history, CONTEXTS[0].speaker, CONTEXTS[0].intent).split('\n').slice(0, 6).join('\n'));
