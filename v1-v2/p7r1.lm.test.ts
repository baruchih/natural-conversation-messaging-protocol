/**
 * P7-R1 live: intermediary paraphrase, no NCMP in the prompt.
 *   npm run test:r1-lm
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { ACK_EXAMPLE, PROBE_EXAMPLE } from './p7s1.ts';
import { I1Agent, recoverPayload } from './p7i1.ts';
import { R1_SOURCE, paraphrase, scoreRewrite } from './p7r1.ts';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const apiKey = (process.env.OPENAI_API_KEY ?? '').trim();
const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
const attempts = Number(process.env.R1_LM_ATTEMPTS ?? 8);

if (!apiKey) {
  console.error('OPENAI_API_KEY is empty. Put it in .env and re-run npm run test:r1-lm');
  process.exit(2);
}

console.log(`P7-R1-LM  model=${model}  attempts=${attempts}`);
console.log(`source: ${R1_SOURCE}`);
console.log('prompt: paraphrase naturally, no NCMP\n');

const rows = [];
for (let i = 0; i < attempts; i++) {
  const u = await paraphrase(R1_SOURCE, { apiKey, model });
  const s = scoreRewrite(R1_SOURCE, u);
  rows.push(s);
  const mark = s.frameSame ? 'FRAME' : s.identity ? 'COPY ' : '—    ';
  console.log(
    `  ${String(i + 1).padStart(2)}  ${mark}  D=${s.dSame ? 'ok' : s.d.padEnd(5)} E=${s.eSame ? 'ok' : s.e.padEnd(11)} N=${s.nSame ? 'ok' : String(s.n).padStart(2)}  ${u}`,
  );
}

const A = new I1Agent('A');
const B = new I1Agent('B');
A.send(PROBE_EXAMPLE);
B.receive(PROBE_EXAMPLE);
B.send(ACK_EXAMPLE);
A.receive(ACK_EXAMPLE);
const bindTranscript = [...B.transcript];

let i1Wrong = 0;
for (const s of rows) {
  if (s.identity) continue;
  const recovered = recoverPayload(s.rewritten, bindTranscript);
  if (recovered !== 42) i1Wrong += 1;
}

const n = rows.length;
const copies = rows.filter((r) => r.identity).length;
const d = rows.filter((r) => r.dSame).length;
const e = rows.filter((r) => r.eSame).length;
const nOk = rows.filter((r) => r.nSame).length;
const frame = rows.filter((r) => r.frameSame).length;
const fresh = rows.filter((r) => !r.identity);

console.log(
  `\nD ${d}/${n}  E ${e}/${n}  N ${nOk}/${n}  full frame ${frame}/${n}  copies ${copies}  I1 payload≠42 on ${i1Wrong}/${fresh.length} fresh rewrites`,
);

if (n === 0) {
  console.error('no paraphrases');
  process.exit(1);
}

console.log('\nP7-R1-LM: intermediary was not given NCMP; δ judged every rewrite');
