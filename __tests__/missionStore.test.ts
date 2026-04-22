import { act, renderHook } from '@testing-library/react-native';
import { useMissionStore } from '../src/store/missionStore';

beforeEach(() => {
  useMissionStore.setState({
    dailyMissions: [],
    currentIndex: 0,
    completedToday: 0,
    lastResetDate: null,
  });
});

describe('completeMission', () => {
  it('increments completedToday', () => {
    const { result } = renderHook(() => useMissionStore());
    act(() => result.current.completeMission());
    expect(result.current.completedToday).toBe(1);
  });

  it('advances currentIndex', () => {
    const { result } = renderHook(() => useMissionStore());
    act(() => result.current.completeMission());
    expect(result.current.currentIndex).toBe(1);
  });
});
