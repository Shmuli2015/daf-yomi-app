import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { isPlayStoreBuild } from './playTrack';

export const PUBLIC_APK_PACKAGE = 'com.masadaf.app';
export const STORE_MIGRATION_SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;

export type StoreMigrationMode = 'none' | 'replace';

export function resolveStoreMigrationMode(input: {
  os: string;
  playStoreBuild: boolean;
  androidPackage: string;
}): StoreMigrationMode {
  if (input.os !== 'android') return 'none';
  if (input.playStoreBuild) return 'none';
  if (input.androidPackage === PUBLIC_APK_PACKAGE) return 'replace';
  return 'none';
}

export function getStoreMigrationMode(): StoreMigrationMode {
  return resolveStoreMigrationMode({
    os: Platform.OS,
    playStoreBuild: isPlayStoreBuild(),
    androidPackage: Constants.expoConfig?.android?.package ?? '',
  });
}

export function isStoreMigrationSnoozed(
  snoozeUntil: string | null | undefined,
  nowMs: number,
): boolean {
  if (!snoozeUntil) return false;
  const until = Date.parse(snoozeUntil);
  if (Number.isNaN(until)) return false;
  return until > nowMs;
}

export function nextStoreMigrationSnoozeIso(nowMs: number): string {
  return new Date(nowMs + STORE_MIGRATION_SNOOZE_MS).toISOString();
}
