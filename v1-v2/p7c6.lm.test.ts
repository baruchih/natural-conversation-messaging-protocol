/**
 * P7-C6-LM guided search. Requires OPENAI_API_KEY in .env
 *   npm run test:c6-lm
 *
 * Measures modular distance per iteration. Does not raise the attempt cap.
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';
import { PROPOSITIONS, decode, wellFormed } from './p7c6.ts';
import { encodeWithLlm, missingPoles } from './p7c6.lm.ts';

config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

const apiKey = (process.env.OPENAI_API_KEY ?? '').trim();
const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
const maxAttempts = Number(process.env.C6_LM_MAX_ATTEMPTS ?? 8);
const residues = (process.env.C6_LM_RESIDUES ?? '0,17,42,63')
  .split(',')
  .map((s) => Number(s.trim()))
  .filter((n) => Number.isInteger(n) && n >= 0 && n < 64);

if (!apiKey) {
  console.error('OPENAI_API_KEY is empty. Put it in .env and re-run npm run test:c6-lm');
  process.exit(2);
}

if (residues.length === 0) {
  console.error('C6_LM_RESIDUES has no valid 0..63 values');
  process.exit(2);
}

const proposition = PROPOSITIONS[0];
let hits = 0;
let poleRejects = 0;
let measured = 0;
let improved = 0;

console.log(`P7-C6-LM guided  model=${model}  maxAttempts=${maxAttempts}`);
console.log(`P = ${proposition.source}`);
console.log(`residues = ${residues.join(', ')}\n`);

for (const n of residues) {
  const result = await encodeWithLlm(proposition.source, n, {
    apiKey,
    model,
    maxAttempts,
  });

  const nums = result.attempts.filter((a) => a.distance !== null).map((a) => a.distance as number);
  if (nums.length >= 2) {
    measured += 1;
    if (nums[nums.length - 1] < nums[0]) improved += 1;
  }
  poleRejects += result.attempts.filter((a) => !a.polesOk).length;

  console.log(`${result.hit ? 'HIT ' : 'MISS'}  target=${String(n).padStart(2)}`);
  console.log('  iter  N    dist  err   poles  U');
  result.attempts.forEach((a, i) => {
    const N = a.residue === null ? '  —' : String(a.residue).padStart(3);
    const dist = a.distance === null ? '  —' : String(a.distance).padStart(3);
    const err = a.signedError === null ? '   —' : String(a.signedError).padStart(4);
    const poles = a.polesOk ? 'ok   ' : a.missingPoles.join(',');
    console.log(
      `  ${String(i + 1).padStart(4)}  ${N}   ${dist}  ${err}  ${poles.padEnd(22)}  ${a.utterance}`
    );
  });
  console.log('');

  if (result.hit && result.accepted) {
    hits += 1;
    if (
      !wellFormed(result.accepted) ||
      decode(result.accepted) !== n ||
      missingPoles(result.accepted).length > 0
    ) {
      console.error(`FAIL  validator mismatch for n=${n}`);
      process.exit(1);
    }
  }
}

console.log(
  `${hits}/${residues.length} residues hit  pole-rejects=${poleRejects}  traces_that_got_closer=${improved}/${measured}`
);

if (hits === 0) {
  console.error('\nP7-C6-LM: no residue hit');
  process.exit(1);
}

console.log('\nP7-C6-LM: at least one residue accepted by δ_N with poles intact');
