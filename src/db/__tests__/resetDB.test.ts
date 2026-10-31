jest.mock('../connection', () => ({
  db: {
    execSync: jest.fn(),
    getAllSync: jest.fn(() => []),
    getFirstSync: jest.fn(() => ({ user_version: 1 })),
    runSync: jest.fn(),
  },
}));

import { db } from '../connection';
import { resetDB } from '../init';
import { createDefaultSettingsRecord } from '../settings';

describe('resetDB', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (db.getAllSync as jest.Mock).mockReturnValue([]);
    (db.getFirstSync as jest.Mock).mockReturnValue({ user_version: 1 });
  });

  it('drops settings before initDB recreates the table', () => {
    resetDB();

    const statements = (db.execSync as jest.Mock).mock.calls.map((call) => String(call[0]));
    const dropSettingsIndex = statements.findIndex((sql) => sql === 'DROP TABLE IF EXISTS settings;');
    const createIndex = statements.findIndex((sql) =>
      sql.includes('CREATE TABLE IF NOT EXISTS settings'),
    );

    expect(statements).toEqual(
      expect.arrayContaining([
        'DROP TABLE IF EXISTS daily_daf;',
        'DROP TABLE IF EXISTS personal_track_daf;',
        'DROP TABLE IF EXISTS reader_position;',
        'DROP TABLE IF EXISTS settings;',
      ]),
    );
    expect(dropSettingsIndex).toBeGreaterThanOrEqual(0);
    expect(createIndex).toBeGreaterThan(dropSettingsIndex);
  });

  it('factory settings restore theme, reminder hour, daf-day start, and auto-backup', () => {
    const defaults = createDefaultSettingsRecord();
    expect(defaults.theme_mode).toBe('system');
    expect(defaults.notification_hour).toBe(7);
    expect(defaults.notification_minute).toBe(30);
    expect(defaults.daf_day_start_mode).toBe('midnight');
    expect(defaults.auto_backup_enabled).toBe(0);
    expect(defaults.auto_backup_file_uri).toBeNull();
  });
});
