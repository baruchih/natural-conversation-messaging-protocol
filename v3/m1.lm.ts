/**
 * V3-M1 live proposer. No residue. No NCMP. One next sentence.
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { proposerPrompt, type Prefix } from './m1.ts';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

export function openaiKey(): string {
  return (process.env.OPENAI_API_KEY ?? '').trim();
}

export function openaiModel(): string {
  return process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
}

function strip(text: string): string {
  return text.trim().replace(/^["'`]+|["'`]+$/g, '').split('\n')[0]?.trim() ?? '';
}

export async function proposeNext(prefix: Prefix): Promise<string> {
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
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content: 'You write one casual spoken English sentence. No lists. No explanation.',
        },
        { role: 'user', content: proposerPrompt(prefix) },
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
  return strip(data.choices?.[0]?.message?.content ?? '');
}
