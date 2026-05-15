import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import InfoModal, { type InfoModalIconName } from '../components/InfoModal';
import { AppUpdateModal } from '../components/AppUpdateModal';
import { useAppUpdateCheck } from '../hooks/useAppUpdateCheck';
import { probeLatestReleaseForDev } from '../services/appUpdate';

export type AppUpdateContextValue = {
  checkManualAsync: () => Promise<'opened' | 'none' | 'dismissed'>;
  probeGithubRelease: () => Promise<void>;
};

const AppUpdateContext = createContext<AppUpdateContextValue | null>(null);

export function useAppUpdateControls(): AppUpdateContextValue {
  const ctx = useContext(AppUpdateContext);
  if (!ctx) {
    throw new Error('useAppUpdateControls must be used within AppUpdateProvider');
  }
  return ctx;
}

type GithubProbeModalPayload = {
  title: string;
  message: string;
  iconName?: InfoModalIconName;
};

export function AppUpdateProvider({ children }: { children: React.ReactNode }) {
  const {
    visible,
    offer,
    installedVersion,
    onDismissLater,
    checkManualAsync,
  } = useAppUpdateCheck();

  const [githubProbeModal, setGithubProbeModal] = useState<GithubProbeModalPayload | null>(null);

  const probeGithubRelease = useCallback(async () => {
    const r = await probeLatestReleaseForDev();
    if (!r.ok) {
      setGithubProbeModal({
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
    setGithubProbeModal({
      title: 'תגובת GitHub האחרונה',
      message: lines.join('\n'),
      iconName: 'logo-github',
    });
  }, []);

  const value = useMemo(
    () => ({
      checkManualAsync,
      probeGithubRelease,
    }),
    [checkManualAsync, probeGithubRelease],
  );

  return (
    <AppUpdateContext.Provider value={value}>
      {children}
      <AppUpdateModal
        visible={visible}
        offer={offer}
        installedVersion={installedVersion}
        onDismissLater={onDismissLater}
      />
      <InfoModal
        compact
        visible={githubProbeModal !== null}
        onClose={() => setGithubProbeModal(null)}
        title={githubProbeModal?.title ?? ''}
        message={githubProbeModal?.message ?? ''}
        iconName={githubProbeModal?.iconName}
      />
    </AppUpdateContext.Provider>
  );
}
