/**
 * NCMP-C2-A. Bootstrap reachability. Not the protocol.
 * Same P / seed as C1. k = 50. Do not enlarge. Do not rescue.
 */
import { parseCandidates } from '../v3/m2.ts';
import { isLexicalAck as isAck, isLexicalFinish as isFinish, isLexicalProbe as lexicalProbe, isLexicalStart as isStart } from '../ncmp/reference/ncmp.ts';
import { CONTROL_SEED, kSession, p, tAck, tProbe } from './c1.ts';

export const K = 50;
export const LAST = 'Fine by me.';
export const A_INTENT =
  'Propose walking Saturday morning and roughly when. Stay in this casual scene. Do not change the purpose.';
export const B_INTENT =
  'Answer about the Saturday morning walk in the same casual scene. Agree or adjust the time. Do not change the purpose.';

export const MECHANICAL_PROBE = 'Let me know. 11941749.';

export function legalNatural(u: string): boolean {
  if (u === MECHANICAL_PROBE) return false;
  if (/\d{3,}/.test(u)) return false;
  if (lexicalProbe(u) || isAck(u) || isStart(u) || isFinish(u)) return false;
  return true;
}

export function takeK(raw: string, k = K): string[] {
  return parseCandidates(raw).slice(0, k);
}

export function scoreSet(candidates: readonly string[], target: number) {
  const considered = [...candidates];
  const legal = considered.filter(legalNatural);
  const hits = legal.filter((u) => p(u) === target);
  return {
    considered: considered.length,
    legal: legal.length,
    hits: hits.length,
    hit: hits[0] ?? null,
    values: considered.map((u) => ({
      u,
      p: p(u),
      legal: legalNatural(u),
      hit: legalNatural(u) && p(u) === target,
    })),
  };
}

export { CONTROL_SEED, kSession, p, parseCandidates, tAck, tProbe };
