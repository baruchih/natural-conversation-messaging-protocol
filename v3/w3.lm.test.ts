/**
 * V3-W3 live: same W1 judge on B, C, D and D-by-language.
 *   npm run test:v3-w3-lm
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';
import type { WirePair } from '../v1-v2/p7w1.ts';
import {
  buildEvolvedCorpus,
  buildHarvestCorpus,
  buildStaticCorpus,
  harvestLanguages,
  l4Closure,
} from './w3.ts';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const apiKey = (process.env.OPENAI_API_KEY ?? '').trim();
const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

if (!apiKey) {
  console.error('OPENAI_API_KEY is empty. Put it in .env and re-run npm run test:v3-w3-lm');
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

const take = Number(process.env.W3_LM_PAIRS ?? 16);
const takeLong = Number(process.env.W3_LM_LONG ?? 8);
const snaps = harvestLanguages();
const L10 = snaps[snaps.length - 1].language;
const ab = buildStaticCorpus();
const ac = buildEvolvedCorpus(l4Closure());
const ad = buildHarvestCorpus(L10);

console.log(`V3-W3-LM  model=${model}  pairs=${take}  long=${takeLong}`);
console.log('Judge is not given NCMP, δ, grammar, or labels.');
console.log(`L10 = { ${L10.customer.join(', ')} }`);

await runContrast('A vs B  static P7', ab.pairs.slice(0, take));
await runContrast('A vs C  L4 evolved', ac.pairs.slice(0, take));
await runContrast('A vs D  H2 L10', ad.pairs.slice(0, take));

console.log('\nD by language');
for (const snap of snaps) {
  const corpus = buildHarvestCorpus(snap.language, 20260831 + snap.n);
  await runContrast(`L${snap.n}  { ${snap.language.customer.join(', ')} }`, corpus.pairs.slice(0, takeLong));
}

console.log('\nV3-W3-LM: judge saw surface text only');
