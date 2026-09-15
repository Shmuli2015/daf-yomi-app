import {
  getMonthTractates,
  formatMonthTractatesSummary,
  formatMonthTractatesShort,
  getYearMonthsTractates,
} from '../monthTractates';

describe('monthTractates', () => {
  it('identifies a single tractate in a month', () => {
    const spans = getMonthTractates(8, 5787);
    expect(spans.length).toBe(1);
    expect(spans[0].masechet).toBe('בכורות');
    expect(spans[0].startDaf).toBe('כ״ד');
    expect(spans[0].endDaf).toBe('נ״ג');
    expect(spans[0].startDay).toBe(1);
    expect(spans[0].endDay).toBe(30);
  });

  it('identifies transition between two tractates in a month', () => {
    const spans = getMonthTractates(7, 5787);
    expect(spans.length).toBe(2);
    expect(spans[0].masechet).toBe('חולין');
    expect(spans[0].startDay).toBe(1);
    expect(spans[0].endDay).toBe(8);
    expect(spans[1].masechet).toBe('בכורות');
    expect(spans[1].startDay).toBe(9);
    expect(spans[1].endDay).toBe(30);
  });

  it('formats single tractate summary', () => {
    const spans = getMonthTractates(8, 5787);
    const summary = formatMonthTractatesSummary(spans);
    expect(summary).toBe('מסכת בכורות (דפים כ״ד - נ״ג)');
  });

  it('formats two tractates summary', () => {
    const spans = getMonthTractates(7, 5787);
    const summary = formatMonthTractatesSummary(spans);
    expect(summary).toBe('חולין (קל״ה - קמ״ב) • בכורות (ב׳ - כ״ג)');
  });

  it('formats short tractate names', () => {
    const single = getMonthTractates(8, 5787);
    expect(formatMonthTractatesShort(single)).toBe('מסכת בכורות');

    const two = getMonthTractates(7, 5787);
    expect(formatMonthTractatesShort(two)).toBe('חולין, בכורות');
  });

  it('returns empty string for empty spans', () => {
    expect(formatMonthTractatesSummary([])).toBe('');
    expect(formatMonthTractatesShort([])).toBe('');
  });

  it('returns mapped tractates for all months of a year', () => {
    const yearMap = getYearMonthsTractates(5787);
    expect(yearMap.has(7)).toBe(true);
    expect(yearMap.get(7)).toBe('חולין, בכורות');
    expect(yearMap.get(8)).toBe('בכורות');
  });
});
