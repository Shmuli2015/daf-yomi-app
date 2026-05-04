import { create } from 'zustand';
import { getDailyRecord, getAllRecords, updateDailyRecord, getSettings, updateSettings, DailyRecord, SettingsRecord } from '../db/database';
import { getDafByDate, getDateStr } from '../utils/dafYomi';

interface AppState {
  currentDate: Date;
  todayRecord: DailyRecord | null;
  history: DailyRecord[];
  settings: SettingsRecord | null;
  todayDafText: string;
  todayMasechet: string;
  todayDafNum: string;
  todaySefariaUrl: string;
  streak: number;
  
  loadInitialData: () => void;
  markTodayAsLearned: () => void;
  toggleAnyDafLearned: (dateStr: string, masechet: string, daf: string) => void;
  updateNotificationSettings: (hour: number, minute: number, shabbat: boolean) => void;
}

function calculateStreak(records: DailyRecord[]): number {
  if (records.length === 0) return 0;
  let streak = 0;
  const now = new Date();
  const todayStr = getDateStr(now);

  // Sort by date descending
  const sorted = [...records].sort((a, b) => b.date.localeCompare(a.date));
  
  let expectedDate = new Date(now);
  expectedDate.setHours(0, 0, 0, 0);
  
  // Check if today is learned
  const todayRecord = sorted.find(r => r.date === todayStr);
  if (!todayRecord || todayRecord.status !== 'learned') {
    // If today is not learned, streak could be ongoing from yesterday
    expectedDate.setDate(expectedDate.getDate() - 1);
  }

  for (let i = 0; i < sorted.length; i++) {
    const recordDate = new Date(sorted[i].date);
    if (sorted[i].status !== 'learned') {
        if(sorted[i].date === todayStr) continue;
        break;
    }
    
    // Allow if it matches expected date
    if (getDateStr(recordDate) === getDateStr(expectedDate)) {
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
  todaySefariaUrl: '',
  streak: 0,

  loadInitialData: () => {
    const today = new Date();
    const dateStr = getDateStr(today);
    const dafInfo = getDafByDate(today);
    
    const history = getAllRecords();
    const settings = getSettings();
    const streak = calculateStreak(history);
    
    // Find today's record from history for consistency
    const record = history.find(r => r.date === dateStr) || null;

    set({
      currentDate: today,
      todayRecord: record,
      history,
      settings,
      todayDafText: dafInfo.fullText,
      todayMasechet: dafInfo.masechet,
      todayDafNum: dafInfo.daf,
      todaySefariaUrl: dafInfo.sefariaUrl,
      streak
    });
  },

  markTodayAsLearned: () => {
    const { currentDate, todayMasechet, todayDafNum } = get();
    const dateStr = getDateStr(currentDate);
    
    updateDailyRecord(dateStr, todayMasechet, todayDafNum, 'learned');
    
    // Refresh data
    get().loadInitialData();
  },

  toggleAnyDafLearned: (dateStr: string, masechet: string, daf: string) => {
    const { history } = get();
    const existing = history.find(r => r.date === dateStr);
    const newStatus = existing?.status === 'learned' ? 'missed' : 'learned';
    
    updateDailyRecord(dateStr, masechet, daf, newStatus);
    
    // Refresh data
    get().loadInitialData();
  },

  updateNotificationSettings: (hour: number, minute: number, shabbat: boolean) => {
    updateSettings(hour, minute, shabbat);
    get().loadInitialData();
  },

  clearAllHistory: () => {
    const { initDB } = require('../db/database');
    const SQLite = require('expo-sqlite');
    const db = SQLite.openDatabaseSync('dafYomi.db');
    db.runSync('DELETE FROM daily_daf');
    get().loadInitialData();
  }
}));
