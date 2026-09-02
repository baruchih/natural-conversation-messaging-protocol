/**
 * Header budget. Characterization only.
 * header_cost(A, R) = ceil(log2 A) + ceil(log2 R)
 * Density 0.3 is an illustration, not a law.
 */
export const EVAL_C_ENCODABLE = [2, 10, 9] as const;
export const DENSITY_ILLUSTRATION = 0.3;

export function headerCost(actions: number, resources: number): number {
  if (!Number.isInteger(actions) || !Number.isInteger(resources) || actions < 1 || resources < 1) {
    throw new RangeError('actions and resources must be integers >= 1');
  }
  return Math.ceil(Math.log2(actions)) + Math.ceil(Math.log2(resources));
}

export function headerTurns(cost: number, density = DENSITY_ILLUSTRATION): number {
  if (!(density > 0)) throw new RangeError('density must be > 0');
  return cost / density;
}

export const TABLES = [
  { actions: 1, resources: 1, cost: 0 },
  { actions: 2, resources: 2, cost: 2 },
  { actions: 4, resources: 6, cost: 5 },
  { actions: 16, resources: 16, cost: 8 },
  { actions: 256, resources: 256, cost: 16 },
] as const;
