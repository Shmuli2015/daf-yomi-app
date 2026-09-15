import { HDate, getHolidaysOnDate, flags, Sedra, Locale } from '@hebcal/core';

export interface HebrewDayEventInfo {
  isShabbat: boolean;
  isRoshChodesh: boolean;
  isHoliday: boolean;
  eventName?: string;
  badgeLabel?: string;
}

const NIKUD_REGEX = /[\u0591-\u05C7]/g;

function formatParshaName(raw: string): string {
  return raw
    .replace(/\u05BE/g, ' ')
    .replace(NIKUD_REGEX, '')
    .replace(/מצרע/g, 'מצורע')
    .replace(/חקת/g, 'חוקת')
    .replace(/נצבים/g, 'ניצבים')
    .replace(/בהעלתך/g, 'בהעלותך')
    .replace(/בחקתי/g, 'בחוקותי')
    .replace(/קדשים/g, 'קדושים')
    .replace(/פינחס/g, 'פנחס')
    .trim();
}

function normalizeEventName(raw: string): string {
  return raw
    .replace(NIKUD_REGEX, '')
    .replace(/\s+\d{4}$/, '')
    .replace(/סכות/g, 'סוכות')
    .replace(/יום כפור/g, 'יום כיפור')
    .replace(/שבת החדש/g, 'שבת החודש')
    .trim();
}

export function getHebrewDayEventInfo(hdate: HDate): HebrewDayEventInfo {
  const isShabbat = hdate.getDay() === 6;
  const isRoshChodesh = hdate.getDate() === 1 || hdate.getDate() === 30;

  const rawEvents = getHolidaysOnDate(hdate, true) || [];
  const traditionalEvents = rawEvents.filter(
    (evt) =>
      !(evt.getFlags() & flags.MODERN_HOLIDAY) &&
      !(evt.getFlags() & flags.YOM_KIPPUR_KATAN)
  );

  const uniqueEventNames = Array.from(
    new Set(
      traditionalEvents
        .map((evt) => normalizeEventName(evt.render('he')))
        .filter(Boolean)
    )
  );

  const holidayEvents = uniqueEventNames.filter(
    (name) =>
      !name.includes('ראש חודש') &&
      !name.includes('הבדלה') &&
      !name.includes('הדלקת נרות') &&
      !name.includes('כיפור קטן') &&
      !name.includes('כפור קטן') &&
      !name.includes('חג הבנות') &&
      !name.includes('סליחות') &&
      !name.includes('מעשר בהמה')
  );

  const roshChodeshEvent = uniqueEventNames.find((name) => name.includes('ראש חודש'));
  const isHoliday = holidayEvents.length > 0;

  let parshaName: string | undefined;
  if (isShabbat) {
    const sedra = new Sedra(hdate.getFullYear(), true);
    const lookup = sedra.lookup(hdate);
    if (lookup?.parsha && !lookup.chag) {
      parshaName = lookup.parsha
        .map((p) => formatParshaName(Locale.gettext(p, 'he')))
        .join(' - ');
    }
  }

  let eventName: string | undefined;
  if (hdate.getMonth() === 7 && hdate.getDate() === 22) {
    eventName = 'שמחת תורה';
  } else if (isHoliday) {
    if (isShabbat && parshaName) {
      eventName = `${holidayEvents[0]} (פרשת ${parshaName})`;
    } else {
      eventName = holidayEvents[0];
    }
  } else if (isShabbat && parshaName) {
    eventName = `שבת פרשת ${parshaName}`;
  } else if (isRoshChodesh) {
    eventName = roshChodeshEvent || 'ראש חודש';
  } else if (isShabbat) {
    eventName = 'שבת קודש';
  }

  let badgeLabel: string | undefined;
  if (isHoliday) {
    badgeLabel = 'מועד';
  } else if (isRoshChodesh) {
    badgeLabel = 'ר״ח';
  } else if (isShabbat) {
    badgeLabel = 'שבת';
  }

  return {
    isShabbat,
    isRoshChodesh,
    isHoliday,
    eventName,
    badgeLabel,
  };
}
