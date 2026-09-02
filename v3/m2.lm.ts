/**
 * V3-M2 live generation. No residue. No NCMP. No hit/miss feedback.
 */
import { openaiKey, openaiModel } from './m1.lm.ts';
import { BATCH, intentPrompt, paraphrasePrompt, type Prefix } from './m2.ts';

async function complete(user: string, system: string): Promise<string> {
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
  return data.choices?.[0]?.message?.content ?? '';
}

export async function proposeEquivalenceSet(prefix: Prefix, seed: string, k = BATCH): Promise<string> {
  return complete(paraphrasePrompt(prefix, seed, k), 'You rewrite casual spoken English. One sentence per line. No explanation.');
}

export async function proposeIntentSet(prefix: Prefix, k = BATCH): Promise<string> {
  return complete(
    intentPrompt(prefix, k),
    'You continue a casual conversation. One conversational turn per line. A turn may be more than one sentence. No explanation.',
  );
}
