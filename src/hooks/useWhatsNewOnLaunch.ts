import { useCallback, useRef, useState } from 'react';
import Constants from 'expo-constants';
import { useAppStore } from '../store/useAppStore';
import { getSettings, setSeenAppVersion } from '../db/database';
import {
  getHighlightsForVersion,
  getHighlightsSince,
  hasWhatsNewForVersion,
  shouldShowWhatsNewOnLaunch,
} from '../data/whatsNew';

export function useWhatsNewOnLaunch() {
  const isAppReady = useAppStore(s => s.isAppReady);
  const refreshSettings = useAppStore(s => s.refreshSettings);
  const installedVersion = Constants.expoConfig?.version ?? '0.0.0';
  const decidedRef = useRef(false);

  const [visible, setVisible] = useState(false);
  const [highlights, setHighlights] = useState<string[]>([]);

  if (isAppReady && !decidedRef.current) {
    decidedRef.current = true;
    const seen = getSettings().seen_app_version;
    const shouldShow = shouldShowWhatsNewOnLaunch(seen, installedVersion);
    setVisible(shouldShow);
    setHighlights(shouldShow ? getHighlightsSince(seen, installedVersion) : []);
  }

  const onDismiss = useCallback(() => {
    setVisible(false);
    setSeenAppVersion(installedVersion);
    refreshSettings();
  }, [installedVersion, refreshSettings]);

  const openFromSettings = useCallback(() => {
    const items = getHighlightsForVersion(installedVersion);
    if (!items.length) return false;
    setHighlights(items);
    setVisible(true);
    return true;
  }, [installedVersion]);

  return {
    visible,
    highlights,
    version: installedVersion,
    hasHighlights: hasWhatsNewForVersion(installedVersion),
    onDismiss,
    openFromSettings,
  };
}
