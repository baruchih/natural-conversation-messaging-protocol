/**
 * P7-G1 live: LM proposes; δ and C6-HY decide.
 *   npm run test:g1-lm
 *
 * Two conditions, independent samples, no N in the prompt,
 * no accept/reject feedback. Free may score zero. That is a finding.
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { decode as decodeN } from './p7c6.ts';
import { decodeD } from './p7d1.ts';
import { decodeE2 } from './p7e2.ts';
import {
  finishN,
  proposeUtterance,
  scoreProposal,
  type G1Condition,
  type G1Finished,
} from './p7g1.ts';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const apiKey = (process.env.OPENAI_API_KEY ?? '').trim();
const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
const attempts = Number(process.env.G1_LM_ATTEMPTS ?? 8);

if (!apiKey) {
  console.error('OPENAI_API_KEY is empty. Put it in .env and re-run npm run test:g1-lm');
  process.exit(2);
}

async function runCondition(condition: G1Condition): Promise<G1Finished[]> {
  const rows: G1Finished[] = [];
  console.log(`\n${condition.toUpperCase()}  ${attempts} independent proposals\n`);
  for (let i = 0; i < attempts; i++) {
    const u = await proposeUtterance(condition, { apiKey, model });
    const row = finishN(u, 42);
    rows.push(row);
    const mark = row.nHit ? 'N42' : row.score.deHit ? 'DE ' : '—  ';
    console.log(
      `  ${String(i + 1).padStart(2)}  ${mark}  D=${row.score.d.padEnd(5)} E=${row.score.e.padEnd(11)} ${row.score.novelty.padEnd(10)}  ${u}`,
    );
    if (row.finished && row.nHit) {
      console.log(`      → ${row.finished}`);
    }
  }
  return rows;
}

function summarize(label: string, rows: G1Finished[]): void {
  const de = rows.filter((r) => r.score.deHit).length;
  const n42 = rows.filter((r) => r.nHit).length;
  const novel = rows.filter((r) => r.score.novelty === 'novel').length;
  const template = rows.filter((r) => r.score.novelty === 'template' || r.score.novelty === 'echo').length;
  const pole = rows.filter((r) => r.score.novelty === 'pole_swap').length;
  console.log(
    `${label}: DE ${de}/${rows.length}  N=42 ${n42}/${rows.length}  novel ${novel}  pole_swap ${pole}  template/echo ${template}`,
  );
}

console.log(`P7-G1-LM  model=${model}  attempts=${attempts}`);
console.log('LM writes P+D+E. C6-HY writes N. δ accepts or rejects.');

const informed = await runCondition('informed');
const free = await runCondition('free');

console.log('');
summarize('informed', informed);
summarize('free    ', free);

const informedDe = informed.filter((r) => r.score.deHit);
if (informedDe.length === 0) {
  console.error('\nP7-G1-LM: informed condition produced no δ_D+δ_E2 hit');
  process.exit(1);
}

const finished = informed.find((r) => r.nHit && r.finished);
if (finished?.finished) {
  if (
    decodeD(finished.finished) !== 'GET' ||
    decodeE2(finished.finished) !== 'CUSTOMER' ||
    decodeN(finished.finished) !== 42
  ) {
    console.error('FAIL  finished utterance failed δ');
    process.exit(1);
  }
}

const informedNovel = informed.filter((r) => r.score.novelty === 'novel').length;
if (informed.every((r) => r.score.novelty === 'template' || r.score.novelty === 'echo' || !r.score.deHit)) {
  console.log('\ninformed hits were template/echo only — LM used as a grammar picker');
} else if (informedNovel > 0) {
  console.log('\ninformed produced at least one novel carrier inside the grammar');
}

console.log('\nP7-G1-LM: δ judged every proposal; free-condition failure is allowed');
