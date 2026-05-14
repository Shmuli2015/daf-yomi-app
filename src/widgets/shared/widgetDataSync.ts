import { createElement } from 'react';
import { Appearance, Platform } from 'react-native';
import { getDafByDate, getDateStr } from '../../utils/dafYomi';
import { getAllRecords, updateDailyRecord, initDB, getSettings } from '../../db/database';
import type { ThemeMode, ThemeScheme } from '../../theme';
import { resolveThemeScheme } from '../../theme';
import type { DafYomiWidgetProps } from '../android/DafYomiWidget';

function resolveWidgetColorScheme(): ThemeScheme {
  try {
    initDB();
    const settings = getSettings();
    const raw = settings.theme_mode ?? 'system';
    const mode = (['system', 'light', 'dark'].includes(raw) ? raw : 'system') as ThemeMode;
    const system = (Appearance.getColorScheme() || 'dark') as ThemeScheme;
    return resolveThemeScheme(mode, system);
  } catch {
    return 'dark';
  }
}

export async function getWidgetData(): Promise<DafYomiWidgetProps> {
  try {
    initDB();
  } catch {}

  const themeScheme = resolveWidgetColorScheme();

  const today = new Date();
  const dateStr = getDateStr(today);
  const dafInfo = getDafByDate(today);
  const history = getAllRecords();
  const todayRecord = history.find((r) => r.date === dateStr);
  const isLearned = todayRecord?.status === 'learned';

  const sortedLearned = history
    .filter((r) => r.status === 'learned')
    .sort((a, b) => b.date.localeCompare(a.date));

  let streak = 0;
  const checkDate = new Date(today);
  checkDate.setHours(0, 0, 0, 0);

  for (const record of sortedLearned) {
    const checkDateStr = getDateStr(checkDate);
    if (record.date === checkDateStr) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return {
    masechet: dafInfo.masechet,
    daf: dafInfo.daf,
    isLearned,
    streak,
    themeScheme,
  };
}

export async function markLearnedFromWidget(): Promise<void> {
  try {
    initDB();
  } catch {}

  const today = new Date();
  const dateStr = getDateStr(today);
  const dafInfo = getDafByDate(today);
  updateDailyRecord(dateStr, dafInfo.masechet, dafInfo.daf, 'learned');
}

export async function syncWidgetData(): Promise<void> {
  if (Platform.OS !== 'android') return;

  try {
    const { requestWidgetUpdate } = await import('react-native-android-widget');
    const { DafYomiWidget } = await import('../android/DafYomiWidget');

    const data = await getWidgetData();

    await requestWidgetUpdate({
      widgetName: 'DafYomiWidget',
      renderWidget: () => createElement(DafYomiWidget, data),
      widgetNotFound: () => {},
    });
  } catch (e) {
    console.warn('[Widget] syncWidgetData failed:', e);
  }
}
