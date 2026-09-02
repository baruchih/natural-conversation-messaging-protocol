/**
 * NCMP-V4-UUID. Experimental. Not frozen.
 * One fixed 128-bit UUID through locked Profile 0.
 * No new semantics. k = 50. Do not enlarge. Do not change half3.
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

export {
  ACK_EXAMPLE,
  BATCH,
  FINISH,
  PROBE_EXAMPLE,
  START_128,
  carrier,
  fresh,
  intentPrompt,
  parseCandidates,
  process,
  promptIsBlind,
};

/** Declared before the run. Do not change after seeing a miss. */
export const UUID = '7c3e9a12-8b4f-4d26-a1e0-5f8c2d9b6e04';

export function uuidToBits(uuid: string): string {
  const hex = uuid.replace(/-/g, '').toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) throw new Error('uuid');
  return [...hex].map((c) => parseInt(c, 16).toString(2).padStart(4, '0')).join('');
}

export function bitsToUuid(bits: string): string | null {
  if (bits.length !== 128 || /[^01]/.test(bits)) return null;
  const hex = bits.match(/.{4}/g)!.map((b) => parseInt(b, 2).toString(16)).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export const PAYLOAD = uuidToBits(UUID);

export function nextSymbol(remaining: string): string | null {
  if (remaining.length === 0) return null;
  if (remaining.length === 1) return remaining;
  if (remaining.startsWith('11')) return '11';
  if (remaining.startsWith('10')) return '10';
  if (remaining.startsWith('0')) return '0';
  return null;
}

export function symbolCount(payload: string): number {
  let n = 0;
  let rest = payload;
  while (rest.length > 0) {
    const s = nextSymbol(rest);
    if (s === null) throw new Error('payload');
    n += 1;
    rest = rest.slice(s.length);
  }
  return n;
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
}

export function selectAny(candidates: readonly string[]): Selection {
  const considered = uniqueInOrder(candidates).slice(0, BATCH);
  const legal = considered.filter(turnOk);
  return { considered, legal, chosen: legal[0] ?? null, chosenIndex: legal.length ? 0 : -1 };
}

export function selectOwnerData(candidates: readonly string[], remaining: string): Selection {
  const want = nextSymbol(remaining);
  const considered = uniqueInOrder(candidates).slice(0, BATCH);
  const legal = considered.filter(turnOk);
  if (want === null) return { considered, legal, chosen: null, chosenIndex: -1 };
  const chosenIndex = legal.findIndex((u) => {
    const v = carrier(u);
    return remaining.length === 1 ? finalBit(v) === want : half3(v).bits === want;
  });
  return { considered, legal, chosen: chosenIndex >= 0 ? legal[chosenIndex] : null, chosenIndex };
}

/**
 * Declared before generation. Unused stay unused.
 * Do not add after a miss.
 */
export const INTENTS: readonly { speaker: Speaker; text: string }[] = [
  { speaker: 'A', text: 'Ask if they still want to do the weekend hike.' },
  { speaker: 'B', text: 'Say Saturday morning still works if they leave early.' },
  { speaker: 'A', text: 'Ask whether they prefer the lake loop or the ridge.' },
  { speaker: 'B', text: 'Say the ridge is quieter even if it is a bit steeper.' },
  { speaker: 'A', text: 'Ask what they want to pack for lunch.' },
  { speaker: 'B', text: 'Say bread, fruit, and something warm in a flask.' },
  { speaker: 'A', text: 'Ask if they should bring an extra layer this time.' },
  { speaker: 'B', text: 'Say yes, the wind picks up once they clear the trees.' },
  { speaker: 'A', text: 'Ask who is driving to the trailhead.' },
  { speaker: 'B', text: 'Say they can drive if the other person handles the map.' },
  { speaker: 'A', text: 'Ask what time they should meet at the lot.' },
  { speaker: 'B', text: 'Suggest meeting before the lot fills up.' },
  { speaker: 'A', text: 'Ask if they reserved a parking spot.' },
  { speaker: 'B', text: 'Say they did not, so they should not linger.' },
  { speaker: 'A', text: 'Ask whether the trail report mentioned mud.' },
  { speaker: 'B', text: 'Say the lower path was wet after the last rain.' },
  { speaker: 'A', text: 'Ask if boots are enough or if they need gaiters.' },
  { speaker: 'B', text: 'Say boots should be fine if they stay on the main path.' },
  { speaker: 'A', text: 'Ask who is bringing the small first aid kit.' },
  { speaker: 'B', text: 'Say they already tossed it in the backpack.' },
  { speaker: 'A', text: 'Ask if they charged the camera.' },
  { speaker: 'B', text: 'Say they did, and there is still room on the card.' },
  { speaker: 'A', text: 'Ask whether to print the map or just use the phone.' },
  { speaker: 'B', text: 'Say print a spare in case the signal drops.' },
  { speaker: 'A', text: 'Ask if they told anyone their expected return.' },
  { speaker: 'B', text: 'Say they sent a note to be back before dark.' },
  { speaker: 'A', text: 'Ask what they want to do if the fog sits on the ridge.' },
  { speaker: 'B', text: 'Say turn around at the overlook and keep the day easy.' },
  { speaker: 'A', text: 'Ask if they packed enough water.' },
  { speaker: 'B', text: 'Say two bottles each and a filter just in case.' },
  { speaker: 'A', text: 'Ask whether the dogs are coming.' },
  { speaker: 'B', text: 'Say not this time, the rocks get sharp near the top.' },
  { speaker: 'A', text: 'Ask if they want coffee before they leave town.' },
  { speaker: 'B', text: 'Say the place by the station opens early enough.' },
  { speaker: 'A', text: 'Ask what they thought of the last climb there.' },
  { speaker: 'B', text: 'Say the last mile felt longer than it looked.' },
  { speaker: 'A', text: 'Ask if the switchbacks were as bad as people said.' },
  { speaker: 'B', text: 'Say they were fine once they found a rhythm.' },
  { speaker: 'A', text: 'Ask whether they saw anyone else on the trail.' },
  { speaker: 'B', text: 'Say a pair of runners and then it got quiet.' },
  { speaker: 'A', text: 'Ask if the view from the bench was worth the stop.' },
  { speaker: 'B', text: 'Say yes, they could see the lake and the far farms.' },
  { speaker: 'A', text: 'Ask what scared them on that last descent.' },
  { speaker: 'B', text: 'Say loose gravel near the creek crossing.' },
  { speaker: 'A', text: 'Ask if they want to try a different crossing this time.' },
  { speaker: 'B', text: 'Say the upstream stones looked more stable.' },
  { speaker: 'A', text: 'Ask whether they should eat at the overlook or wait.' },
  { speaker: 'B', text: 'Say eat there, the wind is usually milder at noon.' },
  { speaker: 'A', text: 'Ask if they remembered the little tarp.' },
  { speaker: 'B', text: 'Say it is rolled under the sweater in the pack.' },
  { speaker: 'A', text: 'Ask what they want for dinner after they get back.' },
  { speaker: 'B', text: 'Say something simple in town, nothing fancy.' },
  { speaker: 'A', text: 'Ask if the noodle place is still open late.' },
  { speaker: 'B', text: 'Say it should be, unless the kitchen closes early.' },
  { speaker: 'A', text: 'Ask whether they want to invite the others.' },
  { speaker: 'B', text: 'Say keep it small this week and see them later.' },
  { speaker: 'A', text: 'Ask what they will do with the leftover fruit.' },
  { speaker: 'B', text: 'Say pack it for the drive home.' },
  { speaker: 'A', text: 'Ask if their knees felt alright last time.' },
  { speaker: 'B', text: 'Say mostly, after they slowed down on the way down.' },
  { speaker: 'A', text: 'Ask whether they want poles this time.' },
  { speaker: 'B', text: 'Say one pair is enough to share on the steep bits.' },
  { speaker: 'A', text: 'Ask if they checked the weather again this morning.' },
  { speaker: 'B', text: 'Say a light shower after lunch, then it clears.' },
  { speaker: 'A', text: 'Ask what they will do if it rains harder.' },
  { speaker: 'B', text: 'Say cut the loop short and head for the cafe.' },
  { speaker: 'A', text: 'Ask if they like that cafe or just tolerate it.' },
  { speaker: 'B', text: 'Say the coffee is fine and the windows fog up nicely.' },
  { speaker: 'A', text: 'Ask whether they want to stay overnight nearby.' },
  { speaker: 'B', text: 'Say not this time, they both have to be back.' },
  { speaker: 'A', text: 'Ask who is feeding the cat.' },
  { speaker: 'B', text: 'Say the neighbor already has a key.' },
  { speaker: 'A', text: 'Ask if they should leave a light on at the house.' },
  { speaker: 'B', text: 'Say yes, the hall one on the timer.' },
  { speaker: 'A', text: 'Ask what music they want in the car.' },
  { speaker: 'B', text: 'Say the quiet playlist, nothing too loud that early.' },
  { speaker: 'A', text: 'Ask if they need cash for the lot.' },
  { speaker: 'B', text: 'Say the machine takes a card now.' },
  { speaker: 'A', text: 'Ask whether they packed sunscreen.' },
  { speaker: 'B', text: 'Say a small tube in the side pocket.' },
  { speaker: 'A', text: 'Ask if they want to photograph the old fence again.' },
  { speaker: 'B', text: 'Say only if the light is as good as last autumn.' },
  { speaker: 'A', text: 'Ask what they regretted not bringing last time.' },
  { speaker: 'B', text: 'Say a dry pair of socks, obviously.' },
  { speaker: 'A', text: 'Ask if they put those socks in this time.' },
  { speaker: 'B', text: 'Say two pairs, they learned.' },
  { speaker: 'A', text: 'Ask whether the creek will be high.' },
  { speaker: 'B', text: 'Say probably, after a week of rain uphill.' },
  { speaker: 'A', text: 'Ask if they told work they might be slow to reply.' },
  { speaker: 'B', text: 'Say they set an away note until Sunday night.' },
  { speaker: 'A', text: 'Ask what they want to talk about on the walk.' },
  { speaker: 'B', text: 'Say nothing planned, just whatever comes up.' },
  { speaker: 'A', text: 'Ask if they are actually looking forward to it.' },
  { speaker: 'B', text: 'Say yes, more than they expected this week.' },
  { speaker: 'A', text: 'Ask whether they should leave a bit earlier than planned.' },
  { speaker: 'B', text: 'Say yes, the roadwork near the bridge is still there.' },
  { speaker: 'A', text: 'Ask if they want to stop for the view on the drive.' },
  { speaker: 'B', text: 'Say only on the way back, if they still have light.' },
  { speaker: 'A', text: 'Ask what they will do with the photos later.' },
  { speaker: 'B', text: 'Say dump them on the laptop and pick a few.' },
  { speaker: 'A', text: 'Ask if they want to try the longer loop next month.' },
  { speaker: 'B', text: 'Say maybe, if this one feels easy enough.' },
  { speaker: 'A', text: 'Ask whether they packed the little stove.' },
  { speaker: 'B', text: 'Say no, it is not that kind of day.' },
  { speaker: 'A', text: 'Ask if they want tea at the top anyway.' },
  { speaker: 'B', text: 'Say the flask tea will have to do.' },
  { speaker: 'A', text: 'Ask what they think of starting before sunrise.' },
  { speaker: 'B', text: 'Say that is too keen for this weekend.' },
  { speaker: 'A', text: 'Ask if they slept alright last night.' },
  { speaker: 'B', text: 'Say well enough, once the street got quiet.' },
  { speaker: 'A', text: 'Ask whether they want a bigger breakfast.' },
  { speaker: 'B', text: 'Say toast and fruit is enough if they eat on the trail.' },
  { speaker: 'A', text: 'Ask if they locked the back door.' },
  { speaker: 'B', text: 'Say they did, twice, they always do.' },
  { speaker: 'A', text: 'Ask what they will tell people about the day.' },
  { speaker: 'B', text: 'Say it was quiet and the ridge was worth it.' },
  { speaker: 'A', text: 'Ask if they want to do this more often.' },
  { speaker: 'B', text: 'Say yes, if the weeks stay this crowded.' },
  { speaker: 'A', text: 'Ask whether they should set a reminder for next time.' },
  { speaker: 'B', text: 'Say they will put it on the calendar tonight.' },
  { speaker: 'A', text: 'Ask if they are ready to head out.' },
  { speaker: 'B', text: 'Say almost, just grabbing the keys.' },
  { speaker: 'A', text: 'Ask if they want to fill the tank on the way.' },
  { speaker: 'B', text: 'Say there is enough if they do not detour.' },
  { speaker: 'A', text: 'Ask whether the mountain road is still closed.' },
  { speaker: 'B', text: 'Say it reopened yesterday according to the sign.' },
  { speaker: 'A', text: 'Ask if they packed the paper map in the door pocket.' },
  { speaker: 'B', text: 'Say it is under the registration card.' },
  { speaker: 'A', text: 'Ask what they want to listen to after the quiet playlist.' },
  { speaker: 'B', text: 'Say whatever news is on is fine later.' },
  { speaker: 'A', text: 'Ask if they should text when they start the climb.' },
  { speaker: 'B', text: 'Say only if they have a bar at the gate.' },
  { speaker: 'A', text: 'Ask whether the gate is still a self-close.' },
  { speaker: 'B', text: 'Say yes, and it sticks if you rush it.' },
  { speaker: 'A', text: 'Ask if they remember the muddy bend after the gate.' },
  { speaker: 'B', text: 'Say they do, they almost lost a shoe there.' },
  { speaker: 'A', text: 'Ask what they will do at the first fork.' },
  { speaker: 'B', text: 'Say stay left unless the tape is up again.' },
  { speaker: 'A', text: 'Ask if they want a photo at the painted rock.' },
  { speaker: 'B', text: 'Say a quick one, then keep moving.' },
  { speaker: 'A', text: 'Ask whether they heard the creek from the lot last time.' },
  { speaker: 'B', text: 'Say yes, it was louder than the road.' },
  { speaker: 'A', text: 'Ask if they want to count the switchbacks again.' },
  { speaker: 'B', text: 'Say no, that made the climb feel longer.' },
  { speaker: 'A', text: 'Ask what they will do if a group is sitting on the bench.' },
  { speaker: 'B', text: 'Say wait a minute or stand at the rail.' },
  { speaker: 'A', text: 'Ask if they brought the extra hair tie.' },
  { speaker: 'B', text: 'Say it is on the pack strap already.' },
  { speaker: 'A', text: 'Ask whether they want gloves for the windy bit.' },
  { speaker: 'B', text: 'Say the thin ones, not the winter pair.' },
  { speaker: 'A', text: 'Ask if they should take the short spur to the cairn.' },
  { speaker: 'B', text: 'Say only if they still have time after lunch.' },
  { speaker: 'A', text: 'Ask what they thought of the last cairn photo.' },
  { speaker: 'B', text: 'Say it was crooked, they can do better.' },
  { speaker: 'A', text: 'Ask if they want to name this loop something.' },
  { speaker: 'B', text: 'Say not really, the ridge already has a name.' },
  { speaker: 'A', text: 'Ask whether they felt the altitude last time.' },
  { speaker: 'B', text: 'Say a little, they just slowed the talking.' },
  { speaker: 'A', text: 'Ask if they want to start stretching in the lot.' },
  { speaker: 'B', text: 'Say a minute for the calves is enough.' },
  { speaker: 'A', text: 'Ask what they will leave in the car.' },
  { speaker: 'B', text: 'Say the heavy jacket and the extra bag.' },
  { speaker: 'A', text: 'Ask if they locked the glove box.' },
  { speaker: 'B', text: 'Say they never bother, there is nothing in it.' },
  { speaker: 'A', text: 'Ask whether they want a sandwich at the cafe after.' },
  { speaker: 'B', text: 'Say if they are still hungry, otherwise just coffee.' },
  { speaker: 'A', text: 'Ask if they should call about Sunday plans now.' },
  { speaker: 'B', text: 'Say later, after they know how tired they are.' },
  { speaker: 'A', text: 'Ask what they want to skip on the way home.' },
  { speaker: 'B', text: 'Say the scenic pullout if it is already dark.' },
  { speaker: 'A', text: 'Ask if they remembered the house key this time.' },
  { speaker: 'B', text: 'Say it is on the same ring as the car key.' },
  { speaker: 'A', text: 'Ask whether they want to stop for ice.' },
  { speaker: 'B', text: 'Say the freezer still has a bag.' },
  { speaker: 'A', text: 'Ask if they are happy with this as the plan.' },
  { speaker: 'B', text: 'Say yes, simple is what they needed.' },
  { speaker: 'A', text: 'Ask what they will do first when they get back.' },
  { speaker: 'B', text: 'Say shower, then the leftover soup.' },
  { speaker: 'A', text: 'Ask if they want to look at the map one more time.' },
  { speaker: 'B', text: 'Say they already know the turns by now.' },
  { speaker: 'A', text: 'Ask whether they packed the spare laces.' },
  { speaker: 'B', text: 'Say they are in the lid pocket with the tape.' },
  { speaker: 'A', text: 'Ask if the forecast still looks the same tonight.' },
  { speaker: 'B', text: 'Say it has not moved since they last checked.' },
  { speaker: 'A', text: 'Ask what they want to do if the lot is full.' },
  { speaker: 'B', text: 'Say park lower and walk the extra stretch.' },
  { speaker: 'A', text: 'Ask if they told the neighbor about the late return.' },
  { speaker: 'B', text: 'Say they left a note on the counter.' },
  { speaker: 'A', text: 'Ask whether they want hats for the ridge.' },
  { speaker: 'B', text: 'Say the light ones, not the winter wool.' },
  { speaker: 'A', text: 'Ask if they should bring the binoculars.' },
  { speaker: 'B', text: 'Say they add weight and they never use them.' },
  { speaker: 'A', text: 'Ask what they will skip at the shop later.' },
  { speaker: 'B', text: 'Say snacks, they already packed enough.' },
  { speaker: 'A', text: 'Ask if they want to set a turnaround time now.' },
  { speaker: 'B', text: 'Say mid afternoon, no heroics.' },
  { speaker: 'A', text: 'Ask whether they feel ready enough.' },
  { speaker: 'B', text: 'Say ready enough, which is the point.' },
  { speaker: 'A', text: 'Ask if they want one last look at the sky.' },
  { speaker: 'B', text: 'Say it looks clear enough to go.' },
  { speaker: 'A', text: 'Ask what they are most looking forward to seeing.' },
  { speaker: 'B', text: 'Say the lake from the bench, if the air is clean.' },
] as const;

export interface EncodeTurn {
  speaker: Speaker;
  intent: string;
  outcome: Outcome;
  mode: Mode | null;
  bits: string;
  remaining: number | null;
  utterance: string;
  c6: number | null;
  examined: number;
  legal: number;
}

export type EncodeResult =
  | { kind: 'UUID'; machine: Machine; snaps: Snapshot[]; turns: EncodeTurn[]; payload: string }
  | { kind: 'NO_CANDIDATE'; machine: Machine; snaps: Snapshot[]; turns: EncodeTurn[]; index: number; wanted: string }
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
    const needData = intent.speaker === owner && mode === 'DATA' && remaining.length > 0;
    const sel = needData ? selectOwnerData(sets[i] ?? [], remaining) : selectAny(sets[i] ?? []);
    if (sel.chosen === null) {
      return { kind: 'NO_CANDIDATE', machine: m, snaps, turns, index: i, wanted: needData ? nextSymbol(remaining) ?? remaining : '' };
    }
    const snap = process(m, intent.speaker, sel.chosen);
    turns.push({
      speaker: intent.speaker,
      intent: intent.text,
      outcome: snap.outcome,
      mode: snap.mode,
      bits: snap.bits,
      remaining: snap.remaining,
      utterance: sel.chosen,
      c6: carrier(sel.chosen),
      examined: sel.chosenIndex + 1,
      legal: sel.legal.length,
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
  const owner = 'A';
  return {
    body: turns.length,
    owner: turns.filter((t) => t.speaker === owner).length,
    peer: turns.filter((t) => t.speaker !== owner).length,
    ownerData: turns.filter((t) => t.speaker === owner && t.outcome === 'BODY_DATA').length,
    ownerSkip: turns.filter((t) => t.speaker === owner && t.outcome === 'BODY_SKIP').length,
    chat: turns.filter((t) => t.outcome === 'CHAT').length,
    searches: turns.length,
    maxExamined: turns.reduce((n, t) => Math.max(n, t.examined), 0),
    meanExamined: turns.length ? turns.reduce((n, t) => n + t.examined, 0) / turns.length : 0,
  };
}
