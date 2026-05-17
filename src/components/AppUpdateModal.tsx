import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import type { LatestReleaseOffer } from '../services/appUpdate';

export type AppUpdateModalProps = {
  visible: boolean;
  offer: LatestReleaseOffer | null;
  installedVersion: string;
  onDismissLater: () => void;
};

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
    }
  }, [visible, opacity, scale]);

  const openDownload = async () => {
    const targetUrl = offer?.releasePageUrl || offer?.downloadUrl;
    if (!targetUrl) return;
    try {
      await Linking.openURL(targetUrl);
    } catch {
      /* handled silently — browser/download manager may still open */
    }
  };

  if (!visible || !offer) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onDismissLater}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          <View style={styles.iconWrap}>
            <Ionicons name="cloud-download-outline" size={38} color={theme.colors.accent} />
          </View>
          <Text style={styles.title}>עדכון זמין למסע דף</Text>
          <Text style={styles.body}>
            יש גרסה חדשה זמינה! לחץ על הכפתור כדי לפתוח את דף הגרסה בדפדפן ולהוריד את קובץ ה-APK בצורה בטוחה ומהירה.
          </Text>
          <Text style={styles.versions}>
            מותקן: {installedVersion}{'\n'}
            חדש: {offer.latestVersion}
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={openDownload} activeOpacity={0.85}>
            <Text style={styles.primaryLabel}>פתח דף הורדה</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={onDismissLater} activeOpacity={0.75}>
            <Text style={styles.secondaryLabel}>אחר כך</Text>
          </TouchableOpacity>
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
    em: {
      fontWeight: '800',
      color: theme.colors.accent,
    },
    versions: {
      fontSize: 12,
      lineHeight: 18,
      color: theme.colors.textMuted,
      textAlign: 'center',
      fontWeight: '600',
      marginBottom: 18,
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
    secondaryLabel: {
      color: theme.colors.accent,
      fontWeight: '800',
      fontSize: 15,
    },
  });
