import { getUpcomingMasechetInfo } from '../upcomingMasechet';
import * as dafYomiModule from '../dafYomi';

describe('upcomingMasechet', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('detects when a new masechet starts on the same day', () => {
    jest.spyOn(dafYomiModule, 'getDafByDate').mockImplementation((date: Date) => {
      const isStartDay = date.getDate() === 10;
      return {
        masechet: isStartDay ? 'שבת' : 'ברכות',
        masechetEn: isStartDay ? 'Shabbat' : 'Berakhot',
        daf: isStartDay ? 'דף ב' : 'דף סד',
        dafNumOnly: isStartDay ? 'ב' : 'סד',
        dafEn: isStartDay ? '2a' : '64b',
        dafNum: isStartDay ? 2 : 64,
        amud: 'a',
        fullText: isStartDay ? 'שבת דף ב' : 'ברכות דף סד',
        dateString: '2026-03-10',
      };
    });

    const currentDate = new Date(2026, 2, 10, 12, 0, 0);
    const info = getUpcomingMasechetInfo(currentDate, 6);

    expect(info).not.toBeNull();
    expect(info?.masechetHe).toBe('שבת');
    expect(info?.daysLeft).toBe(0);
  });

  it('detects when a new masechet starts in 3 days', () => {
    jest.spyOn(dafYomiModule, 'getDafByDate').mockImplementation((date: Date) => {
      const isStartDay = date.getDate() >= 13;
      return {
        masechet: isStartDay ? 'עירובין' : 'שבת',
        masechetEn: isStartDay ? 'Eruvin' : 'Shabbat',
        daf: isStartDay ? 'דף ב' : 'דף קנג',
        dafNumOnly: isStartDay ? 'ב' : 'קנג',
        dafEn: isStartDay ? '2a' : '153b',
        dafNum: isStartDay ? 2 : 153,
        amud: 'a',
        fullText: isStartDay ? 'עירובין דף ב' : 'שבת דף קנג',
        dateString: '2026-03-13',
      };
    });

    const currentDate = new Date(2026, 2, 10, 12, 0, 0);
    const info = getUpcomingMasechetInfo(currentDate, 6);

    expect(info).not.toBeNull();
    expect(info?.masechetHe).toBe('עירובין');
    expect(info?.daysLeft).toBe(3);
  });

  it('returns null when no masechet transition occurs within window', () => {
    jest.spyOn(dafYomiModule, 'getDafByDate').mockReturnValue({
      masechet: 'ברכות',
      masechetEn: 'Berakhot',
      daf: 'דף י',
      dafNumOnly: 'י',
      dafEn: '10a',
      dafNum: 10,
      amud: 'a',
      fullText: 'ברכות דף י',
      dateString: '2026-03-10',
    });

    const currentDate = new Date(2026, 2, 10, 12, 0, 0);
    const info = getUpcomingMasechetInfo(currentDate, 6);

    expect(info).toBeNull();
  });
});
