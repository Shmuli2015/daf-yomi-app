import {
  clampDafDayStartTime,
  normalizeDafDayStartMode,
  parseDafDayStartSchedules,
} from '../utils/dafDayBoundary';
import { clampReaderFontSize } from '../utils/readerFontSize';
import { clampReaderViewMode } from '../utils/readerViewMode';
import { db } from './connection';
import { getAllRecords } from './dailyRecords';
import { migrateDailyDafColumns, migratePersonalTrackColumns } from './migrations';
import { getPersonalTrackRecords } from './personalTrack';
import type { DailyRecordInput, FullBackupInput, SettingsInput } from './types';

function insertDailyRecord(record: DailyRecordInput) {
  db.runSync(
    'INSERT INTO daily_daf (date, masechet, daf, status, percentage, amud, learnedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      record.date,
      record.masechet,
      record.daf,
      record.status,
      record.percentage ?? 0,
      record.amud ?? null,
      record.learnedAt,
    ]
  );
}

function updateDailyRecordFromBackup(record: DailyRecordInput) {
  db.runSync(
    'UPDATE daily_daf SET masechet = ?, daf = ?, status = ?, percentage = ?, amud = ?, learnedAt = ? WHERE date = ?',
    [
      record.masechet,
      record.daf,
      record.status,
      record.percentage ?? 0,
      record.amud ?? null,
      record.learnedAt,
      record.date,
    ]
  );
}

export function replaceAllRecords(records: DailyRecordInput[]) {
  migrateDailyDafColumns();
  db.withTransactionSync(() => {
    db.runSync('DELETE FROM daily_daf');
    for (const record of records) {
      insertDailyRecord(record);
    }
  });
}

export function importRecords(records: DailyRecordInput[]) {
  migrateDailyDafColumns();
  db.withTransactionSync(() => {
    const existingByDate = new Map(getAllRecords().map((record) => [record.date, record]));
    for (const incoming of records) {
      const existing = existingByDate.get(incoming.date);
      if (!existing) {
        insertDailyRecord(incoming);
        existingByDate.set(incoming.date, {
          id: -1,
          date: incoming.date,
          masechet: incoming.masechet,
          daf: incoming.daf,
          status: incoming.status,
          percentage: incoming.percentage ?? 0,
          amud: incoming.amud ?? null,
          learnedAt: incoming.learnedAt,
        });
        continue;
      }

      const existingTime = Date.parse(existing.learnedAt);
      const incomingTime = Date.parse(incoming.learnedAt);
      const winner =
        Number.isFinite(incomingTime) &&
        (!Number.isFinite(existingTime) || incomingTime >= existingTime)
          ? incoming
          : {
              date: existing.date,
              masechet: existing.masechet,
              daf: existing.daf,
              status: existing.status,
              percentage: existing.percentage,
              amud: existing.amud,
              learnedAt: existing.learnedAt,
            };

      updateDailyRecordFromBackup(winner);
      existingByDate.set(incoming.date, {
        ...existing,
        masechet: winner.masechet,
        daf: winner.daf,
        status: winner.status,
        percentage: winner.percentage ?? 0,
        amud: winner.amud ?? null,
        learnedAt: winner.learnedAt,
      });
    }
  });
}

export function importFullBackupTransaction(data: FullBackupInput, mode: 'replace' | 'merge') {
  migrateDailyDafColumns();
  migratePersonalTrackColumns();
  db.withTransactionSync(() => {
    if (mode === 'replace') {
      db.runSync('DELETE FROM daily_daf');
      for (const record of data.records) {
        insertDailyRecord(record);
      }
      importSettingsFromBackup(data.settings);
      db.runSync('DELETE FROM personal_track_daf');
      const now = new Date().toISOString();
      for (const r of data.personalTrackRecords ?? []) {
        db.runSync(
          'INSERT INTO personal_track_daf (masechet, daf_num, status, amud, learnedAt) VALUES (?, ?, ?, ?, ?)',
          [r.masechet, r.daf_num, r.status, r.amud ?? null, r.learnedAt || now]
        );
      }
    } else {
      const existingByDate = new Map(getAllRecords().map((record) => [record.date, record]));
      for (const incoming of data.records) {
        const existing = existingByDate.get(incoming.date);
        if (!existing) {
          insertDailyRecord(incoming);
          existingByDate.set(incoming.date, {
            id: -1,
            date: incoming.date,
            masechet: incoming.masechet,
            daf: incoming.daf,
            status: incoming.status,
            percentage: incoming.percentage ?? 0,
            amud: incoming.amud ?? null,
            learnedAt: incoming.learnedAt,
          });
          continue;
        }

        const existingTime = Date.parse(existing.learnedAt);
        const incomingTime = Date.parse(incoming.learnedAt);
        const winner =
          Number.isFinite(incomingTime) &&
          (!Number.isFinite(existingTime) || incomingTime >= existingTime)
            ? incoming
            : {
                date: existing.date,
                masechet: existing.masechet,
                daf: existing.daf,
                status: existing.status,
                percentage: existing.percentage,
                amud: existing.amud,
                learnedAt: existing.learnedAt,
              };

        updateDailyRecordFromBackup(winner);
        existingByDate.set(incoming.date, {
          ...existing,
          masechet: winner.masechet,
          daf: winner.daf,
          status: winner.status,
          percentage: winner.percentage ?? 0,
          amud: winner.amud ?? null,
          learnedAt: winner.learnedAt,
        });
      }

      if (data.personalTrackRecords) {
        const now = new Date().toISOString();
        const existingPersonal = new Map(
          getPersonalTrackRecords().map((record) => [`${record.masechet}_${record.daf_num}`, record]),
        );
        for (const r of data.personalTrackRecords) {
          const key = `${r.masechet}_${r.daf_num}`;
          const existing = existingPersonal.get(key);
          if (!existing) {
            db.runSync(
              'INSERT INTO personal_track_daf (masechet, daf_num, status, amud, learnedAt) VALUES (?, ?, ?, ?, ?)',
              [r.masechet, r.daf_num, r.status, r.amud ?? null, r.learnedAt || now]
            );
            existingPersonal.set(key, {
              id: -1,
              masechet: r.masechet,
              daf_num: r.daf_num,
              status: r.status,
              amud: r.amud ?? null,
              learnedAt: r.learnedAt || now,
            });
          } else {
            const existingTime = Date.parse(existing.learnedAt);
            const incomingTime = Date.parse(r.learnedAt);
            const incomingWins =
              Number.isFinite(incomingTime) &&
              (!Number.isFinite(existingTime) || incomingTime >= existingTime);
            if (incomingWins) {
              db.runSync(
                'UPDATE personal_track_daf SET status = ?, amud = ?, learnedAt = ? WHERE masechet = ? AND daf_num = ?',
                [r.status, r.amud ?? null, r.learnedAt || now, r.masechet, r.daf_num]
              );
              existingPersonal.set(key, {
                ...existing,
                status: r.status,
                amud: r.amud ?? null,
                learnedAt: r.learnedAt || now,
              });
            }
          }
        }
      }

      if (data.settings.active_personal_masechet !== undefined) {
        db.runSync('UPDATE settings SET active_personal_masechet = ? WHERE id = 1', [
          data.settings.active_personal_masechet,
        ]);
      }
      if (data.settings.show_personal_track_banner !== undefined) {
        db.runSync('UPDATE settings SET show_personal_track_banner = ? WHERE id = 1', [
          (data.settings.show_personal_track_banner ?? 1) !== 0 ? 1 : 0,
        ]);
      }
    }
  });
}

export function importSettingsFromBackup(settings: SettingsInput) {
  const clampedStart = clampDafDayStartTime(
    settings.daf_day_start_hour,
    settings.daf_day_start_minute,
  );
  db.runSync(
    `UPDATE settings SET
      notification_hour = ?,
      notification_minute = ?,
      show_secular_date = ?,
      show_confetti = ?,
      notifications_enabled = ?,
      notif_mode = ?,
      day_schedules = ?,
      theme_mode = ?,
      last_update_check_at = ?,
      dismissed_update_version = ?,
      update_auto_prompt_enabled = ?,
      study_link_mode = ?,
      show_calendar_daf = ?,
      dismissed_half_daf_tip = ?,
      active_personal_masechet = ?,
      show_personal_track_banner = ?,
      reader_font_size = ?,
      seen_app_version = ?,
      reader_view_mode = ?,
      show_chavruta_notes = ?,
      gemara_nikud = ?,
      haptics_enabled = ?,
      keep_screen_awake = ?,
      notification_sound_enabled = ?,
      daf_day_start_mode = ?,
      daf_day_start_hour = ?,
      daf_day_start_minute = ?,
      daf_day_start_schedules = ?,
      last_store_review_prompt_at = ?,
      store_review_streak7_prompted = ?,
      reader_theme = ?
    WHERE id = 1`,
    [
      settings.notification_hour,
      settings.notification_minute,
      settings.show_secular_date,
      settings.show_confetti,
      settings.notifications_enabled,
      settings.notif_mode,
      settings.day_schedules,
      settings.theme_mode,
      settings.last_update_check_at,
      settings.dismissed_update_version,
      settings.update_auto_prompt_enabled,
      settings.study_link_mode,
      settings.show_calendar_daf,
      settings.dismissed_half_daf_tip,
      settings.active_personal_masechet,
      settings.show_personal_track_banner,
      clampReaderFontSize(settings.reader_font_size),
      settings.seen_app_version,
      clampReaderViewMode(settings.reader_view_mode),
      settings.show_chavruta_notes === 0 ? 0 : 1,
      settings.gemara_nikud === 0 ? 0 : 1,
      settings.haptics_enabled === 0 ? 0 : 1,
      settings.keep_screen_awake === 0 ? 0 : 1,
      settings.notification_sound_enabled === 0 ? 0 : 1,
      normalizeDafDayStartMode(settings.daf_day_start_mode),
      clampedStart.hour,
      clampedStart.minute,
      JSON.stringify(
        parseDafDayStartSchedules(
          settings.daf_day_start_schedules,
          clampedStart.hour,
          clampedStart.minute,
        ),
      ),
      settings.last_store_review_prompt_at ?? null,
      settings.store_review_streak7_prompted === 1 ? 1 : 0,
      settings.reader_theme || 'system',
    ]
  );
}
