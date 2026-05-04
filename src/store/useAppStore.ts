import { create } from 'zustand';
import { getDailyRecord, getAllRecords, updateDailyRecord, getSettings, updateSettings, DailyRecord, SettingsRecord } from '../db/database';
import { getDafByDate } from '../utils/dafYomi';

interface AppState {
  currentDate: Date;
  todayRecord: DailyRecord | null;
  history: DailyRecord[];
  settings: SettingsRecord | null;
  todayDafText: string;
  todayMasechet: string;
  todayDafNum: string;
  streak: number;
  
  loadInitialData: () => void;
  markTodayAsLearned: () => void;
  toggleTodayAsLearned: () => void;
  updateNotificationSettings: (hour: number, minute: number, shabbat: boolean) => void;
}

function calculateStreak(records: DailyRecord[]): number {
  if (records.length === 0) return 0;
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Sort by date descending
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  
  let expectedDate = new Date(today);
  
  // Check if today is learned
  const todayRecord = sorted.find(r => r.date === today.toISOString().split('T')[0]);
  if (!todayRecord || todayRecord.status !== 'learned') {
    // If today is not learned, streak could be ongoing from yesterday
    expectedDate.setDate(expectedDate.getDate() - 1);
  }

  for (let i = 0; i < sorted.length; i++) {
    const recordDate = new Date(sorted[i].date);
    if (sorted[i].status !== 'learned') {
        if(sorted[i].date === today.toISOString().split('T')[0]) continue;
        break;
    }
    
    // Allow if it matches expected date
    if (recordDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
      streak++;
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else if (recordDate < expectedDate) {
      break; // Gap found
    }
  }
  return streak;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentDate: new Date(),
  todayRecord: null,
  history: [],
  settings: null,
  todayDafText: '',
  todayMasechet: '',
  todayDafNum: '',
  streak: 0,

  loadInitialData: () => {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const dafInfo = getDafByDate(today);
    
    const record = getDailyRecord(dateStr);
    const history = getAllRecords();
    const settings = getSettings();
    const streak = calculateStreak(history);

    set({
      currentDate: today,
      todayRecord: record,
      history,
      settings,
      todayDafText: dafInfo.fullText,
      todayMasechet: dafInfo.masechet,
      todayDafNum: dafInfo.daf,
      streak
    });
  },

  markTodayAsLearned: () => {
    const { currentDate, todayMasechet, todayDafNum } = get();
    const dateStr = currentDate.toISOString().split('T')[0];
    
    updateDailyRecord(dateStr, todayMasechet, todayDafNum, 'learned');
    
    // Refresh data
    get().loadInitialData();
  },

  toggleTodayAsLearned: () => {
    const { currentDate, todayMasechet, todayDafNum, todayRecord } = get();
    const dateStr = currentDate.toISOString().split('T')[0];
    const newStatus = todayRecord?.status === 'learned' ? 'missed' : 'learned';
    
    updateDailyRecord(dateStr, todayMasechet, todayDafNum, newStatus);
    
    // Refresh data
    get().loadInitialData();
  },

  updateNotificationSettings: (hour: number, minute: number, shabbat: boolean) => {
    updateSettings(hour, minute, shabbat);
    get().loadInitialData();
  }
}));
