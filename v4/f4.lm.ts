/**
 * V4-F4 live intent sets. No residue. No NCMP. No hit/miss feedback.
 * One call per body turn. Do not regenerate after a miss.
 */
import { openaiKey, openaiModel } from '../v3/m1.lm.ts';
import { BATCH, intentPrompt } from './f4.ts';

export { openaiKey, openaiModel };

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
            'You continue a casual conversation. One conversational turn per line. A turn may be more than one sentence. No explanation.',
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

export async function proposeIntentSet(
  history: readonly { speaker: string; utterance: string }[],
  speaker: string,
  intent: string,
  k = BATCH,
): Promise<string> {
  return complete(intentPrompt(history, speaker, intent, k));
}
