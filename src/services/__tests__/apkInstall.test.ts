jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      downloadPageUrl: 'https://shmuli2015.github.io/daf-yomi-app/',
    },
    android: {
      package: 'com.masadaf.app',
    },
  },
}));

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///cache/',
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true, size: 50 * 1024 * 1024 }),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  readDirectoryAsync: jest.fn().mockResolvedValue([]),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  createDownloadResumable: jest.fn(),
  getContentUriAsync: jest.fn().mockResolvedValue('content://apk'),
}));

jest.mock('expo-intent-launcher', () => ({
  startActivityAsync: jest.fn().mockResolvedValue(undefined),
  ActivityAction: {
    MANAGE_UNKNOWN_APP_SOURCES: 'android.settings.MANAGE_UNKNOWN_APP_SOURCES',
  },
}));

import { isTrustedApkDownloadUrl, downloadApk, ApkInstallError } from '../apkInstall';

describe('apkInstall security validation', () => {
  it('validates trusted GitHub release download URLs', () => {
    const validUrl = 'https://github.com/Shmuli2015/daf-yomi-app/releases/download/v1.2.4/masa-daf-1.2.4.apk';
    expect(isTrustedApkDownloadUrl(validUrl)).toBe(true);
  });

  it('rejects untrusted domains and HTTP schemes', () => {
    expect(isTrustedApkDownloadUrl('http://github.com/Shmuli2015/daf-yomi-app/releases/download/v1.2.4/a.apk')).toBe(false);
    expect(isTrustedApkDownloadUrl('https://evil.com/releases/download/v1.2.4/masa-daf.apk')).toBe(false);
    expect(isTrustedApkDownloadUrl('https://github.com/OtherOwner/other-repo/releases/download/v1.0/a.apk')).toBe(false);
  });

  it('rejects non-string values', () => {
    expect(isTrustedApkDownloadUrl(undefined as unknown as string)).toBe(false);
    expect(isTrustedApkDownloadUrl('' as string)).toBe(false);
  });

  it('throws ApkInstallError if download URL is untrusted', async () => {
    await expect(downloadApk('https://untrusted.com/app.apk', 'app.apk')).rejects.toThrow(
      ApkInstallError,
    );
  });
});
