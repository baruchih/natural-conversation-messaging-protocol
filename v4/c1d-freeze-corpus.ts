/**
 * Freeze C1-D ordinary corpus from local Gutenberg dumps + hike dialogue.
 * Do not retune seeds after this.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rawDir = resolve(import.meta.dirname, 'c1d-raw');
const hike = resolve(import.meta.dirname, 'eval-uuid.conversation.md');
const out = resolve(import.meta.dirname, 'c1d.corpus.txt');

const JUNK =
  /PROJECT GUTENBERG|CHISWICK PRESS|TOOKS COURT|\[Illustration|START OF THE PROJECT|\*\*\*|Produced by|Distributed Proofreaders|ebook|EBOOK|www\.gutenberg/i;

function stripGutenberg(text: string): string {
  const start = text.search(/\*\*\*\s*START OF/i);
  const end = text.search(/\*\*\*\s*END OF/i);
  let body = text;
  if (start >= 0) body = body.slice(start);
  if (end >= 0) {
    const local = body.search(/\*\*\*\s*END OF/i);
    if (local >= 0) body = body.slice(0, local);
  }
  return body;
}

function sentences(text: string): string[] {
  const flat = stripGutenberg(text).replace(/\r\n/g, '\n').replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
  return flat
    .split(/(?<=[.!?])\s+(?=[A-Z“"‘I])/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 20 && s.length <= 400)
    .filter((s) => /[a-zA-Z]{8}/.test(s))
    .filter((s) => !JUNK.test(s));
}

function hikeLines(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^[AB]:\s*"(.*)"\s*$/);
    if (m) out.push(m[1]);
  }
  return out;
}

const seen = new Set<string>();
const frozen: string[] = [];
function add(u: string): void {
  if (seen.has(u)) return;
  seen.add(u);
  frozen.push(u);
}

for (const u of hikeLines(readFileSync(hike, 'utf8'))) add(u);
for (const name of readdirSync(rawDir).filter((n) => n.endsWith('.txt')).sort()) {
  for (const u of sentences(readFileSync(resolve(rawDir, name), 'utf8'))) add(u);
}

writeFileSync(out, frozen.join('\n') + '\n');
console.log(`froze ${frozen.length} utterances`);
