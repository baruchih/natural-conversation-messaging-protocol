/**
 * V3-W5 live: conversation preference and paired U vs U'.
 *   npm run test:v3-w5-lm
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';
import type { WirePair } from '../v1-v2/p7w1.ts';
import { buildCorpus } from './w5.ts';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const apiKey = (process.env.OPENAI_API_KEY ?? '').trim();
const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

if (!apiKey) {
  console.error('OPENAI_API_KEY is empty. Put it in .env and re-run npm run test:v3-w5-lm');
  process.exit(2);
}

function strip(text: string): string {
  return text.trim().replace(/^["'`]+|["'`]+$/g, '').split('\n')[0]?.trim() ?? '';
}

async function ask(system: string, user: string): Promise<'a' | 'b' | null> {
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
        { role: 'system', content: system },
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
  const ans = strip(data.choices?.[0]?.message?.content ?? '').toLowerCase();
  if (ans.startsWith('a')) return 'a';
  if (ans.startsWith('b')) return 'b';
  return null;
}

async function run(name: string, pairs: WirePair[], prompt: (p: WirePair) => { system: string; user: string }): Promise<void> {
  console.log(`\n${name}`);
  let correct = 0;
  let answered = 0;
  for (const pair of pairs) {
    const { system, user } = prompt(pair);
    const pick = await ask(system, user);
    const ordinaryOn = pair.p7On === 'a' ? 'b' : 'a';
    const ok = pick === ordinaryOn;
    if (pick) {
      answered += 1;
      if (ok) correct += 1;
    }
    console.log(`  ${pair.id}  judge=${pick ?? '—'}  ordinary=${ordinaryOn}  ${ok ? 'HIT' : 'MISS'}`);
  }
  console.log(`  forced-choice ${correct}/${answered} = ${(answered ? correct / answered : 0).toFixed(2)}  (chance 0.50)`);
}

const take = Number(process.env.W5_LM_PAIRS ?? 16);
const corpus = buildCorpus();

console.log(`V3-W5-LM  model=${model}  pairs=${take}`);
console.log('Judge is not given NCMP, δ, or labels.');

await run('A vs M  full conversation', corpus.pairs.slice(0, take), (pair) => ({
  system: 'You compare two short English conversations. Each is three turns. Reply with the single letter A or B. No explanation.',
  user: `Which conversation sounds more like ordinary casual conversation about a meal?

A.
${pair.a}

B.
${pair.b}

Reply A or B.`,
}));

await run('U vs U\'  closing sentence only', corpus.closePairs.slice(0, take), (pair) => ({
  system: 'You compare two English sentences. Reply with the single letter A or B. No explanation.',
  user: `Which sentence sounds more like something a person would naturally say next in a casual conversation?

A. ${pair.a}
B. ${pair.b}

Reply A or B.`,
}));

console.log('\nV3-W5-LM: judge saw surface text only');
