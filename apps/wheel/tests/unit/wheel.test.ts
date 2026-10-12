import { describe, expect, it } from 'vitest';
import { randomInt, shuffle } from '../../src/lib/random';
import { makeTeams, teamsForSize } from '../../src/lib/teams';
import {
  entriesFromHash,
  entriesToHash,
  MAX_ENTRIES,
  normalize,
  numberRange,
  parseEntries,
  planSpin,
  segmentAtPointer,
  segmentColor,
} from '../../src/lib/wheel';

describe('entries', () => {
  it('turns the text box into a clean list', () => {
    expect(parseEntries('  Ann \n\n Bob\n  \nCem  ')).toEqual(['Ann', 'Bob', 'Cem']);
    expect(parseEntries('x\n'.repeat(MAX_ENTRIES + 20))).toHaveLength(MAX_ENTRIES);
  });

  it('survives the trip through a share link', () => {
    const entries = ['Zoë & Ana', 'Ben #1', 'Ćirić'];
    expect(entriesFromHash(entriesToHash(entries))).toEqual(entries);
    expect(entriesFromHash('#something-else')).toBeNull();
    expect(entriesFromHash('#entries=%E0%A4%A')).toBeNull(); // broken encoding
  });

  it('creates number ranges and refuses silly ones', () => {
    expect(numberRange(3, 6)).toEqual(['3', '4', '5', '6']);
    expect(() => numberRange(5, 1)).toThrow();
    expect(() => numberRange(1, 1000)).toThrow();
    expect(() => numberRange(1.5, 4)).toThrow();
  });
});

describe('wheel geometry', () => {
  it('finds the segment under the pointer', () => {
    // Not turned: segment 0 starts at the top, so the pointer sits at its very start.
    expect(segmentAtPointer(0, 4)).toBe(0);
    // Turned a little clockwise: the LAST segment moves under the pointer.
    expect(segmentAtPointer(0.1, 4)).toBe(3);
    expect(segmentAtPointer(-0.1, 4)).toBe(0);
    expect(normalize(-1)).toBeCloseTo(2 * Math.PI - 1);
  });

  it('always stops on the chosen winner, from any starting position', () => {
    for (let run = 0; run < 2000; run++) {
      const count = 2 + randomInt(60);
      const winner = randomInt(count);
      const start = (Math.random() - 0.5) * 100;
      const offset = 0.1 + 0.8 * Math.random();
      const end = planSpin(start, count, winner, offset, 5);
      expect(segmentAtPointer(end, count)).toBe(winner);
      expect(end).toBeGreaterThan(start + 5 * 2 * Math.PI - 1e-9); // spins forward, at least 5 turns
    }
  });

  it('never gives neighbouring segments the same colour', () => {
    for (let count = 2; count <= 40; count++) {
      for (let i = 0; i < count; i++) {
        expect(segmentColor(i, count)).not.toBe(segmentColor((i + 1) % count, count));
      }
    }
  });
});

describe('randomness', () => {
  it('picks every entry about equally often', () => {
    const counts = new Array(5).fill(0);
    for (let i = 0; i < 50_000; i++) counts[randomInt(5)]++;
    for (const count of counts) expect(count).toBeGreaterThan(9_000); // expected 10,000 each
  });

  it('shuffles without losing or duplicating anything', () => {
    const list = ['a', 'b', 'c', 'd', 'e'];
    expect(shuffle(list).sort()).toEqual(list);
  });
});

describe('teams', () => {
  it('splits names into teams whose sizes differ by at most one', () => {
    const names = Array.from({ length: 11 }, (_, i) => `P${i}`);
    const teams = makeTeams(names, 3);
    expect(teams).toHaveLength(3);
    expect(teams.map((team) => team.length).sort()).toEqual([3, 4, 4]);
    expect(teams.flat().sort()).toEqual([...names].sort());
  });

  it('never creates empty teams when there are more teams than people', () => {
    expect(makeTeams(['A', 'B'], 5)).toHaveLength(2);
  });

  it('works out the number of teams from a team size', () => {
    expect(teamsForSize(10, 3)).toBe(4);
    expect(teamsForSize(10, 5)).toBe(2);
    expect(teamsForSize(3, 10)).toBe(1);
  });
});
