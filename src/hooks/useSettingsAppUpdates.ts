import { useCallback } from 'react';
import { Platform, Share } from 'react-native';
import Constants from 'expo-constants';
import { useAppUpdateControls } from '../context/AppUpdateProvider';
import { isUpdateCheckConfigured } from '../services/appUpdate';
import { getDownloadPageUrl } from '../services/apkInstall';
import { buildDownloadShareContent } from '../utils/shareDownloadLink';
import type { SettingsFeedback } from './useSettingsFeedback';

interface UseSettingsAppUpdatesParams {
  onFeedback: (feedback: SettingsFeedback) => void;
  setUpdateAutoPromptEnabled: (enabled: boolean) => void;
}

export function useSettingsAppUpdates({
  onFeedback,
  setUpdateAutoPromptEnabled,
}: UseSettingsAppUpdatesParams) {
  const updateCtl = useAppUpdateControls();
  const updatesConfigured = isUpdateCheckConfigured();

  const handleUpdateAutoPromptToggle = useCallback(
    (val: boolean) => {
      setUpdateAutoPromptEnabled(val);
    },
    [setUpdateAutoPromptEnabled],
  );

  const handleCheckAppUpdates = useCallback(async () => {
    if (!isUpdateCheckConfigured()) {
      onFeedback({
        title: 'בדיקת עדכונים',
        message: 'חיבור לשרת העדכונים לא מוגדר. יש להגדיר בקובץ app.config את githubOwner ואת githubRepo.',
        iconName: 'settings-outline',
        compact: true,
      });
      return;
    }
    const result = await updateCtl.checkManualAsync();
    if (result === 'opened') return;
    if (result === 'dismissed') {
      onFeedback({
        title: 'העדכון נדחה',
        message: 'דחיתם את העדכון הנוכחי. כשתופיע גרסה חדשה יותר, נזכיר שוב.',
        iconName: 'time-outline',
        compact: true,
      });
      return;
    }
    const installedVersion = Constants.expoConfig?.version;
    onFeedback({
      title: 'הכל מעודכן',
      message: 'אתם כבר על הגרסה העדכנית ביותר של מסע דף.',
      emphasis: installedVersion ? `גרסה ${installedVersion}` : undefined,
      iconName: 'checkmark-circle',
      compact: true,
    });
  }, [updateCtl, onFeedback]);

  const handleShareDownloadLink = useCallback(async () => {
    try {
      await Share.share(buildDownloadShareContent(getDownloadPageUrl(), Platform.OS));
    } catch {}
  }, []);

  return {
    updatesConfigured,
    probeGithubRelease: updateCtl.probeGithubRelease,
    handleUpdateAutoPromptToggle,
    handleCheckAppUpdates,
    handleShareDownloadLink,
    handleShowWhatsNew: updateCtl.hasWhatsNew ? updateCtl.openWhatsNew : undefined,
  };
}
