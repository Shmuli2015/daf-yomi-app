import {
  atLocalNoon,
  clampDafDayStartTime,
  getDafDayDate,
  getNextDafDayBoundaryAt,
  normalizeDafDayStartMode,
  parseDafDayStartSchedules,
  schedulesFromSingleTime,
} from '../dafDayBoundary';

const weeklySettings = {
  daf_day_start_mode: 'weekly',
  daf_day_start_schedules: [
    { hour: 20, minute: 0 },
    { hour: 20, minute: 0 },
    { hour: 20, minute: 0 },
    { hour: 20, minute: 0 },
    { hour: 20, minute: 0 },
    { hour: 16, minute: 0 },
    { hour: 21, minute: 30 },
  ],
};

describe('dafDayBoundary', () => {
  describe('normalizeDafDayStartMode', () => {
    it('defaults unknown values to midnight', () => {
      expect(normalizeDafDayStartMode(undefined)).toBe('midnight');
      expect(normalizeDafDayStartMode(null)).toBe('midnight');
      expect(normalizeDafDayStartMode('sunset')).toBe('midnight');
    });

    it('accepts custom_hour and weekly', () => {
      expect(normalizeDafDayStartMode('custom_hour')).toBe('custom_hour');
      expect(normalizeDafDayStartMode('weekly')).toBe('weekly');
    });
  });

  describe('clampDafDayStartTime', () => {
    it('clamps below 14:00 up to 14:00', () => {
      expect(clampDafDayStartTime(13, 45)).toEqual({ hour: 14, minute: 0 });
    });

    it('clamps above 23:30 down to 23:30', () => {
      expect(clampDafDayStartTime(23, 45)).toEqual({ hour: 23, minute: 30 });
      expect(clampDafDayStartTime(24, 0)).toEqual({ hour: 23, minute: 30 });
    });

    it('keeps valid evening times', () => {
      expect(clampDafDayStartTime(20, 0)).toEqual({ hour: 20, minute: 0 });
      expect(clampDafDayStartTime(14, 30)).toEqual({ hour: 14, minute: 30 });
      expect(clampDafDayStartTime(16, 0)).toEqual({ hour: 16, minute: 0 });
    });
  });

  describe('parseDafDayStartSchedules', () => {
    it('falls back to a single time for invalid json', () => {
      expect(parseDafDayStartSchedules('not-json', 19, 0)).toEqual(schedulesFromSingleTime(19, 0));
    });

    it('clamps each day independently', () => {
      const parsed = parseDafDayStartSchedules([
        { hour: 20, minute: 0 },
        { hour: 12, minute: 0 },
        { hour: 20, minute: 0 },
        { hour: 20, minute: 0 },
        { hour: 20, minute: 0 },
        { hour: 16, minute: 0 },
        { hour: 23, minute: 59 },
      ]);
      expect(parsed[1]).toEqual({ hour: 14, minute: 0 });
      expect(parsed[5]).toEqual({ hour: 16, minute: 0 });
      expect(parsed[6]).toEqual({ hour: 23, minute: 30 });
    });
  });

  describe('getDafDayDate', () => {
    it('uses civil date for midnight mode', () => {
      const now = new Date(2026, 8, 22, 19, 30, 0);
      const result = getDafDayDate(now, { daf_day_start_mode: 'midnight' });
      expect(result).toEqual(atLocalNoon(now));
    });

    it('uses previous civil day before custom evening hour', () => {
      const now = new Date(2026, 8, 22, 19, 30, 0);
      const result = getDafDayDate(now, {
        daf_day_start_mode: 'custom_hour',
        daf_day_start_hour: 20,
        daf_day_start_minute: 0,
      });
      expect(result).toEqual(atLocalNoon(new Date(2026, 8, 21)));
    });

    it('uses current civil day at or after custom evening hour', () => {
      const now = new Date(2026, 8, 22, 20, 5, 0);
      const result = getDafDayDate(now, {
        daf_day_start_mode: 'custom_hour',
        daf_day_start_hour: 20,
        daf_day_start_minute: 0,
      });
      expect(result).toEqual(atLocalNoon(now));
    });

    it('handles 23:30 boundary', () => {
      const before = new Date(2026, 8, 22, 23, 29, 0);
      const after = new Date(2026, 8, 22, 23, 30, 0);
      const settings = {
        daf_day_start_mode: 'custom_hour',
        daf_day_start_hour: 23,
        daf_day_start_minute: 30,
      };
      expect(getDafDayDate(before, settings)).toEqual(atLocalNoon(new Date(2026, 8, 21)));
      expect(getDafDayDate(after, settings)).toEqual(atLocalNoon(after));
    });

    it('uses Friday schedule before and after the Friday hour', () => {
      const fridayBefore = new Date(2026, 8, 25, 15, 30, 0);
      const fridayAfter = new Date(2026, 8, 25, 16, 5, 0);
      expect(getDafDayDate(fridayBefore, weeklySettings)).toEqual(atLocalNoon(new Date(2026, 8, 24)));
      expect(getDafDayDate(fridayAfter, weeklySettings)).toEqual(atLocalNoon(fridayAfter));
    });

    it('uses Motzei Shabbat schedule on Saturday', () => {
      const shabbatBefore = new Date(2026, 8, 26, 21, 0, 0);
      const shabbatAfter = new Date(2026, 8, 26, 21, 30, 0);
      expect(getDafDayDate(shabbatBefore, weeklySettings)).toEqual(atLocalNoon(new Date(2026, 8, 25)));
      expect(getDafDayDate(shabbatAfter, weeklySettings)).toEqual(atLocalNoon(shabbatAfter));
    });
  });

  describe('getNextDafDayBoundaryAt', () => {
    it('returns next midnight in midnight mode', () => {
      const now = new Date(2026, 8, 22, 19, 30, 0);
      const next = getNextDafDayBoundaryAt(now, { daf_day_start_mode: 'midnight' });
      expect(next).toEqual(new Date(2026, 8, 23, 0, 0, 0, 0));
    });

    it('returns tonight custom hour when still before it', () => {
      const now = new Date(2026, 8, 22, 19, 30, 0);
      const next = getNextDafDayBoundaryAt(now, {
        daf_day_start_mode: 'custom_hour',
        daf_day_start_hour: 20,
        daf_day_start_minute: 0,
      });
      expect(next).toEqual(new Date(2026, 8, 22, 20, 0, 0, 0));
    });

    it('returns tomorrow custom hour when already past it', () => {
      const now = new Date(2026, 8, 22, 20, 5, 0);
      const next = getNextDafDayBoundaryAt(now, {
        daf_day_start_mode: 'custom_hour',
        daf_day_start_hour: 20,
        daf_day_start_minute: 0,
      });
      expect(next).toEqual(new Date(2026, 8, 23, 20, 0, 0, 0));
    });

    it('returns Friday 16:00 from Thursday after the weekday hour', () => {
      const thursdayAfter = new Date(2026, 8, 24, 20, 5, 0);
      expect(getNextDafDayBoundaryAt(thursdayAfter, weeklySettings)).toEqual(
        new Date(2026, 8, 25, 16, 0, 0, 0),
      );
    });

    it('returns Saturday 21:30 after Friday hour has passed', () => {
      const fridayAfter = new Date(2026, 8, 25, 16, 5, 0);
      expect(getNextDafDayBoundaryAt(fridayAfter, weeklySettings)).toEqual(
        new Date(2026, 8, 26, 21, 30, 0, 0),
      );
    });
  });
});
