/**
 * P7-W1 live: LLM judge with no P7 grammar.
 *   npm run test:w1-lm
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { buildCorpus, type WirePair } from './p7w1.ts';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const apiKey = (process.env.OPENAI_API_KEY ?? '').trim();
const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

if (!apiKey) {
  console.error('OPENAI_API_KEY is empty. Put it in .env and re-run npm run test:w1-lm');
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
            'You compare two English sentences. Reply with the single letter A or B. No explanation.',
        },
        {
          role: 'user',
          content: `Which sentence sounds more like ordinary casual conversation about a meal?

A. ${pair.a}
B. ${pair.b}

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

const corpus = buildCorpus();
const take = Number(process.env.W1_LM_PAIRS ?? 16);
const pairs = corpus.pairs.slice(0, take);

console.log(`P7-W1-LM  model=${model}  pairs=${pairs.length}`);
console.log('Judge is not given NCMP, δ, grammar, or labels.\n');

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
  console.log(
    `  ${pair.id}  judge=${pick ?? '—'}  ordinary=${ordinaryOn}  ${ok ? 'HIT' : 'MISS'}`,
  );
  console.log(`    A  ${pair.a}`);
  console.log(`    B  ${pair.b}`);
}

const acc = answered ? correct / answered : 0;
console.log(`\nforced-choice accuracy ${correct}/${answered} = ${acc.toFixed(2)}  (chance 0.50)`);
console.log('P7-W1-LM: judge saw surface text only');
