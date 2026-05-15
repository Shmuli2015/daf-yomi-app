import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { Alert } from 'react-native';
import { AppUpdateModal } from '../components/AppUpdateModal';
import { useAppUpdateCheck } from '../hooks/useAppUpdateCheck';
import { probeLatestReleaseForDev } from '../services/appUpdate';

export type AppUpdateContextValue = {
  checkManualAsync: () => Promise<'opened' | 'none' | 'dismissed'>;
  showPreviewMock: () => void;
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

export function AppUpdateProvider({ children }: { children: React.ReactNode }) {
  const {
    visible,
    offer,
    installedVersion,
    onDismissLater,
    checkManualAsync,
    showPreviewMock,
  } = useAppUpdateCheck();

  const probeGithubRelease = useCallback(async () => {
    const r = await probeLatestReleaseForDev();
    if (!r.ok) {
      Alert.alert('GitHub', r.detail ?? 'שגיאה');
      return;
    }
    Alert.alert(
      'תגובת GitHub האחרונה',
      [`טאג: ${r.tag_name ?? '(חסר)'}`, r.apkAsset ? `APK: ${r.apkAsset}` : null, r.detail].filter(Boolean).join('\n'),
    );
  }, []);

  const value = useMemo(
    () => ({
      checkManualAsync,
      showPreviewMock,
      probeGithubRelease,
    }),
    [checkManualAsync, showPreviewMock, probeGithubRelease],
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
    </AppUpdateContext.Provider>
  );
}
