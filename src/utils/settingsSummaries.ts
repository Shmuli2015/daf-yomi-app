import type { ThemeMode } from '../theme';
import type { ReaderTheme, ViewMode } from '../components/SefariaReader/ReaderToolbar';
import type { DafDayStartMode } from './dafDayBoundary';
import { formatLastBackupAt } from './backupReminder';
import { getReaderViewModeLabel } from './readerViewMode';
import { getReaderThemeLabel } from './readerTheme';

function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

function getThemeModeLabel(mode: ThemeMode): string {
  if (mode === 'dark') return 'כהה';
  if (mode === 'light') return 'בהיר';
  return 'מערכת';
}

function getDafDayStartLabel(
  mode: DafDayStartMode,
  hour: number,
  minute: number,
): string {
  if (mode === 'custom_hour') return `שעה קבועה (${formatTime(hour, minute)})`;
  if (mode === 'weekly') return 'לפי ימים';
  return 'בחצות';
}

export function buildNotificationsSummary(
  notificationsEnabled: boolean,
  notifMode: 'daily' | 'custom',
  hour: number,
  minute: number,
): string {
  if (!notificationsEnabled) return 'כבוי';
  if (notifMode === 'daily') return `יומי בשעה ${formatTime(hour, minute)}`;
  return 'לפי ימי השבוע';
}

export function buildReaderSummary(
  readerViewMode: ViewMode,
  readerTheme: ReaderTheme,
  fontSize: number,
): string {
  return `${getReaderViewModeLabel(readerViewMode)}, ${getReaderThemeLabel(readerTheme)}, גופן ${fontSize}`;
}

export function buildDisplaySummary(
  themeMode: ThemeMode,
  dafDayStartMode: DafDayStartMode,
  dafDayStartHour: number,
  dafDayStartMinute: number,
): string {
  return `${getThemeModeLabel(themeMode)}, החלפה ${getDafDayStartLabel(
    dafDayStartMode,
    dafDayStartHour,
    dafDayStartMinute,
  )}`;
}

export function buildOfflineSummary(
  statusLabel: string | null | undefined,
  storageSizeFormatted?: string,
): string {
  const base =
    statusLabel === 'הורד'
      ? '7 ימים מוכנים'
      : statusLabel === 'חלקי'
        ? 'הורדה חלקית'
        : 'הורדת ימים ומסכתות';
  if (storageSizeFormatted) return `${base} • ${storageSizeFormatted}`;
  return base;
}

export function buildBackupSummary(lastBackupAt: string | null): string {
  const backupFormatted = formatLastBackupAt(lastBackupAt);
  return backupFormatted ? 'מעודכן' : 'טרם גובה';
}

export function buildHelpSummary(appVersion?: string | null): string {
  return appVersion ? `גרסה ${appVersion} • מדריך ועזרה` : 'מדריך למשתמש ועזרה';
}
