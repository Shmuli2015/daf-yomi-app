import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import BottomSheetModal from '../BottomSheetModal';

interface MasechetCardBulkMenuProps {
  visible: boolean;
  masechetHe: string;
  isPersonalEnabled: boolean;
  showMark: boolean;
  showUnmark: boolean;
  showMarkPersonal: boolean;
  showUnmarkPersonal: boolean;
  onMarkAll: () => void;
  onUnmarkAll: () => void;
  onMarkAllPersonal: () => void;
  onUnmarkAllPersonal: () => void;
  onCancel: () => void;
}

export default function MasechetCardBulkMenu({
  visible,
  masechetHe,
  isPersonalEnabled,
  showMark,
  showUnmark,
  showMarkPersonal,
  showUnmarkPersonal,
  onMarkAll,
  onUnmarkAll,
  onMarkAllPersonal,
  onUnmarkAllPersonal,
  onCancel,
}: MasechetCardBulkMenuProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const hasPersonalOptions = showMarkPersonal || showUnmarkPersonal;
  const hasDafYomiOptions = showMark || showUnmark;

  return (
    <BottomSheetModal visible={visible} onClose={onCancel}>
      <View style={styles.content}>
        <Text style={styles.title}>{masechetHe}</Text>
        <Text style={styles.subtitle}>סימון כל המסכת</Text>

        {isPersonalEnabled && hasDafYomiOptions && (
          <Text style={styles.sectionLabel}>דף יומי</Text>
        )}

        {showMark && (
          <TouchableOpacity style={styles.optionButton} onPress={onMarkAll} activeOpacity={0.8}>
            <Ionicons name="checkmark-done-circle" size={22} color={theme.colors.success} />
            <Text style={styles.optionText}>
              {isPersonalEnabled ? 'סמן הכל בדף יומי' : 'סמן הכל'}
            </Text>
          </TouchableOpacity>
        )}

        {showUnmark && (
          <TouchableOpacity style={styles.unmarkButton} onPress={onUnmarkAll} activeOpacity={0.8}>
            <Ionicons name="close-circle-outline" size={22} color={theme.colors.danger} />
            <Text style={styles.unmarkText}>
              {isPersonalEnabled ? 'בטל הכל בדף יומי' : 'בטל הכל'}
            </Text>
          </TouchableOpacity>
        )}

        {hasPersonalOptions && (
          <Text style={[styles.sectionLabel, hasDafYomiOptions && styles.sectionLabelSpaced]}>
            מסלול אישי
          </Text>
        )}

        {showMarkPersonal && (
          <TouchableOpacity style={styles.optionButton} onPress={onMarkAllPersonal} activeOpacity={0.8}>
            <Ionicons name="checkmark-done-circle" size={22} color={theme.colors.success} />
            <Text style={styles.optionText}>סמן הכל באישי</Text>
          </TouchableOpacity>
        )}

        {showUnmarkPersonal && (
          <TouchableOpacity style={styles.unmarkButton} onPress={onUnmarkAllPersonal} activeOpacity={0.8}>
            <Ionicons name="close-circle-outline" size={22} color={theme.colors.danger} />
            <Text style={styles.unmarkText}>בטל הכל באישי</Text>
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
      marginBottom: 16,
    },
    sectionLabel: {
      color: theme.colors.textMuted,
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 8,
      textAlign: 'left',
      width: '100%',
    },
    sectionLabelSpaced: {
      marginTop: 8,
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
