import { clampReaderViewMode } from '../readerViewMode';

describe('settings clamps', () => {
  it('clamps reader view mode', () => {
    expect(clampReaderViewMode('chavruta')).toBe('chavruta');
    expect(clampReaderViewMode('pdf')).toBe('classic');
  });
});
