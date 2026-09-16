import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import type { LatestReleaseOffer } from '../services/appUpdate';
import {
  ApkInstallError,
  downloadAndInstallApk,
  getDownloadPageUrl,
  openUnknownSourcesSettings,
  type DownloadProgress,
} from '../services/apkInstall';
import BottomSheetModal from './BottomSheetModal';
import WhatsNewHighlights from './WhatsNewHighlights';

export type AppUpdateModalProps = {
  visible: boolean;
  offer: LatestReleaseOffer | null;
  installedVersion: string;
  onDismissLater: () => void;
};

type ModalPhase = 'idle' | 'downloading' | 'installing' | 'needs_permission' | 'error';

export function AppUpdateModal({
  visible,
  offer,
  installedVersion,
  onDismissLater,
}: AppUpdateModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [phase, setPhase] = useState<ModalPhase>('idle');
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const busy = phase === 'downloading' || phase === 'installing';

  useEffect(() => {
    if (!visible) {
      setPhase('idle');
      setProgress(null);
      setErrorMessage(null);
    }
  }, [visible]);

  const openDownloadPage = useCallback(async () => {
    try {
      await Linking.openURL(getDownloadPageUrl());
    } catch {
      if (offer?.downloadUrl) {
        await Linking.openURL(offer.downloadUrl);
      }
    }
  }, [offer?.downloadUrl]);

  const handleDownloadAndInstall = useCallback(async () => {
    if (!offer?.downloadUrl || !offer.apkFileName) return;
    if (Platform.OS !== 'android') {
      await openDownloadPage();
      return;
    }

    setPhase('downloading');
    setProgress(null);
    setErrorMessage(null);

    try {
      await downloadAndInstallApk(offer.downloadUrl, offer.apkFileName, p => {
        setProgress(p);
        if (p.progress >= 1) setPhase('installing');
      });
      setPhase('idle');
    } catch (e) {
      if (e instanceof ApkInstallError && e.code === 'permission_needed') {
        setPhase('needs_permission');
        setErrorMessage(e.message);
        return;
      }
      setPhase('error');
      setErrorMessage(
        e instanceof ApkInstallError
          ? e.message
          : 'לא הצלחנו להוריד או להתקין את העדכון. אפשר לנסות שוב או להוריד מהדפדפן.',
      );
    }
  }, [offer, openDownloadPage]);

  const handleOpenSettings = useCallback(async () => {
    await openUnknownSourcesSettings();
  }, []);

  const handleRetry = useCallback(() => {
    setPhase('idle');
    setErrorMessage(null);
    setProgress(null);
  }, []);

  if (!offer) return null;

  const progressPct =
    progress && progress.progress > 0 ? Math.min(100, Math.round(progress.progress * 100)) : null;

  const titleText =
    phase === 'downloading'
      ? 'הורדת העדכון'
      : phase === 'installing'
        ? 'מוכן להתקנה'
        : phase === 'needs_permission'
          ? 'נדרשת הרשאה'
          : phase === 'error'
            ? 'ההורדה נכשלה'
            : 'קיים עדכון חדש';

  const bodyText =
    phase === 'downloading'
      ? 'הקובץ יורד כעת. ניתן להמתין כאן עד לסיום ההורדה.'
      : phase === 'installing'
        ? 'מסך ההתקנה עומד להיפתח. יש ללחוץ על "התקן" במסך שייפתח.'
        : phase === 'needs_permission'
          ? errorMessage ??
            'כדי להתקין עדכונים, יש לאשר בהגדרות המכשיר התקנה ממקורות לא ידועים ולאחר מכן לנסות שוב.'
          : phase === 'error'
            ? errorMessage ?? 'לא הצלחנו להוריד או להתקין את העדכון. ניתן לנסות שוב או להוריד מהדפדפן.'
            : 'גרסה חדשה של מסע דף מוכנה להתקנה. ההורדה תתחיל מיד, ולאחריה ייפתח מסך ההתקנה.';

  return (
    <BottomSheetModal visible={visible} onClose={onDismissLater} dismissible={!busy}>
      <View style={styles.card}>
          <View style={styles.iconWrap}>
            {busy ? (
              <ActivityIndicator size="large" color={theme.colors.accent} />
            ) : (
              <Ionicons name="cloud-download-outline" size={38} color={theme.colors.accent} />
            )}
          </View>
          <Text style={styles.title}>{titleText}</Text>
          <Text style={styles.body}>{bodyText}</Text>
          <Text style={styles.versions}>
            גרסה נוכחית: {installedVersion}
            {'\n'}
            גרסה חדשה: {offer.latestVersion}
          </Text>
          {phase === 'idle' ? <WhatsNewHighlights items={offer.highlights ?? []} /> : null}

          {phase === 'downloading' && (
            <>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressPct ?? 8}%` }]} />
              </View>
              {progressPct != null && <Text style={styles.progressLabel}>{progressPct}%</Text>}
            </>
          )}

          {phase === 'idle' && (
            <>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleDownloadAndInstall}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryLabel}>
                  {Platform.OS === 'android' ? 'הורד והתקן' : 'פתח דף הורדה'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={onDismissLater} activeOpacity={0.75}>
                <Text style={styles.secondaryLabel}>מאוחר יותר</Text>
              </TouchableOpacity>
            </>
          )}

          {phase === 'needs_permission' && (
            <>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleOpenSettings} activeOpacity={0.85}>
                <Text style={styles.primaryLabel}>פתח הגדרות</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={handleRetry} activeOpacity={0.75}>
                <Text style={styles.secondaryLabel}>נסה שוב</Text>
              </TouchableOpacity>
            </>
          )}

          {phase === 'error' && (
            <>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleRetry} activeOpacity={0.85}>
                <Text style={styles.primaryLabel}>נסה שוב</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={openDownloadPage} activeOpacity={0.75}>
                <Text style={styles.secondaryLabel}>הורד מהדפדפן</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tertiaryBtn} onPress={onDismissLater} activeOpacity={0.75}>
                <Text style={styles.secondaryLabel}>מאוחר יותר</Text>
              </TouchableOpacity>
            </>
          )}
      </View>
    </BottomSheetModal>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    card: {
      width: '100%',
      alignItems: 'stretch',
    },
    iconWrap: {
      alignSelf: 'center',
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },
    title: {
      fontSize: 19,
      fontWeight: '900',
      color: theme.colors.primary,
      textAlign: 'center',
      marginBottom: 10,
    },
    body: {
      fontSize: 14,
      lineHeight: 22,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      fontWeight: '600',
      marginBottom: 12,
    },
    versions: {
      fontSize: 12,
      lineHeight: 18,
      color: theme.colors.textMuted,
      textAlign: 'center',
      fontWeight: '600',
      marginBottom: 12,
    },
    progressTrack: {
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.border,
      overflow: 'hidden',
      marginBottom: 10,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.colors.accent,
      borderRadius: 4,
    },
    progressLabel: {
      fontSize: 12,
      color: theme.colors.textMuted,
      textAlign: 'center',
      fontWeight: '700',
      marginBottom: 8,
    },
    primaryBtn: {
      backgroundColor: theme.colors.accent,
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 10,
    },
    primaryLabel: {
      color: '#fff',
      fontWeight: '900',
      fontSize: 16,
    },
    secondaryBtn: {
      paddingVertical: 10,
      alignItems: 'center',
    },
    tertiaryBtn: {
      paddingVertical: 4,
      alignItems: 'center',
    },
    secondaryLabel: {
      color: theme.colors.accent,
      fontWeight: '800',
      fontSize: 15,
    },
  });
