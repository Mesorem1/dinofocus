import React from 'react';
import { render } from '@testing-library/react-native';
import { XPBar } from '../../src/components/XPBar';

describe('XPBar', () => {
  it('renders level label', () => {
    const { getByText } = render(<XPBar totalXP={0} />);
    expect(getByText('Niveau 1')).toBeTruthy();
  });

  it('shows level 2 at 100 XP', () => {
    const { getByText } = render(<XPBar totalXP={100} />);
    expect(getByText('Niveau 2')).toBeTruthy();
  });
});
