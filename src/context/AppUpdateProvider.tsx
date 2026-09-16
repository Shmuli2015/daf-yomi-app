import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AppUpdateModal } from '../components/AppUpdateModal';
import Toast, { type ToastIconName } from '../components/Toast';
import WhatsNewModal from '../components/WhatsNewModal';
import { useAppUpdateCheck } from '../hooks/useAppUpdateCheck';
import { useWhatsNewOnLaunch } from '../hooks/useWhatsNewOnLaunch';
import { probeLatestReleaseForDev } from '../services/appUpdate';

export type AppUpdateContextValue = {
  checkManualAsync: () => Promise<'opened' | 'none' | 'dismissed'>;
  probeGithubRelease: () => Promise<void>;
  openWhatsNew: () => boolean;
  hasWhatsNew: boolean;
};

const AppUpdateContext = createContext<AppUpdateContextValue | null>(null);
const GITHUB_PROBE_TOAST_MS = 5000;
const GITHUB_PROBE_TOAST_EXTRA_BOTTOM = 64;

export function useAppUpdateControls(): AppUpdateContextValue {
  const ctx = useContext(AppUpdateContext);
  if (!ctx) {
    throw new Error('useAppUpdateControls must be used within AppUpdateProvider');
  }
  return ctx;
}

type GithubProbeToastPayload = {
  title: string;
  message: string;
  iconName?: ToastIconName;
};

export function AppUpdateProvider({ children }: { children: React.ReactNode }) {
  const {
    visible: whatsNewVisible,
    highlights: whatsNewHighlights,
    version: whatsNewVersion,
    hasHighlights,
    onDismiss: onDismissWhatsNew,
    openFromSettings,
  } = useWhatsNewOnLaunch();

  const {
    visible,
    offer,
    installedVersion,
    onDismissLater,
    checkManualAsync,
  } = useAppUpdateCheck({ pauseAutoCheck: whatsNewVisible });

  const [githubProbeToast, setGithubProbeToast] = useState<GithubProbeToastPayload | null>(null);

  const probeGithubRelease = useCallback(async () => {
    const r = await probeLatestReleaseForDev();
    if (!r.ok) {
      setGithubProbeToast({
        title: 'GitHub',
        message: r.detail ?? 'שגיאה',
        iconName: 'cloud-offline-outline',
      });
      return;
    }
    const lines = [
      `טאג: ${r.tag_name ?? '(חסר)'}`,
      r.apkAsset ? `APK: ${r.apkAsset}` : null,
      r.detail,
    ].filter(Boolean) as string[];
    setGithubProbeToast({
      title: 'תגובת GitHub האחרונה',
      message: lines.join('\n'),
      iconName: 'logo-github',
    });
  }, []);

  useEffect(() => {
    if (!githubProbeToast) return;
    const timeoutId = setTimeout(() => setGithubProbeToast(null), GITHUB_PROBE_TOAST_MS);
    return () => clearTimeout(timeoutId);
  }, [githubProbeToast]);

  const value = useMemo(
    () => ({
      checkManualAsync,
      probeGithubRelease,
      openWhatsNew: openFromSettings,
      hasWhatsNew: hasHighlights,
    }),
    [checkManualAsync, probeGithubRelease, openFromSettings, hasHighlights],
  );

  return (
    <AppUpdateContext.Provider value={value}>
      {children}
      <WhatsNewModal
        visible={whatsNewVisible}
        version={whatsNewVersion}
        highlights={whatsNewHighlights}
        onClose={onDismissWhatsNew}
      />
      <AppUpdateModal
        visible={visible}
        offer={offer}
        installedVersion={installedVersion}
        onDismissLater={onDismissLater}
      />
      <Toast
        visible={githubProbeToast !== null}
        onClose={() => setGithubProbeToast(null)}
        title={githubProbeToast?.title ?? ''}
        message={githubProbeToast?.message ?? ''}
        iconName={githubProbeToast?.iconName}
        extraBottom={GITHUB_PROBE_TOAST_EXTRA_BOTTOM}
      />
    </AppUpdateContext.Provider>
  );
}
