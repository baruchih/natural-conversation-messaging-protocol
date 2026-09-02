import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { C3_BASE, LENGTHS, LENGTH_NAMES, steer } from './c3.ts';

const tiny = steer(8);
const brief = steer(24);
const report = {
  base: C3_BASE,
  first: tiny.first,
  n: tiny.n,
  hinted: tiny.hinted,
  starts: tiny.starts,
  unique_p: tiny.unique_p,
  unique_len: tiny.unique_len,
  by_length: tiny.by_length,
  first_by_length: tiny.first_by_length,
  tiny: { want: 8, hits: tiny.hits, hit: tiny.hit },
  brief: { want: 24, hits: brief.hits, hit: brief.hit },
  lengths: Object.fromEntries(LENGTH_NAMES.map((name, i) => [name, LENGTHS[i]])),
};
writeFileSync(resolve(import.meta.dirname, 'c3.score.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
