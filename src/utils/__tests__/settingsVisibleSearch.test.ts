import {
  countVisibleSettingsMatches,
  getMatchingSectionKeys,
  hasVisibleSectionMatch,
  hasVisibleSettingsMatch,
} from '../settingsVisibleSearch';
import type { VisibleSettingsSearchContext } from '../settingsVisibleSearch';

const baseCtx: VisibleSettingsSearchContext = {
  notificationsEnabled: false,
  notifMode: 'daily',
  exactAlarmStatus: 'not_required',
  hasExactAlarmHandler: false,
  permissionStatus: 'undetermined',
  dafDayStartMode: 'midnight',
  hasPersonalTrack: true,
  hasSaveBackup: true,
  hasShareBackup: true,
  hasImportBackup: true,
  hasClearCache: true,
  hasOfflinePrefetch: true,
  hasAutoUpdate: true,
  hasCheckUpdate: true,
  hasWhatsNew: true,
  hasShareDownload: true,
  showDevSection: false,
};

describe('settingsVisibleSearch', () => {
  it('hides daf day time row when mode is midnight', () => {
    expect(hasVisibleSettingsMatch('שעת החלפת הדף', baseCtx)).toBe(false);
    expect(
      hasVisibleSettingsMatch('שעת החלפת הדף', {
        ...baseCtx,
        dafDayStartMode: 'custom_hour',
      }),
    ).toBe(true);
  });

  it('hides notification time when reminders are off', () => {
    expect(hasVisibleSettingsMatch('זמן ההתראה', baseCtx)).toBe(false);
    expect(
      hasVisibleSettingsMatch('זמן ההתראה', {
        ...baseCtx,
        notificationsEnabled: true,
        notifMode: 'daily',
      }),
    ).toBe(true);
  });

  it('hides auto update when not configured', () => {
    expect(
      hasVisibleSettingsMatch('התראות עדכון אוטומטיות', {
        ...baseCtx,
        hasAutoUpdate: false,
      }),
    ).toBe(false);
    expect(hasVisibleSettingsMatch('התראות עדכון אוטומטיות', baseCtx)).toBe(true);
  });

  it('counts visible matching settings correctly', () => {
    expect(countVisibleSettingsMatches('', baseCtx)).toBe(0);
    expect(countVisibleSettingsMatches('   ', baseCtx)).toBe(0);
    expect(countVisibleSettingsMatches('גיבוי', baseCtx)).toBeGreaterThan(0);
    expect(countVisibleSettingsMatches('xyznonexistentterm', baseCtx)).toBe(0);
  });

  it('shows offline prefetch in offline section when enabled', () => {
    expect(hasVisibleSectionMatch('ללא רשת', 'offline', baseCtx)).toBe(true);
    expect(hasVisibleSectionMatch('ללא רשת', 'backup_data', baseCtx)).toBe(false);
    expect(
      hasVisibleSettingsMatch('ללא רשת', {
        ...baseCtx,
        hasOfflinePrefetch: false,
      }),
    ).toBe(false);
  });

  it('shows clear cache in offline section', () => {
    expect(hasVisibleSectionMatch('מטמון', 'offline', baseCtx)).toBe(true);
    expect(hasVisibleSectionMatch('מטמון', 'backup_data', baseCtx)).toBe(false);
    expect(getMatchingSectionKeys('מטמון', baseCtx)).toEqual(['offline']);
  });

  it('matches sections independently for accordion filtering', () => {
    expect(hasVisibleSectionMatch('גיבוי', 'backup_data', baseCtx)).toBe(true);
    expect(hasVisibleSectionMatch('גיבוי', 'notifications', baseCtx)).toBe(false);
    expect(hasVisibleSectionMatch('ערכת קריאה', 'reader', baseCtx)).toBe(true);
    expect(hasVisibleSectionMatch('ערכת קריאה', 'display', baseCtx)).toBe(false);
    expect(getMatchingSectionKeys('גיבוי', baseCtx)).toEqual(['backup_data']);
    expect(getMatchingSectionKeys('מצב תצוגה', baseCtx)).toEqual(['display']);
  });
});

