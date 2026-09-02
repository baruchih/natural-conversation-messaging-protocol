/**
 * C2-A one run. Generate, then score. Do not regenerate after a miss.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { openaiKey, openaiModel } from '../v3/m1.lm.ts';
import { intentPrompt } from './f4.ts';
import {
  A_INTENT,
  B_INTENT,
  CONTROL_SEED,
  K,
  LAST,
  kSession,
  scoreSet,
  tAck,
  tProbe,
  takeK,
} from './c2a.ts';

async function complete(user: string): Promise<string> {
  const apiKey = openaiKey();
  if (!apiKey) throw new Error('OPENAI_API_KEY is empty');
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
            'You continue a casual conversation. One conversational turn per line. A turn may be more than one sentence. No explanation. No numbering. No quotation marks.',
        },
        { role: 'user', content: user },
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

const historyA = [{ speaker: 'B', utterance: LAST }];
const promptA = intentPrompt(historyA, 'A', A_INTENT, K);
const rawA = await complete(promptA);
const setA = takeK(rawA);
const targetA = tProbe();
const scoreA = scoreSet(setA, targetA);

const report: Record<string, unknown> = {
  model: openaiModel(),
  k: K,
  seed: `0x${CONTROL_SEED.toString(16)}`,
  t_probe: `0x${targetA.toString(16)}`,
  a: {
    last: LAST,
    intent: A_INTENT,
    considered: scoreA.considered,
    legal: scoreA.legal,
    hits: scoreA.hits,
    hit: scoreA.hit,
    candidates: scoreA.values,
  },
  b: null,
  k_session: null,
  result: 'NO',
};

if (scoreA.hit) {
  const uProbe = scoreA.hit;
  const targetB = tAck(uProbe);
  const historyB = [
    { speaker: 'B', utterance: LAST },
    { speaker: 'A', utterance: uProbe },
  ];
  const rawB = await complete(intentPrompt(historyB, 'B', B_INTENT, K));
  const setB = takeK(rawB);
  const scoreB = scoreSet(setB, targetB);
  report.b = {
    last: uProbe,
    intent: B_INTENT,
    t_ack: `0x${targetB.toString(16)}`,
    considered: scoreB.considered,
    legal: scoreB.legal,
    hits: scoreB.hits,
    hit: scoreB.hit,
    candidates: scoreB.values,
  };
  if (scoreB.hit) {
    report.k_session = `0x${kSession(uProbe, scoreB.hit).toString(16)}`;
    report.result = 'YES';
  }
}

writeFileSync(resolve(import.meta.dirname, 'c2a.frozen.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ result: report.result, a_hits: scoreA.hits, a_legal: scoreA.legal, a_n: scoreA.considered }, null, 2));
