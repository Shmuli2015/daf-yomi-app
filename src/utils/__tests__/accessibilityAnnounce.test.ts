const mockAnnounce = jest.fn();

jest.mock('react-native', () => ({
  AccessibilityInfo: {
    announceForAccessibility: (...args: unknown[]) => mockAnnounce(...args),
  },
}));

import { announceAccessibility } from '../accessibilityAnnounce';

describe('accessibilityAnnounce', () => {
  beforeEach(() => {
    mockAnnounce.mockClear();
  });

  it('calls AccessibilityInfo.announceForAccessibility with message', () => {
    announceAccessibility('דף ה נלמד');
    expect(mockAnnounce).toHaveBeenCalledWith('דף ה נלמד');
  });

  it('ignores empty strings or non-string inputs', () => {
    announceAccessibility('');
    announceAccessibility(null as any);
    announceAccessibility(undefined as any);
    expect(mockAnnounce).not.toHaveBeenCalled();
  });

  it('catches and ignores exceptions thrown by AccessibilityInfo', () => {
    mockAnnounce.mockImplementationOnce(() => {
      throw new Error('Native error');
    });
    expect(() => announceAccessibility('בדיקה')).not.toThrow();
  });
});
