import { create } from 'zustand';
import { getAllRecords, getDailyRecord, updateDailyRecord, batchUpdateDailyRecords, getSettings, updateSettings, updateThemeMode, updateStudyLinkMode, setUpdateAutoPromptEnabled as persistUpdateAutoPromptSetting, setShowCalendarDaf as persistShowCalendarDaf, setDismissedHalfDafTip as persistDismissedHalfDafTip, importRecords, replaceAllRecords, importSettingsFromBackup, DailyRecord, SettingsRecord } from '../db/database';
import type { BackupData } from '../services/backup';
import { getDafByDate, getDateStr } from '../utils/dafYomi';
import { buildProgressCache, ProgressCache } from '../utils/progressCache';
import { resolveAmudMark, type AmudSide } from '../utils/dafStatus';

interface AppState {
  currentDate: Date;
  todayRecord: DailyRecord | null;
  history: DailyRecord[];
  settings: SettingsRecord | null;
  todayDafText: string;
  todayMasechet: string;
  todayDafNum: string;
  todaySefariaUrl: string;
  todayMasechetEn: string;
  todayDafNumValue: number;
  todayAmud: 'a' | 'b';
  streak: number;
  progressCache: ProgressCache | null;
  isAppReady: boolean;
  
  loadInitialData: () => void;
  setAppReady: (ready: boolean) => void;
  refreshHistory: () => void;
  refreshSettings: () => void;
  markTodayAsLearned: () => void;
  setDafStudyStatus: (
    dateStr: string,
    masechet: string,
    daf: string,
    status: 'learned' | 'partial' | 'missed'
  ) => void;
  markPartialAmud: (
    dateStr: string,
    masechet: string,
    daf: string,
    amud: AmudSide
  ) => void;
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
  updateStudyLinkMode: (mode: string) => void;
  setUpdateAutoPromptEnabled: (enabled: boolean) => void;
  setShowCalendarDafEnabled: (enabled: boolean) => void;
  dismissHalfDafTip: () => void;
  setCurrentDate: (date: Date) => void;
  importBackup: (data: BackupData, mode: 'merge' | 'replace') => void;
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
  todayMasechetEn: '',
  todayDafNumValue: 2,
  todayAmud: 'a',
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
      todayMasechetEn: dafInfo.masechetEn,
      todayDafNumValue: dafInfo.dafNum,
      todayAmud: dafInfo.amud,
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

    updateDailyRecord(dateStr, todayMasechet, todayDafNum, 'learned', 100, null);

    get().refreshHistory();
  },

  setDafStudyStatus: (dateStr, masechet, daf, status) => {
    updateDailyRecord(dateStr, masechet, daf, status, undefined, null);
    get().refreshHistory();
  },

  markPartialAmud: (dateStr, masechet, daf, amud) => {
    const existing = getDailyRecord(dateStr);
    const resolved = resolveAmudMark(existing, amud);
    updateDailyRecord(
      dateStr,
      masechet,
      daf,
      resolved.status,
      resolved.percentage,
      resolved.amud
    );
    get().refreshHistory();
  },

  toggleAnyDafLearned: (dateStr: string, masechet: string, daf: string) => {
    const { history } = get();
    const existing = history.find(r => r.date === dateStr);
    const newStatus =
      existing?.status === 'learned' || existing?.status === 'partial' ? 'missed' : 'learned';

    updateDailyRecord(dateStr, masechet, daf, newStatus, undefined, null);

    get().refreshHistory();
  },

  batchMarkDafim: (updates) => {
    batchUpdateDailyRecords(
      updates.map(u => ({ ...u, status: 'learned' as const, amud: null }))
    );
    get().refreshHistory();
  },

  batchUnmarkDafim: (updates) => {
    batchUpdateDailyRecords(
      updates.map(u => ({ ...u, status: 'missed' as const, amud: null }))
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

  updateStudyLinkMode: (mode: string) => {
    updateStudyLinkMode(mode);
    get().refreshSettings();
  },

  setUpdateAutoPromptEnabled: (enabled: boolean) => {
    persistUpdateAutoPromptSetting(enabled);
    get().refreshSettings();
  },

  setShowCalendarDafEnabled: (enabled: boolean) => {
    persistShowCalendarDaf(enabled);
    get().refreshSettings();
  },

  dismissHalfDafTip: () => {
    persistDismissedHalfDafTip();
    get().refreshSettings();
  },

  importBackup: (data, mode) => {
    if (mode === 'replace') {
      replaceAllRecords(data.records);
      importSettingsFromBackup(data.settings);
    } else {
      importRecords(data.records);
    }
    get().refreshHistory();
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
