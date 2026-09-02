/**
 * Independent Profile 0 coding rules. Not a copy of process().
 * Used only to cross-check bits and next_mode on body turns.
 */
import type { Mode } from './j.ts';
import type { Speaker } from './baseline.ts';

export function refNext(v: number): Mode {
  return v < 32 ? 'DATA' : 'SKIP';
}

export function refFinal(v: number): '0' | '1' {
  return (v & 1) === 0 ? '0' : '1';
}

export function refHalf3Symbol(v: number): '0' | '10' | '11' {
  const r = ((v % 3) + 3) % 3;
  return r === 0 ? '0' : r === 1 ? '10' : '11';
}

export function refSymbol(remaining: number, v: number): string {
  if (remaining <= 0) return '';
  if (remaining === 1) return refFinal(v);
  return refHalf3Symbol(v);
}

export function refBits(mode: Mode, remaining: number, speaker: Speaker, owner: Speaker, v: number): string {
  if (speaker !== owner) return '';
  if (mode !== 'DATA') return '';
  return refSymbol(remaining, v);
}
