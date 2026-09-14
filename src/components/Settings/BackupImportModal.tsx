import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import type { BackupPreview } from '../../services/backup';
import BottomSheetModal from '../BottomSheetModal';

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

  if (!preview) return null;

  const lastDateLine = preview.lastLearnedLabel
    ? `תאריך אחרון: ${preview.lastLearnedLabel}`
    : 'אין רשומות לימוד בגיבוי';

  return (
    <BottomSheetModal visible={visible} onClose={onCancel}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-upload-outline" size={32} color={theme.colors.accent} />
        </View>

        <Text style={styles.title}>ייבוא גיבוי</Text>
        <Text style={styles.message}>
          {`${preview.learnedCount} דפים נלמדו · ${preview.totalRecords} רשומות`}
        </Text>
        <Text style={styles.detail}>{lastDateLine}</Text>
        {preview.personalTrackCount != null && preview.personalTrackCount > 0 ? (
          <Text style={styles.detail}>{`${preview.personalTrackCount} דפים במסלול אישי`}</Text>
        ) : null}
        <Text style={styles.detail}>נוצר ב־{preview.exportedAtLabel}</Text>
        <Text style={styles.hint}>
          "מזג" ישמור את הרשומה המאוחרת יותר לכל תאריך. "החלף הכל" ימחק את כל הנתונים הקיימים.
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
      </View>
    </BottomSheetModal>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    content: {
      alignItems: 'center',
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
