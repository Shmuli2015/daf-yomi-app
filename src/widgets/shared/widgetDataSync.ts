import { Platform } from 'react-native';
import { getDafByDate, getDateStr } from '../../utils/dafYomi';
import { getAllRecords, updateDailyRecord, initDB } from '../../db/database';
import type { DafYomiWidgetProps } from '../android/DafYomiWidget';

export async function getWidgetData(): Promise<DafYomiWidgetProps> {
  try {
    initDB();
  } catch {}

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
    const React = await import('react');

    const data = await getWidgetData();

    await requestWidgetUpdate({
      widgetName: 'DafYomiWidget',
      renderWidget: () => React.default.createElement(DafYomiWidget, data),
      widgetNotFound: () => {},
    });
  } catch (e) {
    console.warn('[Widget] syncWidgetData failed:', e);
  }
}
