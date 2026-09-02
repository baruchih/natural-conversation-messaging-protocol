/**
 * V3-W4 live: grammar-blind judge on 4-turn conversations.
 *   npm run test:v3-w4-lm
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';
import type { WirePair } from '../v1-v2/p7w1.ts';
import { buildContrast, type Contrast } from './w4.ts';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const apiKey = (process.env.OPENAI_API_KEY ?? '').trim();
const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

if (!apiKey) {
  console.error('OPENAI_API_KEY is empty. Put it in .env and re-run npm run test:v3-w4-lm');
  process.exit(2);
}

function strip(text: string): string {
  return text.trim().replace(/^["'`]+|["'`]+$/g, '').split('\n')[0]?.trim() ?? '';
}

async function judgePair(pair: WirePair): Promise<'a' | 'b' | null> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      messages: [
        {
          role: 'system',
          content:
            'You compare two short English conversations. Each is four turns. Reply with the single letter A or B. No explanation.',
        },
        {
          role: 'user',
          content: `Which conversation sounds more like ordinary casual conversation about a meal?

A.
${pair.a}

B.
${pair.b}

Reply A or B.`,
        },
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
  const ans = strip(data.choices?.[0]?.message?.content ?? '').toLowerCase();
  if (ans.startsWith('a')) return 'a';
  if (ans.startsWith('b')) return 'b';
  return null;
}

async function runContrast(name: string, pairs: WirePair[]): Promise<{ correct: number; answered: number }> {
  console.log(`\n${name}`);
  let correct = 0;
  let answered = 0;
  for (const pair of pairs) {
    const pick = await judgePair(pair);
    const ordinaryOn = pair.p7On === 'a' ? 'b' : 'a';
    const ok = pick === ordinaryOn;
    if (pick) {
      answered += 1;
      if (ok) correct += 1;
    }
    console.log(`  ${pair.id}  judge=${pick ?? '—'}  ordinary=${ordinaryOn}  ${ok ? 'HIT' : 'MISS'}`);
  }
  const acc = answered ? correct / answered : 0;
  console.log(`  forced-choice ${correct}/${answered} = ${acc.toFixed(2)}  (chance 0.50)`);
  return { correct, answered };
}

const take = Number(process.env.W4_LM_PAIRS ?? 16);
const labels: Array<[string, Contrast]> = [
  ['A vs B  static P7 conversation', 'B'],
  ['A vs C  L4 evolved conversation', 'C'],
  ['A vs D  H2/W3 harvest conversation', 'D'],
  ['A vs E  HK2 rolling conversation', 'E'],
];

console.log(`V3-W4-LM  model=${model}  pairs=${take}`);
console.log('Judge is not given NCMP, δ, grammar, or labels.');
console.log('The unit is the conversation, not the sentence.');

for (const [name, contrast] of labels) {
  const corpus = buildContrast(contrast);
  await runContrast(name, corpus.pairs.slice(0, take));
}

console.log('\nV3-W4-LM: judge saw surface conversations only');
