import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import BottomSheetModal from './BottomSheetModal';

interface DafMarkMenuModalProps {
  visible: boolean;
  onSelectFull: () => void;
  onSelectHalfA: () => void;
  onSelectHalfB: () => void;
  onCancel: () => void;
  showUnmark?: boolean;
  onUnmark?: () => void;
  partialAmud?: 'a' | 'b' | null;
}

export default function DafMarkMenuModal({
  visible,
  onSelectFull,
  onSelectHalfA,
  onSelectHalfB,
  onCancel,
  showUnmark = false,
  onUnmark,
  partialAmud = null,
}: DafMarkMenuModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <BottomSheetModal visible={visible} onClose={onCancel}>
      <View style={styles.content}>
        <Text style={styles.title}>סימון לימוד</Text>
        <Text style={styles.subtitle}>בחרו כמה למדתם היום</Text>

        <TouchableOpacity style={styles.optionButton} onPress={onSelectFull} activeOpacity={0.8}>
          <Ionicons name="checkmark-circle" size={22} color={theme.colors.success} />
          <Text style={styles.optionText}>דף מלא</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={onSelectHalfA} activeOpacity={0.8}>
          <Ionicons
            name={partialAmud === 'a' ? 'checkmark-circle' : 'remove-circle-outline'}
            size={22}
            color={partialAmud === 'a' ? theme.colors.success : theme.colors.accent}
          />
          <Text style={[styles.optionText, partialAmud === 'a' && styles.optionTextDone]}>
            חצי דף (א){partialAmud === 'a' ? ' ✓' : ''}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={onSelectHalfB} activeOpacity={0.8}>
          <Ionicons
            name={partialAmud === 'b' ? 'checkmark-circle' : 'remove-circle-outline'}
            size={22}
            color={partialAmud === 'b' ? theme.colors.success : theme.colors.accent}
          />
          <Text style={[styles.optionText, partialAmud === 'b' && styles.optionTextDone]}>
            חצי דף (ב){partialAmud === 'b' ? ' ✓' : ''}
          </Text>
        </TouchableOpacity>

        {showUnmark && onUnmark && (
          <TouchableOpacity style={styles.unmarkButton} onPress={onUnmark} activeOpacity={0.8}>
            <Ionicons name="close-circle-outline" size={22} color={theme.colors.danger} />
            <Text style={styles.unmarkText}>בטל סימון</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cancelButton} onPress={onCancel} activeOpacity={0.7}>
          <Text style={styles.cancelText}>סגור</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    content: {
      direction: 'rtl',
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: 20,
      fontWeight: '900',
      marginBottom: 4,
      textAlign: 'center',
    },
    subtitle: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 20,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 14,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginBottom: 10,
    },
    optionText: {
      color: theme.colors.textPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
    optionTextDone: {
      color: theme.colors.success,
    },
    unmarkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 14,
      backgroundColor: 'rgba(239,68,68,0.08)',
      borderWidth: 1,
      borderColor: 'rgba(239,68,68,0.25)',
      marginBottom: 10,
    },
    unmarkText: {
      color: theme.colors.danger,
      fontSize: 16,
      fontWeight: '700',
    },
    cancelButton: {
      marginTop: 6,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cancelText: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      fontWeight: '600',
    },
  });
