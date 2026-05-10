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
  updateNotificationSettings: (hour: number, minute: number, showSecular: boolean, showConfetti: boolean) => void;
}

function calculateStreak(records: DailyRecord[]): number {
  const learnedRecords = records
    .filter(r => r.status === 'learned')
    .sort((a, b) => b.date.localeCompare(a.date));

  if (learnedRecords.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = getDateStr(today);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);
  const yesterdayStr = getDateStr(yesterday);

  // If the latest learned record is not today or yesterday, streak is 0
  const latestDateStr = learnedRecords[0].date;
  if (latestDateStr !== todayStr && latestDateStr !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let currentDateToCheck = new Date(latestDateStr);
  currentDateToCheck.setHours(0, 0, 0, 0);

  for (const record of learnedRecords) {
    if (record.date === getDateStr(currentDateToCheck)) {
      streak++;
      currentDateToCheck.setDate(currentDateToCheck.getDate() - 1);
    } else {
      break;
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

  updateNotificationSettings: (hour: number, minute: number, showSecular: boolean, showConfetti: boolean) => {
    updateSettings(hour, minute, showSecular, showConfetti);
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
