import { addDays, subDays } from 'date-fns';

export type DafDayStartMode = 'midnight' | 'custom_hour' | 'weekly';

export type DafDayStartDaySchedule = {
  hour: number;
  minute: number;
};

export type DafDayBoundarySettings = {
  daf_day_start_mode?: string | null;
  daf_day_start_hour?: number | null;
  daf_day_start_minute?: number | null;
  daf_day_start_schedules?: string | DafDayStartDaySchedule[] | null;
};

export const DAF_DAY_START_HOUR_MIN = 14;
export const DAF_DAY_START_HOUR_MAX = 23;
export const DAF_DAY_START_DEFAULT_HOUR = 20;
export const DAF_DAY_START_DEFAULT_MINUTE = 0;

export const DEFAULT_DAF_DAY_START_SCHEDULES: DafDayStartDaySchedule[] = Array.from(
  { length: 7 },
  () => ({ hour: DAF_DAY_START_DEFAULT_HOUR, minute: DAF_DAY_START_DEFAULT_MINUTE }),
);

export function normalizeDafDayStartMode(mode: string | null | undefined): DafDayStartMode {
  if (mode === 'custom_hour' || mode === 'weekly') return mode;
  return 'midnight';
}

export function clampDafDayStartTime(hour: number, minute: number): DafDayStartDaySchedule {
  const safeMinute = Number.isFinite(minute) ? Math.max(0, Math.min(59, Math.round(minute))) : 0;
  const safeHour = Number.isFinite(hour) ? Math.round(hour) : DAF_DAY_START_DEFAULT_HOUR;

  if (safeHour < DAF_DAY_START_HOUR_MIN) {
    return { hour: DAF_DAY_START_HOUR_MIN, minute: 0 };
  }
  if (safeHour > DAF_DAY_START_HOUR_MAX) {
    return { hour: DAF_DAY_START_HOUR_MAX, minute: 30 };
  }
  if (safeHour === DAF_DAY_START_HOUR_MAX && safeMinute > 30) {
    return { hour: DAF_DAY_START_HOUR_MAX, minute: 30 };
  }
  return { hour: safeHour, minute: safeMinute };
}

export function schedulesFromSingleTime(hour: number, minute: number): DafDayStartDaySchedule[] {
  const clamped = clampDafDayStartTime(hour, minute);
  return Array.from({ length: 7 }, () => ({ ...clamped }));
}

export function parseDafDayStartSchedules(
  raw: string | DafDayStartDaySchedule[] | null | undefined,
  fallbackHour: number = DAF_DAY_START_DEFAULT_HOUR,
  fallbackMinute: number = DAF_DAY_START_DEFAULT_MINUTE,
): DafDayStartDaySchedule[] {
  const fallback = schedulesFromSingleTime(fallbackHour, fallbackMinute);
  let parsed: unknown = raw;
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch {
      return fallback;
    }
  }
  if (!Array.isArray(parsed) || parsed.length !== 7) {
    return fallback;
  }
  return parsed.map((item, index) => {
    if (!item || typeof item !== 'object') return fallback[index];
    const hour = (item as DafDayStartDaySchedule).hour;
    const minute = (item as DafDayStartDaySchedule).minute;
    return clampDafDayStartTime(
      typeof hour === 'number' ? hour : fallback[index].hour,
      typeof minute === 'number' ? minute : fallback[index].minute,
    );
  });
}

export function atLocalNoon(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);
}

function resolveCustomStart(settings: DafDayBoundarySettings): DafDayStartDaySchedule {
  return clampDafDayStartTime(
    settings.daf_day_start_hour ?? DAF_DAY_START_DEFAULT_HOUR,
    settings.daf_day_start_minute ?? DAF_DAY_START_DEFAULT_MINUTE,
  );
}

export function resolveBoundaryForCivilDay(
  date: Date,
  settings: DafDayBoundarySettings,
): DafDayStartDaySchedule {
  const mode = normalizeDafDayStartMode(settings.daf_day_start_mode);
  if (mode === 'weekly') {
    const schedules = parseDafDayStartSchedules(
      settings.daf_day_start_schedules,
      settings.daf_day_start_hour ?? DAF_DAY_START_DEFAULT_HOUR,
      settings.daf_day_start_minute ?? DAF_DAY_START_DEFAULT_MINUTE,
    );
    return schedules[date.getDay()];
  }
  return resolveCustomStart(settings);
}

function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

function boundaryOnCivilDay(date: Date, time: DafDayStartDaySchedule): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.hour, time.minute, 0, 0);
}

export function getDafDayDate(now: Date, settings: DafDayBoundarySettings): Date {
  const mode = normalizeDafDayStartMode(settings.daf_day_start_mode);
  if (mode === 'midnight') {
    return atLocalNoon(now);
  }

  const { hour, minute } = resolveBoundaryForCivilDay(now, settings);
  const boundaryMinutes = hour * 60 + minute;
  if (minutesSinceMidnight(now) < boundaryMinutes) {
    return atLocalNoon(subDays(now, 1));
  }
  return atLocalNoon(now);
}

export function getNextDafDayBoundaryAt(now: Date, settings: DafDayBoundarySettings): Date {
  const mode = normalizeDafDayStartMode(settings.daf_day_start_mode);

  if (mode === 'midnight') {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
  }

  for (let offset = 0; offset < 8; offset++) {
    const day = addDays(now, offset);
    const time = resolveBoundaryForCivilDay(day, settings);
    const boundary = boundaryOnCivilDay(day, time);
    if (now.getTime() < boundary.getTime()) {
      return boundary;
    }
  }

  const fallback = resolveBoundaryForCivilDay(addDays(now, 1), settings);
  return addDays(boundaryOnCivilDay(now, fallback), 1);
}

export function getDafDayYesterday(now: Date, settings: DafDayBoundarySettings): Date {
  return atLocalNoon(subDays(getDafDayDate(now, settings), 1));
}
