import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import type { BackupPreview } from '../../services/backup';

type BackupImportModalProps = {
  visible: boolean;
  preview: BackupPreview | null;
  onMerge: () => void;
  onReplace: () => void;
  onCancel: () => void;
};

export default function BackupImportModal({
  visible,
  preview,
  onMerge,
  onReplace,
  onCancel,
}: BackupImportModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 100, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scale, { toValue: 0.9, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, opacity, scale]);

  if (!visible || !preview) return null;

  const lastDateLine = preview.lastLearnedLabel
    ? `תאריך אחרון: ${preview.lastLearnedLabel}`
    : 'אין רשומות לימוד בגיבוי';

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity, transform: [{ scale }] }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="cloud-upload-outline" size={32} color={theme.colors.accent} />
          </View>

          <Text style={styles.title}>ייבוא גיבוי</Text>
          <Text style={styles.message}>
            {`${preview.learnedCount} דפים נלמדו · ${preview.totalRecords} רשומות`}
          </Text>
          <Text style={styles.detail}>{lastDateLine}</Text>
          <Text style={styles.detail}>נוצר ב־{preview.exportedAtLabel}</Text>
          <Text style={styles.hint}>
            «מזג» ישמור את הרשומה המאוחרת יותר לכל תאריך. «החלף הכל» ימחק את כל הנתונים הקיימים.
          </Text>

          <TouchableOpacity style={styles.mergeButton} onPress={onMerge} activeOpacity={0.8}>
            <Text style={styles.mergeText}>מזג עם הנתונים הקיימים</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.replaceButton} onPress={onReplace} activeOpacity={0.8}>
            <Text style={styles.replaceText}>החלף הכל</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.7}>
            <Text style={styles.cancelText}>ביטול</Text>
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
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 24,
      width: '100%',
      maxWidth: 340,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      direction: 'rtl',
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: '900',
      marginBottom: 8,
      textAlign: 'center',
    },
    message: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 6,
    },
    detail: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      lineHeight: 20,
      textAlign: 'center',
    },
    hint: {
      color: theme.colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
      textAlign: 'center',
      marginTop: 12,
      marginBottom: 20,
    },
    mergeButton: {
      width: '100%',
      backgroundColor: theme.colors.accent,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      marginBottom: 10,
    },
    mergeText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
    replaceButton: {
      width: '100%',
      backgroundColor: theme.colors.danger,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      marginBottom: 10,
    },
    replaceText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
    cancelButton: {
      width: '100%',
      paddingVertical: 12,
      borderRadius: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cancelText: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
  });
