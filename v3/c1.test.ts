/**
 * V3-C1: declared surface carriers on frozen M3 turns.
 *   npm run test:v3-c1
 */
import { FROZEN_DRAWS } from './m3.frozen.ts';
import { DRAWS } from './m3.ts';
import {
  PREFIXES,
  encode,
  runFrozenCarrier,
  surface,
  type CarrierId,
} from './c1.ts';

const EXPECTED: Record<
  string,
  Record<CarrierId, { support: number; h: string }>
> = {
  p1: {
    c6: { support: 32, h: '4.82' },
    c6p: { support: 32, h: '4.82' },
    c6t: { support: 40, h: '5.19' },
    c6i: { support: 34, h: '4.93' },
    vec: { support: 40, h: '5.19' },
  },
  p2: {
    c6: { support: 35, h: '4.98' },
    c6p: { support: 37, h: '5.08' },
    c6t: { support: 48, h: '5.56' },
    c6i: { support: 37, h: '5.08' },
    vec: { support: 48, h: '5.56' },
  },
  p3: {
    c6: { support: 29, h: '4.69' },
    c6p: { support: 29, h: '4.69' },
    c6t: { support: 42, h: '5.31' },
    c6i: { support: 32, h: '4.83' },
    vec: { support: 43, h: '5.35' },
  },
  p4: {
    c6: { support: 33, h: '4.88' },
    c6p: { support: 33, h: '4.88' },
    c6t: { support: 41, h: '5.25' },
    c6i: { support: 38, h: '5.11' },
    vec: { support: 41, h: '5.25' },
  },
  p5: {
    c6: { support: 29, h: '4.61' },
    c6p: { support: 30, h: '4.65' },
    c6t: { support: 33, h: '4.81' },
    c6i: { support: 29, h: '4.61' },
    vec: { support: 33, h: '4.81' },
  },
  p6: {
    c6: { support: 34, h: '4.93' },
    c6p: { support: 36, h: '5.02' },
    c6t: { support: 48, h: '5.56' },
    c6i: { support: 37, h: '5.06' },
    vec: { support: 48, h: '5.56' },
  },
};

const SPLITS: Record<string, Record<string, [number, number]>> = {
  p1: { P: [0, 13], T8: [8, 13], I: [2, 13] },
  p2: { P: [2, 11], T8: [11, 11], I: [2, 11] },
  p3: { P: [0, 14], T8: [10, 14], I: [3, 14] },
  p4: { P: [0, 13], T8: [7, 13], I: [5, 13] },
  p5: { P: [1, 11], T8: [4, 11], I: [0, 11] },
  p6: { P: [2, 11], T8: [10, 11], I: [3, 11] },
};

let failed = 0;
function assert(cond: boolean, message: string): void {
  if (!cond) {
    failed += 1;
    console.error(`FAIL  ${message}`);
  }
}

const sample = surface('Oh nice! How was the vibe once they arrived?');
assert(sample.P === 1, 'terminal ? is class 1');
assert(sample.I === 1, 'one internal punct');
assert(encode(sample, 'vec') === `${sample.c6}:${sample.P}:${sample.T8}:${sample.I}`, 'vec packing');

console.log('V3-C1  declared carriers on frozen M3\n');
console.log('id   c6/H      c6p/H     c6t/H     c6i/H     vec/H');
const rows = runFrozenCarrier();
for (const s of rows) {
  const exp = EXPECTED[s.prefix.id];
  assert((FROZEN_DRAWS[s.prefix.id] ?? []).length === DRAWS, `${s.prefix.id} frozen size`);
  assert(s.n === DRAWS, `${s.prefix.id} legal`);
  const cells: string[] = [];
  for (const id of ['c6', 'c6p', 'c6t', 'c6i', 'vec'] as const) {
    const got = s.carriers[id];
    const want = exp[id];
    assert(got.support === want.support, `${s.prefix.id} ${id} support`);
    assert(got.entropy.toFixed(2) === want.h, `${s.prefix.id} ${id} entropy`);
    cells.push(`${String(got.support).padStart(2)}/${got.entropy.toFixed(2)}`);
  }
  console.log(`${s.prefix.id}   ${cells.join('   ')}`);
}

console.log('\nC6 collision splits  (split/classes)\n');
console.log('id   P      T8      I');
for (const s of rows) {
  const want = SPLITS[s.prefix.id];
  const cell = (k: 'P' | 'T8' | 'I') => {
    const got = s.splits[k];
    const [sp, cl] = want[k];
    assert(got.split === sp && got.classes === cl, `${s.prefix.id} ${k} split`);
    return `${got.split}/${got.classes}`;
  };
  console.log(`${s.prefix.id}   ${cell('P').padEnd(6)} ${cell('T8').padEnd(7)} ${cell('I')}`);
}

if (failed > 0) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}

console.log('\nV3-C1: letter-sum is not the whole surface');
