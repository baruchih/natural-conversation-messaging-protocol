/**
 * Freeze C2-D held-out corpus. Different Gutenberg ids from C1-D.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const rawDir = resolve(import.meta.dirname, 'c2d-raw');
const out = resolve(import.meta.dirname, 'c2d.corpus.txt');
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

const seen = new Set<string>();
const frozen: string[] = [];
for (const name of readdirSync(rawDir).filter((n) => n.endsWith('.txt')).sort()) {
  for (const u of sentences(readFileSync(resolve(rawDir, name), 'utf8'))) {
    if (seen.has(u)) continue;
    seen.add(u);
    frozen.push(u);
  }
}
writeFileSync(out, frozen.join('\n') + '\n');
console.log(`froze ${frozen.length}`);
