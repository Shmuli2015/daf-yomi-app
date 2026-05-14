import { create } from 'zustand';
import { getAllRecords, updateDailyRecord, batchUpdateDailyRecords, getSettings, updateSettings, updateThemeMode, DailyRecord, SettingsRecord } from '../db/database';
import { getDafByDate, getDateStr } from '../utils/dafYomi';
import { buildProgressCache, ProgressCache } from '../utils/progressCache';
import { syncWidgetData } from '../widgets/shared/widgetDataSync';

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
  setCurrentDate: (date: Date) => void;
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
    get().setCurrentDate(today);
  },

  setCurrentDate: (date: Date) => {
    const dateStr = getDateStr(date);
    const dafInfo = getDafByDate(date);

    let history = get().history;
    if (history.length === 0) {
      history = getAllRecords();
    }
    
    const settings = get().settings || getSettings();
    const cache = buildProgressCache(history);
    const record = history.find(r => r.date === dateStr) || null;

    set({
      currentDate: date,
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
    const history = getAllRecords();
    const cache = buildProgressCache(history);
    const dateStr = getDateStr(currentDate);
    const record = history.find(r => r.date === dateStr) || null;

    set({
      history,
      progressCache: cache,
      todayRecord: record,
      streak: cache.streak
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
    syncWidgetData().catch(() => {});
  },

  toggleAnyDafLearned: (dateStr: string, masechet: string, daf: string) => {
    const { history } = get();
    const existing = history.find(r => r.date === dateStr);
    const newStatus = existing?.status === 'learned' ? 'missed' : 'learned';
    
    updateDailyRecord(dateStr, masechet, daf, newStatus);

    get().refreshHistory();
    syncWidgetData().catch(() => {});
  },

  batchMarkDafim: (updates) => {
    batchUpdateDailyRecords(
      updates.map(u => ({ ...u, status: 'learned' as const }))
    );
    get().refreshHistory();
    syncWidgetData().catch(() => {});
  },

  batchUnmarkDafim: (updates) => {
    batchUpdateDailyRecords(
      updates.map(u => ({ ...u, status: 'missed' as const }))
    );
    get().refreshHistory();
    syncWidgetData().catch(() => {});
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
    syncWidgetData().catch(() => {});
  },

  clearAllHistory: () => {
    const { initDB } = require('../db/database');
    const SQLite = require('expo-sqlite');
    const db = SQLite.openDatabaseSync('dafYomi.db');
    db.runSync('DELETE FROM daily_daf');
    get().loadInitialData();
  }
}));
