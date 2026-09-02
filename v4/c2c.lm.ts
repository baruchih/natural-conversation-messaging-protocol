/**
 * C2-C one run. Generate, then score. Do not regenerate after a miss.
 */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { openaiKey, openaiModel } from '../v3/m1.lm.ts';
import { isLexicalAck as isAck, isLexicalFinish as isFinish, isLexicalProbe as lexicalProbe, isLexicalStart as isStart } from '../ncmp/reference/ncmp.ts';
import { parseCandidates } from '../v3/m2.ts';
import { intentPrompt } from './f4.ts';
import {
  A_INTENT,
  BOOTSTRAP_HINT,
  CONTROL_SEED,
  K,
  LAST,
  hasHint,
  isProbeC2C,
  pSec,
  tSec,
} from './c2c.ts';

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

function legal(u: string): boolean {
  if (/\d{3,}/.test(u)) return false;
  if (lexicalProbe(u) || isAck(u) || isStart(u) || isFinish(u)) return false;
  return hasHint(u);
}

const history = [{ speaker: 'B', utterance: LAST }];
const raw = await complete(intentPrompt(history, 'A', A_INTENT, K));
const considered = parseCandidates(raw).slice(0, K);
const legalSet = considered.filter(legal);
const hits = legalSet.filter((u) => isProbeC2C(u));
const target = tSec();

const report = {
  model: openaiModel(),
  k: K,
  hint: BOOTSTRAP_HINT,
  seed: `0x${CONTROL_SEED.toString(16)}`,
  t_sec: `0x${target.toString(16)}`,
  considered: considered.length,
  with_hint: considered.filter((u) => hasHint(u)).length,
  legal: legalSet.length,
  hits: hits.length,
  hit: hits[0] ?? null,
  candidates: considered.map((u) => ({
    u,
    hint: hasHint(u),
    legal: legal(u),
    p_sec: pSec(u),
    hit: legal(u) && isProbeC2C(u),
  })),
};

writeFileSync(resolve(import.meta.dirname, 'c2c.frozen.json'), JSON.stringify(report, null, 2) + '\n');
console.log(
  JSON.stringify(
    {
      considered: report.considered,
      with_hint: report.with_hint,
      legal: report.legal,
      hits: report.hits,
      hit: report.hit,
    },
    null,
    2,
  ),
);
