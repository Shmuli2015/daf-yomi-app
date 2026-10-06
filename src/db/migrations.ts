import { db } from './connection';

export function migrateDailyDafColumns() {
  const dailyDafInfo: { name: string }[] = db.getAllSync('PRAGMA table_info(daily_daf);');
  const dailyDafColumns = dailyDafInfo.map(c => c.name);

  if (!dailyDafColumns.includes('percentage')) {
    db.execSync('ALTER TABLE daily_daf ADD COLUMN percentage INTEGER DEFAULT 0;');
  }
  if (!dailyDafColumns.includes('amud')) {
    db.execSync('ALTER TABLE daily_daf ADD COLUMN amud TEXT DEFAULT NULL;');
  }
  if (dailyDafColumns.includes('notes')) {
    db.execSync('ALTER TABLE daily_daf DROP COLUMN notes;');
  }
}

export function migratePersonalTrackColumns() {
  const personalDafInfo: { name: string }[] = db.getAllSync('PRAGMA table_info(personal_track_daf);');
  const personalDafColumns = personalDafInfo.map(c => c.name);

  if (!personalDafColumns.includes('amud')) {
    db.execSync('ALTER TABLE personal_track_daf ADD COLUMN amud TEXT DEFAULT NULL;');
  }
}

export function getSettingsColumnNames(): string[] {
  const tableInfo: { name: string }[] = db.getAllSync('PRAGMA table_info(settings);');
  return tableInfo.map((column) => column.name);
}

export function ensureReaderFontSizeColumn() {
  if (!getSettingsColumnNames().includes('reader_font_size')) {
    db.execSync('ALTER TABLE settings ADD COLUMN reader_font_size INTEGER DEFAULT 18;');
  }
}
