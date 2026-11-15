jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {},
      android: { package: 'com.masadaf.app' },
    },
  },
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

import {
  PUBLIC_APK_PACKAGE,
  STORE_MIGRATION_SNOOZE_MS,
  isStoreMigrationSnoozed,
  nextStoreMigrationSnoozeIso,
  resolveStoreMigrationMode,
} from '../storeMigration';

describe('resolveStoreMigrationMode', () => {
  it('shows the replace prompt for the public Android apk', () => {
    expect(
      resolveStoreMigrationMode({
        os: 'android',
        playStoreBuild: false,
        androidPackage: PUBLIC_APK_PACKAGE,
      }),
    ).toBe('replace');
  });

  it('hides the prompt on a store build with the same package', () => {
    expect(
      resolveStoreMigrationMode({
        os: 'android',
        playStoreBuild: true,
        androidPackage: PUBLIC_APK_PACKAGE,
      }),
    ).toBe('none');
  });

  it('hides the prompt on the debug package', () => {
    expect(
      resolveStoreMigrationMode({
        os: 'android',
        playStoreBuild: false,
        androidPackage: 'com.masadaf.app.debug',
      }),
    ).toBe('none');
  });

  it('hides the prompt off Android', () => {
    expect(
      resolveStoreMigrationMode({
        os: 'ios',
        playStoreBuild: false,
        androidPackage: PUBLIC_APK_PACKAGE,
      }),
    ).toBe('none');
  });
});

describe('store migration snooze', () => {
  const now = Date.parse('2026-11-15T08:00:00.000Z');

  it('treats a missing or past snooze as expired', () => {
    expect(isStoreMigrationSnoozed(null, now)).toBe(false);
    expect(isStoreMigrationSnoozed(undefined, now)).toBe(false);
    expect(isStoreMigrationSnoozed('not-a-date', now)).toBe(false);
    expect(isStoreMigrationSnoozed('2026-11-14T08:00:00.000Z', now)).toBe(false);
  });

  it('treats a future snooze as active', () => {
    expect(isStoreMigrationSnoozed('2026-11-20T08:00:00.000Z', now)).toBe(true);
  });

  it('schedules the next snooze fourteen days ahead', () => {
    expect(Date.parse(nextStoreMigrationSnoozeIso(now)) - now).toBe(STORE_MIGRATION_SNOOZE_MS);
  });
});
