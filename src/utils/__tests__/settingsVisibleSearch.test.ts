import { hasVisibleSettingsMatch } from '../settingsVisibleSearch';
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
});
