import { useCallback, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { getSettings, setStoreMigrationSnoozeUntil } from '../db/database';
import { openSettingsBackupSection } from '../navigation/navigationRef';
import {
  getStoreMigrationMode,
  isStoreMigrationSnoozed,
  nextStoreMigrationSnoozeIso,
  type StoreMigrationMode,
} from '../services/storeMigration';
import { PLAY_STORE_APP_URL } from '../utils/shareDownloadLink';

export function useStoreMigrationPrompt(options?: { blocked?: boolean }) {
  const isAppReady = useAppStore(s => s.isAppReady);
  const blocked = options?.blocked ?? false;
  const mode: StoreMigrationMode = getStoreMigrationMode();
  const [visible, setVisible] = useState(false);
  const [snoozeUntil, setSnoozeUntil] = useState<string | null | undefined>(undefined);
  const autoShownRef = useRef(false);

  if (isAppReady && snoozeUntil === undefined) {
    setSnoozeUntil(getSettings().store_migration_snooze_until);
  }

  if (
    isAppReady &&
    snoozeUntil !== undefined &&
    mode === 'replace' &&
    !blocked &&
    !autoShownRef.current &&
    !isStoreMigrationSnoozed(snoozeUntil, Date.now())
  ) {
    autoShownRef.current = true;
    setVisible(true);
  }

  const snooze = useCallback(() => {
    const iso = nextStoreMigrationSnoozeIso(Date.now());
    setStoreMigrationSnoozeUntil(iso);
    setSnoozeUntil(iso);
    setVisible(false);
  }, []);

  const onOpenBackup = useCallback(() => {
    autoShownRef.current = true;
    setVisible(false);
    openSettingsBackupSection();
  }, []);

  const onOpenPlayStore = useCallback(async () => {
    try {
      await Linking.openURL(PLAY_STORE_APP_URL);
    } catch {
      return;
    }
    snooze();
  }, [snooze]);

  const openFromSettings = useCallback(() => {
    if (mode !== 'replace') return false;
    autoShownRef.current = true;
    setVisible(true);
    return true;
  }, [mode]);

  return {
    visible: mode === 'replace' && visible,
    mode,
    onSnooze: snooze,
    onOpenBackup,
    onOpenPlayStore,
    openFromSettings,
  };
}
