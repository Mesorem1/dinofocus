import { calculateLevel, xpForNextLevel, getUnlockedDinos } from '../src/utils/progression';
import { DINOS } from '../src/data/dinos';

describe('calculateLevel', () => {
  it('starts at level 1 with 0 XP', () => {
    expect(calculateLevel(0)).toBe(1);
  });
  it('reaches level 2 at 100 XP', () => {
    expect(calculateLevel(100)).toBe(2);
  });
  it('reaches level 3 at 300 XP (100 + 200)', () => {
    expect(calculateLevel(300)).toBe(3);
  });
  it('reaches level 4 at 650 XP (100 + 200 + 350)', () => {
    expect(calculateLevel(650)).toBe(4);
  });
});

describe('xpForNextLevel', () => {
  it('needs 100 XP to go from level 1 to 2', () => {
    expect(xpForNextLevel(1)).toBe(100);
  });
  it('needs 200 XP to go from level 2 to 3', () => {
    expect(xpForNextLevel(2)).toBe(200);
  });
});

describe('getUnlockedDinos', () => {
  it('only unlocks Rex at 0 XP', () => {
    const unlocked = getUnlockedDinos(0);
    expect(unlocked).toHaveLength(1);
    expect(unlocked[0].id).toBe('rex');
  });
  it('unlocks Brontosaure at 100 XP', () => {
    const unlocked = getUnlockedDinos(100);
    const ids = unlocked.map(d => d.id);
    expect(ids).toContain('bronto');
  });
});
