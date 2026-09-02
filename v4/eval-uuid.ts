/**
 * Spec evaluation: 128-bit UUID under NCMP-Baseline-Protocol.md.
 * Peer and owner SKIP: one natural U, no search.
 * Owner DATA: k = 50, turnOk hygiene, required symbol.
 * Old uuid.frozen.ts is not this run. Do not regenerate it.
 * Do not amend the specification.
 */
import { BATCH, intentPrompt, promptIsBlind } from './f4.ts';
import { parseCandidates } from './f4.ts';
import {
  FINISH,
  PROBE_EXAMPLE,
  ACK_EXAMPLE,
  START_128,
  carrier,
  finalBit,
  fresh,
  half3,
  process,
  turnOk,
  type Machine,
  type Mode,
  type Outcome,
  type Snapshot,
  type Speaker,
} from './baseline.ts';
import {
  INTENTS as BASE_INTENTS,
  PAYLOAD,
  UUID,
  bitsToUuid,
  nextSymbol,
  symbolCount,
  uuidToBits,
} from './uuid.ts';

export {
  ACK_EXAMPLE,
  BATCH,
  FINISH,
  PAYLOAD,
  PROBE_EXAMPLE,
  START_128,
  UUID,
  bitsToUuid,
  carrier,
  fresh,
  intentPrompt,
  nextSymbol,
  parseCandidates,
  process,
  promptIsBlind,
  symbolCount,
  turnOk,
  uuidToBits,
};

/**
 * Same hike script as the first UUID run, plus declared
 * day-of-hike continuations. Unused stay unused.
 * Do not add after a miss.
 */
const EXTRA: readonly { speaker: Speaker; text: string }[] = [
  { speaker: 'A', text: 'Ask if they grabbed the water bottles from the fridge.' },
  { speaker: 'B', text: 'Say they are already in the crate by the door.' },
  { speaker: 'A', text: 'Ask whether the crate is too heavy for one person.' },
  { speaker: 'B', text: 'Say they can take it if the other person gets the packs.' },
  { speaker: 'A', text: 'Ask if the neighbor waved them off.' },
  { speaker: 'B', text: 'Say yes, and asked them to text when they are back.' },
  { speaker: 'A', text: 'Ask what they should do about the leftover bread.' },
  { speaker: 'B', text: 'Say bring two slices for the trail and leave the rest.' },
  { speaker: 'A', text: 'Ask if the car windows need a wipe.' },
  { speaker: 'B', text: 'Say the passenger side is smeared from last night.' },
  { speaker: 'A', text: 'Ask whether they should take the back road.' },
  { speaker: 'B', text: 'Say yes, the main one still has cones.' },
  { speaker: 'A', text: 'Ask if they want the heater on for the first miles.' },
  { speaker: 'B', text: 'Say just enough to clear the glass, then off.' },
  { speaker: 'A', text: 'Ask what they will do if they hit a slow tractor.' },
  { speaker: 'B', text: 'Say wait it out, the road is too narrow to pass.' },
  { speaker: 'A', text: 'Ask if they remembered the parking printout.' },
  { speaker: 'B', text: 'Say it is in the door pocket with the map.' },
  { speaker: 'A', text: 'Ask whether the lot machine was working last month.' },
  { speaker: 'B', text: 'Say it took two tries but the card went through.' },
  { speaker: 'A', text: 'Ask if they want to stretch as soon as they park.' },
  { speaker: 'B', text: 'Say calves and hips, nothing dramatic.' },
  { speaker: 'A', text: 'Ask what they will leave on the seat.' },
  { speaker: 'B', text: 'Say the coffee cup and the extra sweater.' },
  { speaker: 'A', text: 'Ask if the trailhead sign still has the same warning.' },
  { speaker: 'B', text: 'Say the loose rock note is still taped there.' },
  { speaker: 'A', text: 'Ask whether they should sign the register.' },
  { speaker: 'B', text: 'Say yes, names and a mid afternoon return.' },
  { speaker: 'A', text: 'Ask if they want a photo at the first marker.' },
  { speaker: 'B', text: 'Say a quick one, then start walking.' },
  { speaker: 'A', text: 'Ask what pace they want for the first hill.' },
  { speaker: 'B', text: 'Say easy until they warm up.' },
  { speaker: 'A', text: 'Ask if the shade is holding on the lower path.' },
  { speaker: 'B', text: 'Say for now, it will break after the bend.' },
  { speaker: 'A', text: 'Ask whether they hear the creek yet.' },
  { speaker: 'B', text: 'Say faintly, it gets louder near the stones.' },
  { speaker: 'A', text: 'Ask if they want to refill at the crossing.' },
  { speaker: 'B', text: 'Say one bottle, they still have plenty.' },
  { speaker: 'A', text: 'Ask what they think of the new tape on the spur.' },
  { speaker: 'B', text: 'Say leave that spur, the tape is there for a reason.' },
  { speaker: 'A', text: 'Ask if the switchbacks feel shorter this year.' },
  { speaker: 'B', text: 'Say no, they just remembered them better.' },
  { speaker: 'A', text: 'Ask whether they should stop at the fallen log.' },
  { speaker: 'B', text: 'Say a minute for water, then keep the rhythm.' },
  { speaker: 'A', text: 'Ask if their shoulder strap is sitting right.' },
  { speaker: 'B', text: 'Say they already loosened it.' },
  { speaker: 'A', text: 'Ask what they will do if a dog runs up.' },
  { speaker: 'B', text: 'Say stay still and let the owner call it.' },
  { speaker: 'A', text: 'Ask if they want the ridge first or the lake loop later.' },
  { speaker: 'B', text: 'Say ridge first while the air is still clear.' },
  { speaker: 'A', text: 'Ask whether the bench is in sun or wind today.' },
  { speaker: 'B', text: 'Say sun, the wind is coming from the other side.' },
  { speaker: 'A', text: 'Ask if they should eat as soon as they sit.' },
  { speaker: 'B', text: 'Say yes, they will linger less if they eat first.' },
  { speaker: 'A', text: 'Ask what they want from the flask first.' },
  { speaker: 'B', text: 'Say the tea, it is still warm.' },
  { speaker: 'A', text: 'Ask if the wraps survived the pack.' },
  { speaker: 'B', text: 'Say a little flat, still fine.' },
  { speaker: 'A', text: 'Ask whether they can see the farms from here.' },
  { speaker: 'B', text: 'Say two fields and the silver roof.' },
  { speaker: 'A', text: 'Ask if they want another photo of the lake.' },
  { speaker: 'B', text: 'Say one wide shot, then put the phone away.' },
  { speaker: 'A', text: 'Ask what they will do with the apple cores.' },
  { speaker: 'B', text: 'Say pack them out, no burying.' },
  { speaker: 'A', text: 'Ask if they feel the altitude at all.' },
  { speaker: 'B', text: 'Say only when they talk and walk together.' },
  { speaker: 'A', text: 'Ask whether they should start down before the cloud.' },
  { speaker: 'B', text: 'Say soon, the cloud is still on the far ridge.' },
  { speaker: 'A', text: 'Ask if the descent looks greasy.' },
  { speaker: 'B', text: 'Say the first pitch, then it dries.' },
  { speaker: 'A', text: 'Ask what they will do at the gravel patch.' },
  { speaker: 'B', text: 'Say short steps and no chatting through it.' },
  { speaker: 'A', text: 'Ask if they want poles for that stretch.' },
  { speaker: 'B', text: 'Say one pole is enough if they share.' },
  { speaker: 'A', text: 'Ask whether the creek crossing is higher now.' },
  { speaker: 'B', text: 'Say a little, the upstream stones are better.' },
  { speaker: 'A', text: 'Ask if they should change socks after the water.' },
  { speaker: 'B', text: 'Say only if a boot actually goes in.' },
  { speaker: 'A', text: 'Ask what they want to skip on the way down.' },
  { speaker: 'B', text: 'Say the cairn spur, they are done adding distance.' },
  { speaker: 'A', text: 'Ask if the lot will still have spaces later.' },
  { speaker: 'B', text: 'Say their car is already in one, that is the point.' },
  { speaker: 'A', text: 'Ask whether they want the cafe or just the car.' },
  { speaker: 'B', text: 'Say cafe if the legs feel cooked, otherwise home.' },
  { speaker: 'A', text: 'Ask if they should text the neighbor from the lot.' },
  { speaker: 'B', text: 'Say once they have a bar, keep it short.' },
  { speaker: 'A', text: 'Ask what they will tell people about the ridge.' },
  { speaker: 'B', text: 'Say it was quiet and the lake was clean.' },
  { speaker: 'A', text: 'Ask if they want this to be the regular loop.' },
  { speaker: 'B', text: 'Say for a while, until it feels too easy.' },
  { speaker: 'A', text: 'Ask whether they should put next month on the calendar tonight.' },
  { speaker: 'B', text: 'Say yes, before the week fills up again.' },
  { speaker: 'A', text: 'Ask if they are glad they came out.' },
  { speaker: 'B', text: 'Say yes, this is what the crowded week needed.' },
  { speaker: 'A', text: 'Ask what they want first when they get home.' },
  { speaker: 'B', text: 'Say shower, then the leftover soup.' },
  { speaker: 'A', text: 'Ask if they locked the car from habit already.' },
  { speaker: 'B', text: 'Say twice, they always do.' },
  { speaker: 'A', text: 'Ask whether the sky still looks like it will hold.' },
  { speaker: 'B', text: 'Say long enough to get down without a rush.' },
  { speaker: 'A', text: 'Ask if they want to count the cars left in the lot.' },
  { speaker: 'B', text: 'Say later, they already know theirs is there.' },
  { speaker: 'A', text: 'Ask what they will do if the cafe is queued.' },
  { speaker: 'B', text: 'Say take the coffee to the car.' },
  { speaker: 'A', text: 'Ask if they should buy a pastry anyway.' },
  { speaker: 'B', text: 'Say one to split, nothing else.' },
  { speaker: 'A', text: 'Ask whether they want the window table.' },
  { speaker: 'B', text: 'Say if it is free, otherwise standing is fine.' },
  { speaker: 'A', text: 'Ask if their legs feel done or just quiet.' },
  { speaker: 'B', text: 'Say quiet, which is better than done.' },
  { speaker: 'A', text: 'Ask what they will wash first at home.' },
  { speaker: 'B', text: 'Say the flask, it always smells if they wait.' },
  { speaker: 'A', text: 'Ask if they want to hang the packs in the hall.' },
  { speaker: 'B', text: 'Say yes, so they dry before Monday.' },
  { speaker: 'A', text: 'Ask whether they should message the others a photo.' },
  { speaker: 'B', text: 'Say one of the lake, not a pile of them.' },
  { speaker: 'A', text: 'Ask if they want to look at the map of next month’s loop.' },
  { speaker: 'B', text: 'Say tomorrow, not tonight.' },
  { speaker: 'A', text: 'Ask what they will skip buying on the way home.' },
  { speaker: 'B', text: 'Say drinks, the fridge is still full.' },
  { speaker: 'A', text: 'Ask if the cat will be waiting at the door.' },
  { speaker: 'B', text: 'Say probably, and loud about it.' },
  { speaker: 'A', text: 'Ask whether they left the hall light on the timer.' },
  { speaker: 'B', text: 'Say yes, it should already be on.' },
  { speaker: 'A', text: 'Ask if they want music or quiet on the drive back.' },
  { speaker: 'B', text: 'Say quiet until they hit the main road.' },
  { speaker: 'A', text: 'Ask what they regretted packing this time.' },
  { speaker: 'B', text: 'Say the extra layer, they never put it on.' },
  { speaker: 'A', text: 'Ask if they were right about the socks.' },
  { speaker: 'B', text: 'Say yes, the spare pair stayed dry.' },
  { speaker: 'A', text: 'Ask whether they want to rate this loop out of ten.' },
  { speaker: 'B', text: 'Say they do not, it was just a good day.' },
  { speaker: 'A', text: 'Ask if they would come back in the rain.' },
  { speaker: 'B', text: 'Say only as far as the covered bend.' },
  { speaker: 'A', text: 'Ask what they will tell work on Monday.' },
  { speaker: 'B', text: 'Say they went walking and left it at that.' },
  { speaker: 'A', text: 'Ask if they want breakfast out tomorrow.' },
  { speaker: 'B', text: 'Say toast at home, they have had enough going out.' },
  { speaker: 'A', text: 'Ask whether the leftover fruit will last.' },
  { speaker: 'B', text: 'Say the apples will, the rest should be eaten tonight.' },
  { speaker: 'A', text: 'Ask if they should put the boots by the heater.' },
  { speaker: 'B', text: 'Say not too close, they crack if they bake.' },
  { speaker: 'A', text: 'Ask what they want to watch after the soup.' },
  { speaker: 'B', text: 'Say nothing long, they will fall asleep.' },
  { speaker: 'A', text: 'Ask if this felt like enough of a break.' },
  { speaker: 'B', text: 'Say yes, and they did not have to invent a bigger plan.' },
  { speaker: 'A', text: 'Ask whether they want to keep the same meet time next month.' },
  { speaker: 'B', text: 'Say earlier if the lot stays this busy.' },
  { speaker: 'A', text: 'Ask if they are ready to call the day done.' },
  { speaker: 'B', text: 'Say ready enough, which is the whole idea.' },
];

export const INTENTS: readonly { speaker: Speaker; text: string }[] = [...BASE_INTENTS, ...EXTRA];

export function naturalPrompt(
  history: readonly { speaker: string; utterance: string }[],
  speaker: string,
  intent: string,
): string {
  const soFar = history.length
    ? history.map((t) => `${t.speaker}: ${t.utterance}`).join('\n')
    : '(no turns yet)';
  return `Conversation so far:
${soFar}

${speaker}'s next conversational intent:
${intent}

Reply with one natural conversational turn that preserves that intent. A turn may contain more than one sentence. No numbering. No quotation marks. No list of alternatives.`;
}

export function promptIsBlindNatural(
  history: readonly { speaker: string; utterance: string }[],
  speaker: string,
  intent: string,
): boolean {
  return isBlind(naturalPrompt(history, speaker, intent)) && isBlind(intent) && history.every((t) => isBlind(t.utterance));
}

function isBlind(p: string): boolean {
  const t = p.toLowerCase();
  if (t.includes('ncmp') || t.includes('residue') || t.includes('letter-sum')) return false;
  if (t.includes('encode') || t.includes('protocol') || /\b64\b/.test(t)) return false;
  return true;
}

export function parseNatural(text: string): string | null {
  for (const raw of text.split('\n')) {
    let u = raw.trim().replace(/^["'`]+|["'`]+$/g, '');
    u = u.replace(/^\d+[.)]\s+/, '').replace(/^[-*]\s+/, '');
    if (!u) continue;
    if (!/[.!?]$/.test(u)) u = `${u}.`;
    return u;
  }
  return null;
}

function uniqueInOrder(xs: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of xs) {
    const t = x.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

export interface Selection {
  considered: string[];
  legal: string[];
  chosen: string | null;
  chosenIndex: number;
  searched: boolean;
}

/** First generated U. No turnOk. Peer and owner SKIP. */
export function selectNatural(candidates: readonly string[]): Selection {
  const considered = uniqueInOrder(candidates).slice(0, 1);
  return {
    considered,
    legal: considered,
    chosen: considered[0] ?? null,
    chosenIndex: considered.length ? 0 : -1,
    searched: false,
  };
}

/** First turnOk U that realizes the next Profile 0 symbol. */
export function selectOwnerData(candidates: readonly string[], remaining: string): Selection {
  const want = nextSymbol(remaining);
  const considered = uniqueInOrder(candidates).slice(0, BATCH);
  const legal = considered.filter(turnOk);
  if (want === null) return { considered, legal, chosen: null, chosenIndex: -1, searched: true };
  const chosenIndex = legal.findIndex((u) => {
    const v = carrier(u);
    return remaining.length === 1 ? finalBit(v) === want : half3(v).bits === want;
  });
  return {
    considered,
    legal,
    chosen: chosenIndex >= 0 ? legal[chosenIndex] : null,
    chosenIndex,
    searched: true,
  };
}

export function needsOwnerData(speaker: Speaker, owner: Speaker, mode: Mode, remainingBits: number): boolean {
  return speaker === owner && mode === 'DATA' && remainingBits > 0;
}

export interface EncodeTurn {
  speaker: Speaker;
  intent: string;
  role: 'PEER' | 'OWNER_SKIP' | 'OWNER_DATA';
  outcome: Outcome;
  mode: Mode | null;
  bits: string;
  remaining: number | null;
  utterance: string;
  c6: number | null;
  examined: number;
  legal: number;
  searched: boolean;
}

export type EncodeResult =
  | { kind: 'UUID'; machine: Machine; snaps: Snapshot[]; turns: EncodeTurn[]; payload: string }
  | { kind: 'NO_CANDIDATE'; machine: Machine; snaps: Snapshot[]; turns: EncodeTurn[]; index: number; wanted: string; role: EncodeTurn['role'] }
  | { kind: 'INCOMPLETE'; machine: Machine; snaps: Snapshot[]; turns: EncodeTurn[]; have: number };

export function encodeFromSets(sets: readonly (readonly string[])[]): EncodeResult {
  const m = fresh();
  const snaps: Snapshot[] = [];
  snaps.push(process(m, 'A', PROBE_EXAMPLE));
  snaps.push(process(m, 'B', ACK_EXAMPLE));
  snaps.push(process(m, 'A', START_128));
  const turns: EncodeTurn[] = [];
  let remaining = PAYLOAD;
  for (let i = 0; i < INTENTS.length; i++) {
    if (remaining.length === 0) break;
    const intent = INTENTS[i];
    const owner = m.frame?.owner ?? 'A';
    const mode = m.frame?.mode ?? 'SKIP';
    const remBits = m.frame?.remaining ?? remaining.length;
    const data = needsOwnerData(intent.speaker, owner, mode, remBits);
    const role: EncodeTurn['role'] =
      intent.speaker !== owner ? 'PEER' : data ? 'OWNER_DATA' : 'OWNER_SKIP';
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
    return { kind: 'INCOMPLETE', machine: m, snaps, turns, have: PAYLOAD.length - remaining.length };
  }
  snaps.push(process(m, 'A', FINISH));
  return { kind: 'UUID', machine: m, snaps, turns, payload: PAYLOAD };
}

export function tally(turns: readonly EncodeTurn[]) {
  const data = turns.filter((t) => t.role === 'OWNER_DATA');
  const hits = data.filter((t) => t.outcome === 'BODY_DATA');
  return {
    body: turns.length,
    owner: turns.filter((t) => t.role !== 'PEER').length,
    peer: turns.filter((t) => t.role === 'PEER').length,
    ownerSkip: turns.filter((t) => t.role === 'OWNER_SKIP').length,
    dataOpportunities: data.length,
    dataSuccesses: hits.length,
    chat: turns.filter((t) => t.outcome === 'CHAT').length,
    searches: data.length,
    maxExamined: hits.reduce((n, t) => Math.max(n, t.examined), 0),
    meanExamined: hits.length ? hits.reduce((n, t) => n + t.examined, 0) / hits.length : 0,
    peerDigits: turns.filter((t) => t.role === 'PEER' && /[0-9]/.test(t.utterance)).length,
  };
}
