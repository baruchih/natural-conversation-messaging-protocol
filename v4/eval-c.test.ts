/**
 * Runway characterization. Declared scenes. Offline C.
 *   npm run test:v4-eval-c
 */
import { START_128, declaredBits } from './baseline.ts';
import {
  PROBE,
  PROBE_HEX,
  SCENES,
  TURN_CAP,
  encodable,
  intentsFrom,
  measureCell,
  nextSpeaker,
  observe,
  parseTurnOrEnd,
  promptIsBlindScene,
  sceneById,
  scenePrompt,
  setsForEncodable,
} from './eval-c.ts';

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

assert(SCENES.map((s) => s.id).join(',') === 'dinner,weekend,technical,collab', 'four declared scenes');
assert(TURN_CAP === 160, 'safety cap 160, not a target');
assert(PROBE.length === 128 && PROBE === [...PROBE_HEX].map((c) => parseInt(c, 16).toString(2).padStart(4, '0')).join(''), 'probe is 128 bits');
assert(declaredBits(START_128) === 128, 'measure as wide');
assert(SCENES.every((s) => promptIsBlindScene(s, [], 'A')), 'empty-history prompts are blind');

const dinner = sceneById('dinner');
assert(
  !/128|uuid|payload|bit/i.test(scenePrompt(dinner, [], 'A')),
  'generation prompt has no payload target',
);

assert(parseTurnOrEnd('END')?.kind === 'END', 'END');
assert(parseTurnOrEnd('end.')?.kind === 'END', 'end.');
assert(parseTurnOrEnd('"END"')?.kind === 'END', 'quoted END');
assert(parseTurnOrEnd('Should we get bread?')?.kind === 'U', 'ordinary turn');

assert(nextSpeaker([]) === 'A', 'A speaks first');
assert(nextSpeaker([{ speaker: 'A', utterance: 'Hi.' }]) === 'B', 'then B');

const toy: { speaker: 'A' | 'B'; utterance: string }[] = [
  { speaker: 'A', utterance: 'Should we cook the pasta tonight or go out?' },
  { speaker: 'B', utterance: 'Pasta at home, the shop still has tomatoes.' },
  { speaker: 'A', utterance: 'I can pick them up if you start the water.' },
  { speaker: 'B', utterance: 'Start the water. Get basil if it looks alive.' },
  { speaker: 'A', utterance: 'Basil and the bread we liked last week.' },
  { speaker: 'B', utterance: 'That is enough. See you in a bit.' },
];

const obs = observe(toy);
assert(obs.turns === 6, 'observed turn count');
assert(obs.chat === 0, 'body, not CHAT');
assert(obs.bits >= 0 && obs.bits <= 128, 'C_observed in wide frame');
assert(obs.dataTurns + obs.skipTurns === 6, 'every toy turn is BODY');
assert(obs.bits !== 128 || obs.dataTurns > 0, 'bits come from DATA turns');

const frozenSets = setsForEncodable(toy, []);
assert(frozenSets.every((s, i) => s[0] === toy[i].utterance), 'default sets keep frozen U');
assert(intentsFrom(toy).every((x, i) => x.text === toy[i].utterance), 'intent is the frozen turn');

const enc = encodable(toy, frozenSets);
assert(enc.bits >= 0 && enc.bits <= 128, 'C_encodable in wide frame');
assert(enc.unusedProbe === 128 - enc.bits, 'unused probe');
assert(!enc.noCandidate || enc.result === 'NO_CANDIDATE', 'NO_CANDIDATE flagged');

const row = measureCell(dinner, toy, 'NATURAL', frozenSets);
assert(row.observed.bits === obs.bits, 'cell observed');
assert(row.encoded.bits === enc.bits, 'cell encodable');
assert(row.stop === 'NATURAL', 'toy is natural');
assert(Math.abs(row.bitsPerTurn - enc.bits / toy.length) < 1e-12, 'bits/turn is C_encodable / turns');
assert(Math.abs(row.dataOppFrac - enc.dataOpportunities / toy.length) < 1e-12, 'DATA opp / turns');

console.log('V4-Eval-C  declared scenes  conversation first\n');
console.log(`scenes            ${SCENES.map((s) => s.id).join(', ')}`);
console.log(`turn cap          ${TURN_CAP} (safety)`);
console.log(`probe             ${PROBE_HEX}  ${PROBE.length} bits`);
console.log(`toy C_observed    ${obs.bits}  DATA ${obs.dataTurns}/${obs.turns}`);
console.log(`toy C_encodable   ${enc.bits}  ${enc.result}  DATA ${enc.dataSuccesses}/${enc.dataOpportunities}`);

const { FROZEN } = await import('./eval-c.frozen.ts');
assert(SCENES.every((s) => FROZEN.rows[s.id]), 'four scenes recorded');
assert(SCENES.every((s) => FROZEN.transcripts[s.id].stop === 'NATURAL'), 'no CAPPED');
assert(FROZEN.rows.collab.encoded.noCandidate, 'collab miss stays a miss');
console.log('');
for (const s of SCENES) {
  const r = FROZEN.rows[s.id];
  console.log(
    `${r.id.padEnd(12)} ${r.stop.padEnd(8)} turns=${String(r.turns).padStart(3)}  C_obs=${String(r.observed.bits).padStart(3)}  C_enc=${String(r.encoded.bits).padStart(3)}  bits/turn=${r.bitsPerTurn.toFixed(3)}  DATA_opp=${r.encoded.dataOpportunities}/${r.turns}`,
  );
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV4-Eval-C: k=50, half3, spec unchanged');
