/**
 * NCMP-P7-C6-LM guided search.
 * Same P, N, δ_N, 6 bits. The LM is a search operator, not a decoder.
 * Existence is already shown by F(P). This measures whether error
 * feedback from δ_N reduces modular distance while hard poles of P hold.
 */
import { decode, wellFormed, canonicalize, MODULUS } from './p7c6.ts';

/** Published poles for "The restaurant was good, but service was slow." */
export const RESTAURANT_P_POLES = {
  restaurant: ['restaurant', 'place', 'kitchen'],
  service: ['service', 'wait', 'staff'],
  good: ['good', 'decent', 'solid', 'fine'],
  slow: ['slow', 'sluggish', 'delayed'],
  contrast: ['but', 'though', 'although', 'yet'],
} as const;

export type PoleName = keyof typeof RESTAURANT_P_POLES;

export interface LmAttempt {
  utterance: string;
  residue: number | null;
  wellFormed: boolean;
  polesOk: boolean;
  missingPoles: PoleName[];
  distance: number | null;
  signedError: number | null;
}

export interface LmEncodeResult {
  accepted: string | null;
  target: number;
  proposition: string;
  attempts: LmAttempt[];
  hit: boolean;
  distances: Array<number | null>;
}

export function tokenList(utterance: string): string[] {
  return canonicalize(utterance)
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z]/g, ''))
    .filter(Boolean);
}

export function missingPoles(utterance: string): PoleName[] {
  const tokens = new Set(tokenList(utterance));
  const missing: PoleName[] = [];
  for (const [pole, words] of Object.entries(RESTAURANT_P_POLES) as [PoleName, readonly string[]][]) {
    if (!words.some((w) => tokens.has(w))) missing.push(pole);
  }
  return missing;
}

export function signedModularError(current: number, target: number, modulus = MODULUS): number {
  let d = ((target - current) % modulus + modulus) % modulus;
  if (d > modulus / 2) d -= modulus;
  return d;
}

export function modularDistance(current: number, target: number, modulus = MODULUS): number {
  const d = Math.abs(current - target) % modulus;
  return Math.min(d, modulus - d);
}

function stripFences(text: string): string {
  return text
    .trim()
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/^[-*]\s+/, '')
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0) ?? '';
}

function buildPrompt(
  proposition: string,
  target: number,
  prior: LmAttempt | null,
  lastValid: LmAttempt | null
): string {
  const poles = `Hard poles of P — every candidate MUST keep all of these (published F(P) words only):
- restaurant concept: restaurant | place | kitchen
- service concept: service | wait | staff
- good polarity: good | decent | solid | fine
- slow polarity: slow | sluggish | delayed
- contrast: but | though | although | yet
Do not substitute food, meal, cafe, diner, tasty, delicious, excellent, lengthy, long.`;

  if (prior === null) {
    return `Preserve this proposition exactly:

${proposition}

${poles}

Write ONE natural conversational paraphrase.
- one sentence, at least six words, ending with . ! or ?
- no digits
- do not mention codes, hashes, moduli, or the number ${target}
- letters a=1 … z=26; their sum modulo 64 MUST equal ${target}

Reply with the sentence only.`;
  }

  if (!prior.wellFormed || !prior.polesOk) {
    const why = !prior.wellFormed
      ? 'not a single well-formed sentence'
      : `missing poles: ${prior.missingPoles.join(', ')}`;
    const base = lastValid
      ? `Rewrite this last valid sentence (do not abandon it):\n${lastValid.utterance}`
      : `Start again from the source proposition.`;
    return `${base}

The previous candidate was rejected (${why}):
${prior.utterance}

${poles}

Keep P fixed. Reply with one sentence only.`;
  }

  const err = prior.signedError ?? 0;
  const dir =
    err === 0
      ? 'the residue is already the target'
      : err > 0
        ? `increase the letter-sum by ${err} (mod 64)`
        : `decrease the letter-sum by ${-err} (mod 64)`;

  return `Minimally rewrite this sentence. Do not change the proposition.

${prior.utterance}

δ_N measured ${prior.residue}. Target is ${target}.
Modular distance ${prior.distance}. Signed error ${err}.
You must ${dir} by a small wording change (synonym, hedge, or optional glaze).
Do not start a new sentence from scratch if a one-word swap can work.

${poles}

- no digits
- do not mention the number ${target} or the modulus
- letters a=1 … z=26; sum modulo 64 MUST equal ${target}

Reply with the sentence only.`;
}

export async function proposeUtterance(
  proposition: string,
  target: number,
  prior: LmAttempt | null,
  lastValid: LmAttempt | null,
  options: { apiKey: string; model: string }
): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${options.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: options.model,
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content:
            'You write one ordinary English sentence. No quotes, no lists, no explanation. You adjust wording to change a letter-sum, never the meaning.',
        },
        {
          role: 'user',
          content: buildPrompt(proposition, target, prior, lastValid),
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
  return stripFences(data.choices?.[0]?.message?.content ?? '');
}

function scoreAttempt(utterance: string, target: number): LmAttempt {
  const formOk = wellFormed(utterance);
  const missing = missingPoles(utterance);
  const polesOk = missing.length === 0;
  const usable = formOk && polesOk;
  const residue = usable ? decode(utterance) : null;
  return {
    utterance,
    residue,
    wellFormed: formOk,
    polesOk,
    missingPoles: missing,
    distance: residue === null ? null : modularDistance(residue, target),
    signedError: residue === null ? null : signedModularError(residue, target),
  };
}

export async function encodeWithLlm(
  proposition: string,
  target: number,
  options: {
    apiKey: string;
    model?: string;
    maxAttempts?: number;
  }
): Promise<LmEncodeResult> {
  const model = options.model ?? 'gpt-4o-mini';
  const maxAttempts = options.maxAttempts ?? 8;
  const attempts: LmAttempt[] = [];
  let prior: LmAttempt | null = null;
  let lastValid: LmAttempt | null = null;

  for (let i = 0; i < maxAttempts; i++) {
    const utterance = await proposeUtterance(proposition, target, prior, lastValid, {
      apiKey: options.apiKey,
      model,
    });
    const attempt = scoreAttempt(utterance, target);
    attempts.push(attempt);
    if (attempt.polesOk && attempt.wellFormed) lastValid = attempt;
    if (attempt.residue === target) {
      return {
        accepted: utterance,
        target,
        proposition,
        attempts,
        hit: true,
        distances: attempts.map((a) => a.distance),
      };
    }
    prior = attempt;
  }

  return {
    accepted: null,
    target,
    proposition,
    attempts,
    hit: false,
    distances: attempts.map((a) => a.distance),
  };
}
