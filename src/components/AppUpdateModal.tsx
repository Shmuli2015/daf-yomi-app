import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
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
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const [phase, setPhase] = useState<ModalPhase>('idle');
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const busy = phase === 'downloading' || phase === 'installing';

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          damping: 14,
          stiffness: 120,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scale.setValue(0.92);
      opacity.setValue(0);
      setPhase('idle');
      setProgress(null);
      setErrorMessage(null);
    }
  }, [visible, opacity, scale]);

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
      const message =
        e instanceof ApkInstallError
          ? e.message
          : 'משהו השתבש. נסו שוב או הורידו מהדפדפן.';
      setPhase('error');
      setErrorMessage(message);
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

  if (!visible || !offer) return null;

  const progressPct =
    progress && progress.progress > 0 ? Math.min(100, Math.round(progress.progress * 100)) : null;

  const bodyText =
    phase === 'downloading'
      ? 'מוריד את העדכון…'
      : phase === 'installing'
        ? 'פותח את מסך ההתקנה… לחצו «התקן» במסך שיופיע.'
        : phase === 'needs_permission'
          ? errorMessage ??
            'יש לאשר «התקנה ממקורות לא ידועים» עבור מסע דף, ואז לנסות שוב.'
          : phase === 'error'
            ? errorMessage ?? 'משהו השתבש.'
            : 'לחצו «הורד והתקן» — העדכון יורד ויפתח מסך ההתקנה. לחצו «התקן» במסך שיופיע.';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={busy ? undefined : onDismissLater}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          <View style={styles.iconWrap}>
            {busy ? (
              <ActivityIndicator size="large" color={theme.colors.accent} />
            ) : (
              <Ionicons name="cloud-download-outline" size={38} color={theme.colors.accent} />
            )}
          </View>
          <Text style={styles.title}>עדכון זמין למסע דף</Text>
          <Text style={styles.body}>{bodyText}</Text>
          <Text style={styles.versions}>
            מותקן: {installedVersion}
            {'\n'}
            חדש: {offer.latestVersion}
          </Text>

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
                <Text style={styles.secondaryLabel}>אחר כך</Text>
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
                <Text style={styles.secondaryLabel}>הורד בדפדפן</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tertiaryBtn} onPress={onDismissLater} activeOpacity={0.75}>
                <Text style={styles.secondaryLabel}>אחר כך</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.72)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 22,
      paddingVertical: 22,
      paddingHorizontal: 20,
      width: '100%',
      maxWidth: 328,
      alignItems: 'stretch',
      borderWidth: 1,
      borderColor: theme.colors.border,
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
      marginBottom: 18,
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
