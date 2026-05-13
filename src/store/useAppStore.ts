import { create } from 'zustand';
import { getAllRecords, updateDailyRecord, batchUpdateDailyRecords, getSettings, updateSettings, updateThemeMode, DailyRecord, SettingsRecord } from '../db/database';
import { getDafByDate, getDateStr } from '../utils/dafYomi';
import { buildProgressCache, ProgressCache } from '../utils/progressCache';

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
  progressCache: ProgressCache | null;
  isAppReady: boolean;
  
  loadInitialData: () => void;
  setAppReady: (ready: boolean) => void;
  refreshHistory: () => void;
  refreshSettings: () => void;
  markTodayAsLearned: () => void;
  toggleAnyDafLearned: (dateStr: string, masechet: string, daf: string) => void;
  batchMarkDafim: (updates: Array<{ dateStr: string; masechet: string; daf: string }>) => void;
  batchUnmarkDafim: (updates: Array<{ dateStr: string; masechet: string; daf: string }>) => void;
  updateNotificationSettings: (
    hour: number,
    minute: number,
    showSecular: boolean,
    showConfetti: boolean,
    notificationsEnabled: boolean,
    notifMode?: string,
    daySchedules?: string | null
  ) => void;

  updateThemeMode: (themeMode: string) => void;
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
  progressCache: null,
  isAppReady: false,

  setAppReady: (ready) => set({ isAppReady: ready }),

  loadInitialData: () => {
    const today = new Date();
    const dateStr = getDateStr(today);
    const dafInfo = getDafByDate(today);
    
    const history = getAllRecords();
    const settings = getSettings();
    const cache = buildProgressCache(history);

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
      streak: cache.streak,
      progressCache: cache
    });
  },

  refreshHistory: () => {
    const { currentDate } = get();
    const dateStr = getDateStr(currentDate);
    const history = getAllRecords();
    const cache = buildProgressCache(history);
    const record = history.find(r => r.date === dateStr) || null;

    set({
      todayRecord: record,
      history,
      streak: cache.streak,
      progressCache: cache
    });
  },

  refreshSettings: () => {
    const settings = getSettings();
    set({ settings });
  },

  markTodayAsLearned: () => {
    const { currentDate, todayMasechet, todayDafNum } = get();
    const dateStr = getDateStr(currentDate);
    
    updateDailyRecord(dateStr, todayMasechet, todayDafNum, 'learned');

    get().refreshHistory();
  },

  toggleAnyDafLearned: (dateStr: string, masechet: string, daf: string) => {
    const { history } = get();
    const existing = history.find(r => r.date === dateStr);
    const newStatus = existing?.status === 'learned' ? 'missed' : 'learned';
    
    updateDailyRecord(dateStr, masechet, daf, newStatus);

    get().refreshHistory();
  },

  batchMarkDafim: (updates) => {
    batchUpdateDailyRecords(
      updates.map(u => ({ ...u, status: 'learned' as const }))
    );
    get().refreshHistory();
  },

  batchUnmarkDafim: (updates) => {
    batchUpdateDailyRecords(
      updates.map(u => ({ ...u, status: 'missed' as const }))
    );
    get().refreshHistory();
  },

  updateNotificationSettings: (
    hour: number,
    minute: number,
    showSecular: boolean,
    showConfetti: boolean,
    notificationsEnabled: boolean,
    notifMode?: string,
    daySchedules?: string | null
  ) => {
    updateSettings(hour, minute, showSecular, showConfetti, notificationsEnabled, notifMode, daySchedules);
    get().refreshSettings();
  },

  updateThemeMode: (themeMode: string) => {
    updateThemeMode(themeMode);
    get().refreshSettings();
  },

  clearAllHistory: () => {
    const { initDB } = require('../db/database');
    const SQLite = require('expo-sqlite');
    const db = SQLite.openDatabaseSync('dafYomi.db');
    db.runSync('DELETE FROM daily_daf');
    get().loadInitialData();
  }
}));
