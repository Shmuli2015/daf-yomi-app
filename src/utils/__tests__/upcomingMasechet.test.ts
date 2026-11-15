import { getUpcomingMasechetInfo } from '../upcomingMasechet';
import * as dafYomiModule from '../dafYomi';

describe('upcomingMasechet', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('detects when a new masechet starts on the same day', () => {
    jest.spyOn(dafYomiModule, 'getDafByDate').mockImplementation((date: Date) => {
      const isStartDay = date.getDate() >= 10;
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
    expect(info?.status).toBe('starting_today');
  });

  it('detects when a new masechet started yesterday', () => {
    jest.spyOn(dafYomiModule, 'getDafByDate').mockImplementation((date: Date) => {
      const isAfterOrOn10 = date.getDate() >= 10;
      return {
        masechet: isAfterOrOn10 ? 'שבת' : 'ברכות',
        masechetEn: isAfterOrOn10 ? 'Shabbat' : 'Berakhot',
        daf: isAfterOrOn10 ? 'דף ג' : 'דף סד',
        dafNumOnly: isAfterOrOn10 ? 'ג' : 'סד',
        dafEn: isAfterOrOn10 ? '3a' : '64b',
        dafNum: isAfterOrOn10 ? (date.getDate() === 10 ? 2 : 3) : 64,
        amud: 'a',
        fullText: 'text',
        dateString: '2026-03-11',
      };
    });

    const currentDate = new Date(2026, 2, 11, 12, 0, 0);
    const info = getUpcomingMasechetInfo(currentDate, 6);

    expect(info).not.toBeNull();
    expect(info?.masechetHe).toBe('שבת');
    expect(info?.status).toBe('just_started');
    expect(info?.daysSinceStart).toBe(1);
  });

  it('detects when a new masechet started 2 days ago', () => {
    jest.spyOn(dafYomiModule, 'getDafByDate').mockImplementation((date: Date) => {
      const isAfterOrOn10 = date.getDate() >= 10;
      return {
        masechet: isAfterOrOn10 ? 'שבת' : 'ברכות',
        masechetEn: isAfterOrOn10 ? 'Shabbat' : 'Berakhot',
        daf: isAfterOrOn10 ? 'דף ד' : 'דף סד',
        dafNumOnly: isAfterOrOn10 ? 'ד' : 'סד',
        dafEn: isAfterOrOn10 ? '4a' : '64b',
        dafNum: isAfterOrOn10 ? (date.getDate() === 10 ? 2 : 4) : 64,
        amud: 'a',
        fullText: 'text',
        dateString: '2026-03-12',
      };
    });

    const currentDate = new Date(2026, 2, 12, 12, 0, 0);
    const info = getUpcomingMasechetInfo(currentDate, 6);

    expect(info).not.toBeNull();
    expect(info?.masechetHe).toBe('שבת');
    expect(info?.status).toBe('just_started');
    expect(info?.daysSinceStart).toBe(2);
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
    expect(info?.status).toBe('upcoming');
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
