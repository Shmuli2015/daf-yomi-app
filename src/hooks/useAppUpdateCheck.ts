import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import Constants from 'expo-constants';
import { useAppStore } from '../store/useAppStore';
import { getSettings, touchLastUpdateCheckAt, setDismissedUpdateVersion } from '../db/database';
import {
  compareSemver,
  isUpdateCheckConfigured,
  resolveUpdateOfferIfAny,
  type LatestReleaseOffer,
} from '../services/appUpdate';

/** Minimal gap between automatic checks — avoids duplicate calls on launch/state flicker */
const AUTO_CHECK_MIN_GAP_MS = 5000;

function shouldSkipDueToDismissed(remote: string, dismissed: string | null | undefined): boolean {
  if (!dismissed) return false;
  return compareSemver(remote, dismissed) <= 0;
}

export type UpdateCheckRunResult = 'opened' | 'none' | 'dismissed';

export function useAppUpdateCheck() {
  const isAppReady = useAppStore(s => s.isAppReady);
  const refreshSettings = useAppStore(s => s.refreshSettings);

  const [visible, setVisible] = useState(false);
  const [offer, setOffer] = useState<LatestReleaseOffer | null>(null);
  const lastAutoRunAtRef = useRef(0);

  const installedVersion = Constants.expoConfig?.version ?? '0.0.0';

  const closeModal = useCallback(() => {
    setVisible(false);
    setOffer(null);
  }, []);

  const onDismissLater = useCallback(() => {
    const mockUrl = 'https://example.com';
    if (offer?.latestVersion && offer.downloadUrl !== mockUrl) {
      setDismissedUpdateVersion(offer.latestVersion);
      refreshSettings();
    }
    closeModal();
  }, [offer, refreshSettings, closeModal]);

  const runRemoteCheck = useCallback(
    async (force: boolean): Promise<UpdateCheckRunResult> => {
      if (!isUpdateCheckConfigured()) return 'none';

      const row = getSettings();

      if (!force && (row.update_auto_prompt_enabled ?? 0) !== 1) {
        return 'none';
      }

      touchLastUpdateCheckAt();
      refreshSettings();

      const next = await resolveUpdateOfferIfAny(installedVersion);
      if (!next) return 'none';

      if (!force && shouldSkipDueToDismissed(next.latestVersion, row.dismissed_update_version)) {
        return 'dismissed';
      }

      setOffer(next);
      setVisible(true);
      return 'opened';
    },
    [installedVersion, refreshSettings],
  );

  const kickAutoRemoteCheck = useCallback(() => {
    if (!isAppReady || !isUpdateCheckConfigured()) return;
    if ((getSettings().update_auto_prompt_enabled ?? 0) !== 1) return;
    const now = Date.now();
    if (now - lastAutoRunAtRef.current < AUTO_CHECK_MIN_GAP_MS) return;
    lastAutoRunAtRef.current = now;
    void runRemoteCheck(false);
  }, [isAppReady, runRemoteCheck]);

  useEffect(() => {
    if (!isAppReady) return;
    kickAutoRemoteCheck();
    const sub = AppState.addEventListener('change', (next: AppStateStatus) => {
      if (next === 'active') kickAutoRemoteCheck();
    });
    return () => sub.remove();
  }, [isAppReady, kickAutoRemoteCheck]);

  const checkManualAsync = useCallback(() => runRemoteCheck(true), [runRemoteCheck]);

  return {
    visible,
    offer,
    installedVersion,
    onDismissLater,
    checkManualAsync,
    closeModal,
  };
}
