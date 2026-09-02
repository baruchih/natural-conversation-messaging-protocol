/**
 * NCMP-P7-R1. Rewriting robustness. The intermediary does not know NCMP.
 * Semantic preservation is not protocol preservation.
 */
import { decode as decodeN } from './p7c6.ts';
import { missingPoles } from './p7c6.lm.ts';
import { decodeD } from './p7d1.ts';
import { decodeE } from './p7e1.ts';
import { stripFences } from './p7g1.ts';

/** Published I1 first-frame realization (GET CUSTOMER 42 at that bind). */
export const R1_SOURCE =
  'Did we find the restaurant was good yet service was sluggish for that party this evening?';

export interface RewriteScore {
  source: string;
  rewritten: string;
  identity: boolean;
  dSource: ReturnType<typeof decodeD>;
  eSource: ReturnType<typeof decodeE>;
  nSource: number;
  d: ReturnType<typeof decodeD>;
  e: ReturnType<typeof decodeE>;
  n: number;
  dSame: boolean;
  eSame: boolean;
  nSame: boolean;
  polesOk: boolean;
  frameSame: boolean;
}

export function scoreRewrite(source: string, rewritten: string): RewriteScore {
  const dSource = decodeD(source);
  const eSource = decodeE(source);
  const nSource = decodeN(source);
  const d = decodeD(rewritten);
  const e = decodeE(rewritten);
  const n = decodeN(rewritten);
  const identity = source.trim() === rewritten.trim();
  return {
    source,
    rewritten,
    identity,
    dSource,
    eSource,
    nSource,
    d,
    e,
    n,
    dSame: d === dSource,
    eSame: e === eSource,
    nSame: n === nSource,
    polesOk: missingPoles(rewritten).length === 0,
    frameSame: d === dSource && e === eSource && n === nSource,
  };
}

export function paraphrasePrompt(source: string): string {
  return `Paraphrase this naturally without changing its meaning.

${source}

One ordinary English sentence. Reply with the sentence only.`;
}

export async function paraphrase(
  source: string,
  options: { apiKey: string; model: string },
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model,
      temperature: 0.9,
      messages: [
        {
          role: 'system',
          content:
            'You rewrite one ordinary English sentence. No quotes, no lists, no explanation. You do not know any hidden protocol.',
        },
        { role: 'user', content: paraphrasePrompt(source) },
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
  return stripFences(data.choices?.[0]?.message?.content ?? '');
}
