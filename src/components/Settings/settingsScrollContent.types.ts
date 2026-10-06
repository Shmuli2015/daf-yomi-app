import type { ThemeMode } from '../../theme';
import type { ReaderTheme, ViewMode } from '../SefariaReader/ReaderToolbar';
import type { DafDayStartDaySchedule, DafDayStartMode } from '../../utils/dafDayBoundary';
import type { DaySchedule } from './Schedule/DayScheduleList';
import type { ExactAlarmStatus } from '../../utils/exactAlarm';
import type { NotificationPermissionStatus } from '../../utils/notificationPermission';
import type { SettingsScreenStyles } from './settingsScreenStyles';
import type {
  OfflinePrefetchProgress,
  OfflinePrefetchStatus,
} from '../../services/offlinePrefetch';
import type { OfflineMasechetTarget } from '../../hooks/useOfflinePrefetch';

export type SettingsNotificationsProps = {
  notificationsEnabled: boolean;
  onNotificationsToggle: (v: boolean) => void;
  exactAlarmStatus?: ExactAlarmStatus;
  onExactAlarmSettingsPress?: () => void;
  permissionStatus: NotificationPermissionStatus;
  onNotificationPermissionPress: () => void;
  notifMode: 'daily' | 'custom';
  onNotifModeChange: (mode: 'daily' | 'custom') => void;
  hour: number;
  minute: number;
  daySchedules: DaySchedule[];
  onDailyTimePress: () => void;
  onToggleDay: (index: number) => void;
  onEditDayTime: (index: number) => void;
  soundEnabled: boolean;
  onSoundToggle: (enabled: boolean) => void;
};

export type SettingsReaderProps = {
  readerViewMode: ViewMode;
  onReaderViewModePress: () => void;
  readerTheme: ReaderTheme;
  onReaderThemePress: () => void;
  gemaraNikud: boolean;
  onGemaraNikudToggle: (enabled: boolean) => void;
  showChavrutaNotes: boolean;
  onChavrutaNotesToggle: (enabled: boolean) => void;
  hapticsEnabled: boolean;
  onHapticsToggle: (enabled: boolean) => void;
  keepScreenAwake: boolean;
  onKeepScreenAwakeToggle: (enabled: boolean) => void;
  fontSize: number;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
};

export type SettingsDisplayProps = {
  themeMode: ThemeMode;
  onThemeModalOpen: () => void;
  dafDayStartMode: DafDayStartMode;
  dafDayStartHour: number;
  dafDayStartMinute: number;
  dafDayStartSchedules: DafDayStartDaySchedule[];
  onDafDayStartModeOpen: () => void;
  onDafDayStartTimeOpen: () => void;
  onEditDafDayStartDay: (index: number) => void;
  showSecularDate: boolean;
  onSecularDateToggle: (v: boolean) => void;
  showCalendarDaf: boolean;
  onCalendarDafToggle: (v: boolean) => void;
  showPersonalTrackBannerPref?: boolean;
  onPersonalTrackBannerToggle?: (v: boolean) => void;
  showConfettiPref: boolean;
  onConfettiToggle: (v: boolean) => void;
};

export type SettingsBackupDataProps = {
  lastBackupAt: string | null;
  onSaveBackupToFile?: () => void;
  onShareBackup?: () => void;
  onImportBackup?: () => void;
  onResetModalOpen: () => void;
};

export type SettingsOfflineProps = {
  dayCount: number;
  daysStatus: OfflinePrefetchStatus | null;
  dafYomiMasechet: OfflineMasechetTarget | null;
  personalMasechet: OfflineMasechetTarget | null;
  isPrefetching: boolean;
  prefetchProgress: OfflinePrefetchProgress | null;
  activeTargetLabel: string | null;
  offlinePrefetchStatusLabel?: string | null;
  storageSizeFormatted?: string;
  onDownloadDays: () => void;
  onDownloadMasechet: (masechetEn: string, masechetHe: string) => void;
  onCancelDownload: () => void;
  onClearCacheOpen?: () => void;
};

export type SettingsHelpUpdatesProps = {
  onGuideModalOpen: () => void;
  updateAutoPromptEnabled?: boolean;
  onUpdateAutoPromptToggle?: (enabled: boolean) => void;
  onCheckAppUpdate?: () => void;
  onShareDownloadLink?: () => void;
  onShowWhatsNew?: () => void;
  onEmailCopied: () => void;
};

export type SettingsDevProps = {
  showDevSection: boolean;
  scheduledCount: number;
  onTestNotification: () => void;
  onCheckScheduled: () => void;
  onProbeGithubRelease?: () => void;
};

export type SettingsScrollContentProps = {
  styles: SettingsScreenStyles;
  notifications: SettingsNotificationsProps;
  reader: SettingsReaderProps;
  display: SettingsDisplayProps;
  offline: SettingsOfflineProps;
  backupData: SettingsBackupDataProps;
  helpUpdates: SettingsHelpUpdatesProps;
  dev: SettingsDevProps;
};
