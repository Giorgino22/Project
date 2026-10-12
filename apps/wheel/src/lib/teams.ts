/** Splitting a list of names into random teams. */
import { randomInt, shuffle } from '@tools/shared/lib/random';

/**
 * Shuffles the names and deals them out like cards, one per team in turn, so team sizes
 * differ by at most one person.
 */
export function makeTeams(names: string[], teamCount: number, random: (max: number) => number = randomInt): string[][] {
  if (teamCount < 1) throw new RangeError('need at least one team');
  const teams: string[][] = Array.from({ length: Math.min(teamCount, Math.max(names.length, 1)) }, () => []);
  shuffle(names, random).forEach((name, index) => teams[index % teams.length]!.push(name));
  return teams;
}

/** "People per team" → number of teams (e.g. 10 people, 3 per team → 4 teams). */
export function teamsForSize(peopleCount: number, perTeam: number): number {
  return Math.max(1, Math.ceil(peopleCount / Math.max(1, perTeam)));
}
