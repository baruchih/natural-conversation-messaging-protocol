/**
 * Spec reliability + efficiency battery.
 * Same encoder as eval-uuid. k = 50. Do not enlarge.
 * Do not change half3. Do not amend the specification.
 * Sizes are Profile 0 START lengths only.
 */
import { FINISH, PROBE_EXAMPLE, ACK_EXAMPLE, START_128, carrier, fresh, process, declaredBits } from './baseline.ts';
import {
  INTENTS as HIKE,
  PAYLOAD as UUID_BITS,
  UUID,
  needsOwnerData,
  nextSymbol,
  selectNatural,
  selectOwnerData,
  symbolCount,
  tally,
  type EncodeResult,
  type EncodeTurn,
} from './eval-uuid.ts';

export { UUID, UUID_BITS, carrier, nextSymbol, selectNatural, selectOwnerData, symbolCount, tally };
export type { EncodeResult, EncodeTurn };

export const START_8 = 'Shall we begin this tiny round now?';
export const START_24 = 'Shall we begin this brief round now?';

export const START_FOR = {
  8: START_8,
  24: START_24,
  128: START_128,
} as const;

export type Size = keyof typeof START_FOR;

/** Profile 0 can declare these. 32/64/256 are not START lengths. */
export const SIZES: readonly Size[] = [8, 24, 128];

export function hexToBits(hex: string): string {
  const h = hex.replace(/-/g, '').toLowerCase();
  if (!/^[0-9a-f]+$/.test(h)) throw new Error('hex');
  return [...h].map((c) => parseInt(c, 16).toString(2).padStart(4, '0')).join('');
}

/** Declared before any new live cell. Do not change after seeing scores. */
export const PAYLOADS = {
  8: {
    a: hexToBits('b6'),
    b: hexToBits('39'),
  },
  24: {
    a: hexToBits('cafe01'),
    b: hexToBits('3d8e2a'),
  },
  128: {
    a: UUID_BITS,
    b: hexToBits('4a91c0e72f5b48d39c167e0a3b5d8f21'),
  },
} as const;

export type PayloadId = 'a' | 'b';

/**
 * Dinner / market. Sized for 8 and 24. Not used at 128
 * in this battery (hike is the long script).
 */
export const DINNER: readonly { speaker: 'A' | 'B'; text: string }[] = [
  { speaker: 'A', text: 'Ask if they still want to go to the market in the morning.' },
  { speaker: 'B', text: 'Say yes if they leave before the early stalls thin out.' },
  { speaker: 'A', text: 'Ask whether they should take the side street or the bus.' },
  { speaker: 'B', text: 'Say the side street is quieter and they can carry more.' },
  { speaker: 'A', text: 'Ask what they need besides tomatoes.' },
  { speaker: 'B', text: 'Say bread, lemons, and something green if it looks fresh.' },
  { speaker: 'A', text: 'Ask if they remembered the canvas bags.' },
  { speaker: 'B', text: 'Say they are by the door with the coins.' },
  { speaker: 'A', text: 'Ask whether to buy fish or wait for the evening shop.' },
  { speaker: 'B', text: 'Say wait, the ice looked tired last time.' },
  { speaker: 'A', text: 'Ask if they want coffee before the stalls or after.' },
  { speaker: 'B', text: 'Say after, once the bags are heavy.' },
  { speaker: 'A', text: 'Ask what they will do if the tomato stall is sold out.' },
  { speaker: 'B', text: 'Say the one by the fountain usually has a late crate.' },
  { speaker: 'A', text: 'Ask whether they should get flowers this week.' },
  { speaker: 'B', text: 'Say only if they are not already drooping.' },
  { speaker: 'A', text: 'Ask if they want to cook at home or eat nearby.' },
  { speaker: 'B', text: 'Say cook, they already have rice.' },
  { speaker: 'A', text: 'Ask what they regretted not buying last time.' },
  { speaker: 'B', text: 'Say the soft cheese, it was gone by the time they circled back.' },
  { speaker: 'A', text: 'Ask if they should go to the cheese stall first.' },
  { speaker: 'B', text: 'Say first, then vegetables, then bread.' },
  { speaker: 'A', text: 'Ask whether the baker still has the dark loaf.' },
  { speaker: 'B', text: 'Say yes if they arrive before the office crowd.' },
  { speaker: 'A', text: 'Ask if they want olives or if the jar at home is enough.' },
  { speaker: 'B', text: 'Say the jar is almost empty, get a small tub.' },
  { speaker: 'A', text: 'Ask what they will do with leftover herbs.' },
  { speaker: 'B', text: 'Say chop them into the rice tonight.' },
  { speaker: 'A', text: 'Ask if they need cash for the flower stall.' },
  { speaker: 'B', text: 'Say a card works at the main ones now.' },
  { speaker: 'A', text: 'Ask whether they should invite the others for dinner.' },
  { speaker: 'B', text: 'Say keep it small, just the two of them.' },
  { speaker: 'A', text: 'Ask if they want dessert from the pastry cart.' },
  { speaker: 'B', text: 'Say one thing to share, nothing else.' },
  { speaker: 'A', text: 'Ask what time they should head back.' },
  { speaker: 'B', text: 'Say before the bus fills, they can cook slowly.' },
  { speaker: 'A', text: 'Ask if they remembered the list on the fridge.' },
  { speaker: 'B', text: 'Say they took a photo, the paper is still there.' },
  { speaker: 'A', text: 'Ask whether the market will be muddy after the rain.' },
  { speaker: 'B', text: 'Say the covered aisles are fine, skip the far gravel.' },
  { speaker: 'A', text: 'Ask if they want to try the new spice stall.' },
  { speaker: 'B', text: 'Say a pinch of something, not a bag.' },
  { speaker: 'A', text: 'Ask what they will cook if the fish looks good after all.' },
  { speaker: 'B', text: 'Say a simple pan and lemon, no project.' },
  { speaker: 'A', text: 'Ask if they should buy extra lemons anyway.' },
  { speaker: 'B', text: 'Say four, they always use them.' },
  { speaker: 'A', text: 'Ask whether they want sparkling water or just tap.' },
  { speaker: 'B', text: 'Say tap, the bags will be heavy enough.' },
  { speaker: 'A', text: 'Ask if this still feels like a good morning plan.' },
  { speaker: 'B', text: 'Say yes, simple is what they needed.' },
  { speaker: 'A', text: 'Ask whether they should take the short cut home.' },
  { speaker: 'B', text: 'Say yes, the bags will be happier.' },
  { speaker: 'A', text: 'Ask if they want to wash the greens as soon as they walk in.' },
  { speaker: 'B', text: 'Say yes, then they last the week.' },
  { speaker: 'A', text: 'Ask what they will do with the stale end of the old loaf.' },
  { speaker: 'B', text: 'Say crumbs for the pan, nothing wasted.' },
  { speaker: 'A', text: 'Ask if they need oil or if the bottle is still heavy.' },
  { speaker: 'B', text: 'Say still heavy, skip it.' },
  { speaker: 'A', text: 'Ask whether they want a second coffee later.' },
  { speaker: 'B', text: 'Say at home, the good beans are there.' },
  { speaker: 'A', text: 'Ask if they should text when they leave the square.' },
  { speaker: 'B', text: 'Say only if the bus is late.' },
  { speaker: 'A', text: 'Ask what they want on the table tonight besides the rice.' },
  { speaker: 'B', text: 'Say the tomatoes and whatever green they found.' },
  { speaker: 'A', text: 'Ask if they are glad they did not overplan it.' },
  { speaker: 'B', text: 'Say yes, the list was enough.' },
  { speaker: 'A', text: 'Ask whether they want to do this again next week.' },
  { speaker: 'B', text: 'Say if the weather holds, same early hour.' },
];

export const CONTEXTS = {
  hike: HIKE,
  dinner: DINNER,
} as const;

export type ContextId = keyof typeof CONTEXTS;

export interface Cell {
  id: string;
  size: Size;
  payloadId: PayloadId;
  context: ContextId;
  payload: string;
  start: string;
}

/** Cross product except 128 uses hike only. Declared before live cells. */
export const CELLS: readonly Cell[] = [
  ...([8, 24] as const).flatMap((size) =>
    (['a', 'b'] as const).flatMap((payloadId) =>
      (['hike', 'dinner'] as const).map((context) => ({
        id: `${size}-${payloadId}-${context}`,
        size,
        payloadId,
        context,
        payload: PAYLOADS[size][payloadId],
        start: START_FOR[size],
      })),
    ),
  ),
  ...(['a', 'b'] as const).map((payloadId) => ({
    id: `128-${payloadId}-hike`,
    size: 128 as const,
    payloadId,
    context: 'hike' as const,
    payload: PAYLOADS[128][payloadId],
    start: START_FOR[128],
  })),
];

export function encodeRun(
  payload: string,
  start: string,
  intents: readonly { speaker: 'A' | 'B'; text: string }[],
  sets: readonly (readonly string[])[],
): EncodeResult {
  if (declaredBits(start) !== payload.length) throw new Error('start length');
  const m = fresh();
  const snaps = [process(m, 'A', PROBE_EXAMPLE), process(m, 'B', ACK_EXAMPLE), process(m, 'A', start)];
  const turns: EncodeTurn[] = [];
  let remaining = payload;
  for (let i = 0; i < intents.length; i++) {
    if (remaining.length === 0) break;
    const intent = intents[i];
    const owner = m.frame?.owner ?? 'A';
    const mode = m.frame?.mode ?? 'SKIP';
    const remBits = m.frame?.remaining ?? remaining.length;
    const data = needsOwnerData(intent.speaker, owner, mode, remBits);
    const role: EncodeTurn['role'] = intent.speaker !== owner ? 'PEER' : data ? 'OWNER_DATA' : 'OWNER_SKIP';
    const sel = data ? selectOwnerData(sets[i] ?? [], remaining) : selectNatural(sets[i] ?? []);
    if (sel.chosen === null) {
      return { kind: 'NO_CANDIDATE', machine: m, snaps, turns, index: i, wanted: data ? nextSymbol(remaining) ?? remaining : '', role };
    }
    const snap = process(m, intent.speaker, sel.chosen);
    turns.push({
      speaker: intent.speaker,
      intent: intent.text,
      role,
      outcome: snap.outcome,
      mode: snap.mode,
      bits: snap.bits,
      remaining: snap.remaining,
      utterance: sel.chosen,
      c6: carrier(sel.chosen),
      examined: sel.searched ? sel.chosenIndex + 1 : 1,
      legal: sel.legal.length,
      searched: sel.searched,
    });
    snaps.push(snap);
    if (snap.bits) remaining = remaining.slice(snap.bits.length);
  }
  if (remaining.length > 0) {
    return { kind: 'INCOMPLETE', machine: m, snaps, turns, have: payload.length - remaining.length };
  }
  snaps.push(process(m, 'A', FINISH));
  return { kind: 'UUID', machine: m, snaps, turns, payload };
}

export interface RunRow {
  id: string;
  result: 'ARGUMENT' | 'NO_CANDIDATE' | 'INCOMPLETE';
  match: boolean;
  payloadBits: number;
  symbols: number;
  bodyTurns: number;
  ownerTurns: number;
  peerTurns: number;
  ownerData: number;
  ownerSkip: number;
  dataOpportunities: number;
  dataSuccesses: number;
  dataHitRate: number;
  maxExamined: number;
  meanExamined: number;
  bitsPerBodyTurn: number;
  bitsPerOwnerTurn: number;
  peerDigits: number;
  chat: number;
  unusedIntents: number;
  failIndex: number | null;
  failRole: EncodeTurn['role'] | null;
  failWanted: string | null;
  have: number;
}

export function measure(
  cell: Cell,
  encoded: EncodeResult,
  unused: number,
): RunRow {
  const t = tally(encoded.turns);
  const match =
    encoded.kind === 'UUID' && encoded.snaps[encoded.snaps.length - 1].argument === cell.payload;
  const have =
    encoded.kind === 'INCOMPLETE' ? encoded.have : encoded.kind === 'UUID' ? cell.payload.length : t.body ? cell.payload.length - (encoded.turns[encoded.turns.length - 1]?.remaining ?? cell.payload.length) : 0;
  const bits = match ? cell.payload.length : have;
  return {
    id: cell.id,
    result: encoded.kind === 'UUID' && match ? 'ARGUMENT' : encoded.kind === 'NO_CANDIDATE' ? 'NO_CANDIDATE' : 'INCOMPLETE',
    match,
    payloadBits: cell.payload.length,
    symbols: symbolCount(cell.payload),
    bodyTurns: t.body,
    ownerTurns: t.owner,
    peerTurns: t.peer,
    ownerData: t.dataSuccesses,
    ownerSkip: t.ownerSkip,
    dataOpportunities: t.dataOpportunities,
    dataSuccesses: t.dataSuccesses,
    dataHitRate: t.dataOpportunities ? t.dataSuccesses / t.dataOpportunities : 0,
    maxExamined: t.maxExamined,
    meanExamined: t.meanExamined,
    bitsPerBodyTurn: t.body ? bits / t.body : 0,
    bitsPerOwnerTurn: t.owner ? bits / t.owner : 0,
    peerDigits: t.peerDigits,
    chat: t.chat,
    unusedIntents: unused,
    failIndex: encoded.kind === 'NO_CANDIDATE' ? encoded.index : null,
    failRole: encoded.kind === 'NO_CANDIDATE' ? encoded.role : null,
    failWanted: encoded.kind === 'NO_CANDIDATE' ? encoded.wanted : null,
    have,
  };
}

export type SymbolClass = '0' | '10' | '11' | 'FINAL0' | 'FINAL1';

export interface DataHit {
  bits: string;
  examined: number;
  remainingAfter: number;
  klass: SymbolClass;
}

export function symbolClass(bits: string, remainingAfter: number): SymbolClass {
  const before = remainingAfter + bits.length;
  if (before === 1) return bits === '0' ? 'FINAL0' : 'FINAL1';
  if (bits === '10') return '10';
  if (bits === '11') return '11';
  return '0';
}

export function dataHits(turns: readonly EncodeTurn[]): DataHit[] {
  return turns
    .filter((t) => t.role === 'OWNER_DATA' && t.outcome === 'BODY_DATA')
    .map((t) => ({
      bits: t.bits,
      examined: t.examined,
      remainingAfter: t.remaining ?? 0,
      klass: symbolClass(t.bits, t.remaining ?? 0),
    }));
}

export function quantile(xs: readonly number[], p: number): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const i = Math.min(s.length - 1, Math.max(0, Math.ceil(p * s.length) - 1));
  return s[i];
}

export function mean(xs: readonly number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
}

export function summarize(rows: readonly RunRow[], allHits: readonly DataHit[]) {
  const complete = rows.filter((r) => r.result === 'ARGUMENT');
  const dataOpp = rows.reduce((n, r) => n + r.dataOpportunities, 0);
  const dataHit = rows.reduce((n, r) => n + r.dataSuccesses, 0);
  const peerFail = rows.filter((r) => r.failRole === 'PEER').length;
  const first = rows.find((r) => r.result !== 'ARGUMENT');
  const exams = allHits.map((h) => h.examined);
  const byClass = (k: SymbolClass) => allHits.filter((h) => h.klass === k).map((h) => h.examined);
  const classRow = (k: SymbolClass) => {
    const xs = byClass(k);
    return { n: xs.length, mean: mean(xs), median: quantile(xs, 0.5), p95: quantile(xs, 0.95), max: xs.length ? Math.max(...xs) : 0 };
  };
  return {
    cells: rows.length,
    completed: complete.length,
    dataOpp,
    dataHit,
    peerFail,
    firstFail: first ? { id: first.id, result: first.result, role: first.failRole, wanted: first.failWanted, index: first.failIndex } : null,
    search: {
      n: exams.length,
      mean: mean(exams),
      median: quantile(exams, 0.5),
      p95: quantile(exams, 0.95),
      max: exams.length ? Math.max(...exams) : 0,
      by: {
        '0': classRow('0'),
        '10': classRow('10'),
        '11': classRow('11'),
        FINAL0: classRow('FINAL0'),
        FINAL1: classRow('FINAL1'),
      },
    },
    efficiency: {
      bitsPerBody: complete.map((r) => r.bitsPerBodyTurn),
      bitsPerOwner: complete.map((r) => r.bitsPerOwnerTurn),
      turnsPerBit: complete.map((r) => (r.payloadBits ? r.bodyTurns / r.payloadBits : 0)),
    },
  };
}

