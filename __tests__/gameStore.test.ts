import { act, renderHook } from '@testing-library/react-native';
import { useGameStore } from '../src/store/gameStore';

beforeEach(() => {
  useGameStore.setState({
    totalXP: 0,
    activeDinoId: 'rex',
    dinoMood: 'happy',
    streak: 0,
    gamesWon: 0,
    lastOpenedAt: null,
    sessionStartedAt: null,
  });
});

describe('addXP', () => {
  it('increments totalXP', () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.addXP(50));
    expect(result.current.totalXP).toBe(50);
  });

  it('returns the new total', () => {
    const { result } = renderHook(() => useGameStore());
    let newTotal: number = 0;
    act(() => { newTotal = result.current.addXP(100); });
    expect(newTotal).toBe(100);
  });
});

describe('recordGameWin', () => {
  it('increments gamesWon', () => {
    const { result } = renderHook(() => useGameStore());
    act(() => result.current.recordGameWin());
    expect(result.current.gamesWon).toBe(1);
  });
});
