export interface DailyRecord {
  id: number;
  date: string;
  masechet: string;
  daf: string;
  status: 'learned' | 'partial' | 'missed';
  percentage: number;
  amud: 'a' | 'b' | null;
  learnedAt: string;
}

export interface PersonalTrackRecord {
  id?: number;
  masechet: string;
  daf_num: number;
  status: 'learned' | 'partial';
  amud?: 'a' | 'b' | null;
  learnedAt: string;
}

export interface SettingsRecord {
  id: number;
  notification_hour: number;
  notification_minute: number;
  show_secular_date: number;
  show_confetti: number;
  notifications_enabled: number;
  notif_mode: string;
  day_schedules: string | null;
  theme_mode: string;
  last_update_check_at: string | null;
  dismissed_update_version: string | null;
  update_auto_prompt_enabled: number;
  study_link_mode: string;
  show_calendar_daf: number;
  dismissed_half_daf_tip: number;
  active_personal_masechet: string | null;
  show_personal_track_banner: number;
  reader_font_size: number;
  seen_app_version: string | null;
  reader_view_mode: string;
  show_chavruta_notes: number;
  gemara_nikud: number;
  haptics_enabled: number;
  keep_screen_awake: number;
  last_backup_at: string | null;
  notification_sound_enabled: number;
  daf_day_start_mode: string;
  daf_day_start_hour: number;
  daf_day_start_minute: number;
  daf_day_start_schedules: string | null;
  last_store_review_prompt_at: string | null;
  store_review_streak7_prompted: number;
  reader_theme: string;
}

export type DailyRecordInput = Omit<DailyRecord, 'id'>;
export type SettingsInput = Omit<SettingsRecord, 'id'>;

export interface FullBackupInput {
  records: DailyRecordInput[];
  settings: SettingsInput;
  personalTrackRecords?: PersonalTrackRecord[];
}
