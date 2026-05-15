import { useCallback, useEffect, useRef, useState } from 'react';
import Constants from 'expo-constants';
import { useAppStore } from '../store/useAppStore';
import { getSettings, touchLastUpdateCheckAt, setDismissedUpdateVersion } from '../db/database';
import {
  compareSemver,
  isUpdateCheckConfigured,
  resolveUpdateOfferIfAny,
  type LatestReleaseOffer,
} from '../services/appUpdate';

const TWENTY_FOUR_H_MS = 24 * 60 * 60 * 1000;

function shouldThrottleAutoCheck(lastIso: string | null | undefined): boolean {
  if (!lastIso) return false;
  const t = Date.parse(lastIso);
  if (Number.isNaN(t)) return false;
  return Date.now() - t < TWENTY_FOUR_H_MS;
}

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
  const autoRanRef = useRef(false);

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

      if (!force && shouldThrottleAutoCheck(row.last_update_check_at)) {
        return 'none';
      }

      touchLastUpdateCheckAt();
      refreshSettings();

      const next = await resolveUpdateOfferIfAny(installedVersion);
      if (!next) return 'none';

      if (shouldSkipDueToDismissed(next.latestVersion, row.dismissed_update_version)) {
        return 'dismissed';
      }

      setOffer(next);
      setVisible(true);
      return 'opened';
    },
    [installedVersion, refreshSettings],
  );

  useEffect(() => {
    if (!isAppReady || autoRanRef.current) return;
    autoRanRef.current = true;
    void runRemoteCheck(false);
  }, [isAppReady, runRemoteCheck]);

  const checkManualAsync = useCallback(() => runRemoteCheck(true), [runRemoteCheck]);

  const showPreviewMock = useCallback(() => {
    if (!__DEV__) return;
    setOffer({
      latestVersion: '9.9.9',
      downloadUrl: 'https://example.com',
      rawTag: 'v9.9.9',
      apkFileName: 'preview-demo.apk',
    });
    setVisible(true);
  }, []);

  return {
    visible,
    offer,
    installedVersion,
    onDismissLater,
    checkManualAsync,
    showPreviewMock,
    closeModal,
  };
}
