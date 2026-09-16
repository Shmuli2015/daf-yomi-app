import type { ComponentProps } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { ThemeMode } from '../theme';
import { DaySchedule, DEFAULT_SCHEDULES } from './notifications';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export function formatNotificationTime(h: number, m: number): string {
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function getThemeModeSettingDisplay(mode: ThemeMode): {
  icon: IoniconName;
  label: string;
} {
  if (mode === 'dark') return { icon: 'moon-outline', label: 'כהה' };
  if (mode === 'light') return { icon: 'sunny-outline', label: 'בהיר' };
  return { icon: 'contrast-outline', label: 'מערכת' };
}

export function parseDaySchedulesJson(json: string | null | undefined): DaySchedule[] {
  if (!json) return DEFAULT_SCHEDULES;
  try {
    return JSON.parse(json) as DaySchedule[];
  } catch {
    return DEFAULT_SCHEDULES;
  }
}

export function schedulesUseDefaultTimes(schedules: DaySchedule[]): boolean {
  const defaultHour = DEFAULT_SCHEDULES[0].hour;
  const defaultMinute = DEFAULT_SCHEDULES[0].minute;
  return schedules.every(schedule => schedule.hour === defaultHour && schedule.minute === defaultMinute);
}
