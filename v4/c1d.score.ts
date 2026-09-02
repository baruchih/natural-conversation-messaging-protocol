import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { analyze, loadCorpus, loadSeeds } from './c1d.ts';

const report = analyze(loadCorpus(), loadSeeds());
writeFileSync(resolve(import.meta.dirname, 'c1d.score.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
