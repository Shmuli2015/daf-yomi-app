import { HDate } from '@hebcal/core';
import { getHebrewDayEventInfo } from '../hebrewCalendarEvents';

describe('hebrewCalendarEvents', () => {
  it('detects Rosh Chodesh correctly', () => {
    const hd = new HDate(1, 1, 5785);
    const info = getHebrewDayEventInfo(hd);
    expect(info.isRoshChodesh).toBe(true);
    expect(info.eventName).toContain('ראש חודש');
    expect(info.badgeLabel).toBe('ר״ח');
  });

  it('detects Shabbat and formats Parshat HaShavua', () => {
    const bereshitShabbat = new HDate(24, 7, 5785);
    const info = getHebrewDayEventInfo(bereshitShabbat);
    expect(info.isShabbat).toBe(true);
    expect(info.eventName).toBe('שבת פרשת בראשית');
    expect(info.badgeLabel).toBe('שבת');

    const noachShabbat = new HDate(1, 8, 5785);
    const noachInfo = getHebrewDayEventInfo(noachShabbat);
    expect(noachInfo.isShabbat).toBe(true);
    expect(noachInfo.eventName).toBe('שבת פרשת נח');
  });

  it('detects Major Jewish Holidays with full spelling', () => {
    const pesach = new HDate(15, 1, 5785);
    const pesachInfo = getHebrewDayEventInfo(pesach);
    expect(pesachInfo.isHoliday).toBe(true);
    expect(pesachInfo.eventName).toBe('פסח א׳');
    expect(pesachInfo.badgeLabel).toBe('מועד');

    const sukkot = new HDate(15, 7, 5785);
    const sukkotInfo = getHebrewDayEventInfo(sukkot);
    expect(sukkotInfo.isHoliday).toBe(true);
    expect(sukkotInfo.eventName).toBe('סוכות א׳');
    expect(sukkotInfo.badgeLabel).toBe('מועד');
  });

  it('normalizes Shabbat HaChodesh with full spelling', () => {
    const shabbatHaChodesh = new HDate(29, 12, 5785);
    const info = getHebrewDayEventInfo(shabbatHaChodesh);
    expect(info.isHoliday).toBe(true);
    expect(info.eventName).toContain('שבת החודש');
  });

  it('marks 22 Tishrei strictly as Simchat Torah in Israel and 23 Tishrei as ordinary day', () => {
    const tishrei22 = new HDate(22, 7, 5785);
    const info22 = getHebrewDayEventInfo(tishrei22);
    expect(info22.isHoliday).toBe(true);
    expect(info22.eventName).toBe('שמחת תורה');

    const tishrei23 = new HDate(23, 7, 5785);
    const info23 = getHebrewDayEventInfo(tishrei23);
    expect(info23.isHoliday).toBe(false);
    expect(info23.eventName).toBeUndefined();
  });

  it('does not treat diaspora second day of yom tov as holidays in Israel', () => {
    const pesachDay8 = new HDate(22, 1, 5785);
    const infoPesach8 = getHebrewDayEventInfo(pesachDay8);
    expect(infoPesach8.isHoliday).toBe(false);

    const shavuotDay2 = new HDate(7, 3, 5785);
    const infoShavuot2 = getHebrewDayEventInfo(shavuotDay2);
    expect(infoShavuot2.isHoliday).toBe(false);
  });

  it('treats 1 Elul as Rosh Chodesh and ignores Maaser Behemah', () => {
    const elul1 = new HDate(1, 6, 5785);
    const info = getHebrewDayEventInfo(elul1);
    expect(info.isHoliday).toBe(false);
    expect(info.isRoshChodesh).toBe(true);
    expect(info.eventName).toContain('ראש חודש');
    expect(info.badgeLabel).toBe('ר״ח');
  });

  it('ignores Yom Kippur Katan on Erev Rosh Chodesh', () => {
    const erevRoshChodeshSivan = new HDate(29, 2, 5785);
    const info = getHebrewDayEventInfo(erevRoshChodeshSivan);
    expect(info.isHoliday).toBe(false);
    expect(info.eventName).toBeUndefined();
  });

  it('returns empty event for a regular weekday', () => {
    const weekday = new HDate(10, 2, 5785);
    const info = getHebrewDayEventInfo(weekday);
    if (weekday.getDay() !== 6) {
      expect(info.isShabbat).toBe(false);
      expect(info.isRoshChodesh).toBe(false);
    }
  });
});
