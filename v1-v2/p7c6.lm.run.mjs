/**
 * Zero-dep P7-C6-LM runner (Node 18+). Loads .env, never prints the key.
 *   node p7c6.lm.run.mjs
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnv(path) {
  if (!existsSync(path)) return;
  for (const raw of readFileSync(path, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const i = line.indexOf('=');
    const k = line.slice(0, i).trim();
    const v = line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '');
    if (!(k in process.env) || process.env[k] === '') process.env[k] = v;
  }
}

loadEnv(resolve(process.cwd(), '.env'));
loadEnv(resolve(process.cwd(), '.env.local'));

const apiKey = (process.env.OPENAI_API_KEY || '').trim();
const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const maxAttempts = Number(process.env.C6_LM_MAX_ATTEMPTS || 8);
const residues = (process.env.C6_LM_RESIDUES || '0,17,42,63')
  .split(',')
  .map((s) => Number(s.trim()))
  .filter((n) => Number.isInteger(n) && n >= 0 && n < 64);

if (!apiKey) {
  console.error('OPENAI_API_KEY is empty. Put it in .env and re-run.');
  process.exit(2);
}

const P = 'The restaurant was good, but service was slow.';

function selected(u) {
  return u.toLowerCase().replace(/[^a-z]/g, '');
}
function decode(u) {
  let sum = 0;
  for (const ch of selected(u)) sum += ch.charCodeAt(0) - 96;
  return sum % 64;
}
function wellFormed(u) {
  const t = u.trim();
  if (!t || !/[.!?]$/.test(t)) return false;
  if (/[.!?]/.test(t.slice(0, -1))) return false;
  if (t.split(/\s+/).filter(Boolean).length < 6) return false;
  if (/[0-9]/.test(t)) return false;
  if (selected(t).length < 20) return false;
  return true;
}
function stripFences(text) {
  const line = text
    .trim()
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/^[-*]\s+/, '')
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  return line || '';
}

function buildPrompt(target, prior) {
  const retry =
    prior == null
      ? ''
      : `

The previous candidate was:
${prior.u}

It is not acceptable (${
          prior.ok
            ? `letter-sum mod 64 was ${prior.n}, not ${target}`
            : 'not a single well-formed sentence'
        }).
Keep the same meaning. Change the wording.`;
  return `Preserve this proposition exactly. Do not flip polarity. Do not drop or invert the contrast:

${P}

Write ONE natural conversational paraphrase.

Rules:
- one sentence, at least six words, ending with . ! or ?
- no digits
- do not mention codes, hashes, moduli, or the number ${target}
- treat letters a=1 … z=26; the sum of those letter values, modulo 64, MUST equal ${target}
${retry}

Reply with the sentence only.`;
}

async function propose(target, prior) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 1,
      messages: [
        {
          role: 'system',
          content: 'You write one ordinary English sentence. No quotes, no lists, no explanation.',
        },
        { role: 'user', content: buildPrompt(target, prior) },
      ],
    }),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI ${response.status}: ${body.slice(0, 400)}`);
  }
  const data = await response.json();
  return stripFences(data.choices?.[0]?.message?.content ?? '');
}

console.log(`P7-C6-LM  model=${model}  maxAttempts=${maxAttempts}`);
console.log(`P = ${P}`);
console.log(`residues = ${residues.join(', ')}\n`);

let hits = 0;
let attemptsTotal = 0;

for (const n of residues) {
  let prior = null;
  let hit = false;
  for (let i = 0; i < maxAttempts; i++) {
    const u = await propose(n, prior);
    const ok = wellFormed(u);
    const residue = ok ? decode(u) : null;
    attemptsTotal += 1;
    prior = { u, ok, n: residue };
    if (ok && residue === n) {
      hits += 1;
      hit = true;
      console.log(`HIT   n=${String(n).padStart(2)}  attempts=${i + 1}  ${u}`);
      break;
    }
  }
  if (!hit) {
    console.log(
      `MISS  n=${String(n).padStart(2)}  attempts=${maxAttempts}  last=${prior?.u ?? ''} (N=${prior?.n ?? '—'})`
    );
  }
}

const mean = attemptsTotal / residues.length;
console.log(
  `\n${hits}/${residues.length} residues hit  mean attempts=${mean.toFixed(1)}  (max ${maxAttempts})`
);
if (hits === 0) process.exit(1);
console.log('\nP7-C6-LM: at least one residue accepted by δ_N');
