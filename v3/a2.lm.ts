/**
 * V3-A2 live B₂. One turn per call. No residue. No list. No intent.
 */
import { openaiKey, openaiModel } from './m1.lm.ts';
import { replyPrompt, type Prefix } from './a2.ts';

export async function replyAsB(prefix: Prefix, a2: string): Promise<string> {
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
          content: "You continue a casual conversation. Write only B's next turn. No lists. No explanation.",
        },
        { role: 'user', content: replyPrompt(prefix, a2) },
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
