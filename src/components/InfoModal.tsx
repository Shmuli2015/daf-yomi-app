import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import BottomSheetModal from './BottomSheetModal';

export type InfoModalIconName = keyof typeof Ionicons.glyphMap;

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  emphasis?: string;
  actionLabel?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
  iconName?: InfoModalIconName;
  compact?: boolean;
}

export default function InfoModal({
  visible,
  onClose,
  title,
  message,
  emphasis,
  actionLabel = 'הבנתי',
  secondaryLabel,
  onSecondary,
  iconName = 'information-circle',
  compact = false,
}: InfoModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme, compact), [theme, compact]);

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.content}>
        {compact ? (
          <View style={styles.compactCloseRow} pointerEvents="box-none">
            <TouchableOpacity
              style={styles.compactCloseBtn}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="סגור"
            >
              <Ionicons name="close" size={22} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.iconContainer}>
          <Ionicons name={iconName} size={compact ? 26 : 36} color={theme.colors.accent} />
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.message, !emphasis && styles.messageSolo]}>{message}</Text>
        {emphasis ? (
          <Text style={styles.emphasis} selectable>
            {emphasis}
          </Text>
        ) : null}

        {!compact ? (
          <>
            {secondaryLabel && onSecondary ? (
              <TouchableOpacity style={styles.secondaryButton} onPress={onSecondary} activeOpacity={0.8}>
                <Text style={styles.secondaryText}>{secondaryLabel}</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.closeText}>{actionLabel}</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>
    </BottomSheetModal>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>, compact: boolean) =>
  StyleSheet.create({
    content: {
      alignItems: 'center',
      paddingTop: compact ? 12 : 0,
      direction: 'rtl',
    },
    compactCloseRow: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      direction: 'ltr',
      zIndex: 2,
    },
    compactCloseBtn: {
      padding: 4,
    },
    iconContainer: {
      width: compact ? 48 : 64,
      height: compact ? 48 : 64,
      borderRadius: compact ? 24 : 32,
      backgroundColor: theme.colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: compact ? 12 : 16,
    },
    title: {
      color: theme.colors.textPrimary,
      fontSize: compact ? 17 : 22,
      fontWeight: '900',
      marginBottom: compact ? 6 : 8,
      textAlign: 'center',
    },
    message: {
      color: theme.colors.textSecondary,
      fontSize: compact ? 14 : 16,
      lineHeight: compact ? 21 : 24,
      textAlign: 'center',
      marginBottom: 10,
    },
    messageSolo: {
      marginBottom: compact ? 18 : 24,
    },
    emphasis: {
      color: theme.colors.accent,
      fontSize: compact ? 14 : 16,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: compact ? 18 : 24,
      marginTop: 6,
      letterSpacing: -0.2,
    },
    closeButton: {
      width: '100%',
      backgroundColor: theme.colors.accent,
      paddingVertical: compact ? 11 : 14,
      borderRadius: compact ? 12 : 14,
      alignItems: 'center',
    },
    closeText: {
      color: theme.colors.white,
      fontSize: compact ? 15 : 16,
      fontWeight: '800',
    },
    secondaryButton: {
      width: '100%',
      paddingVertical: compact ? 11 : 14,
      borderRadius: compact ? 12 : 14,
      alignItems: 'center',
      marginBottom: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    secondaryText: {
      color: theme.colors.textPrimary,
      fontSize: compact ? 15 : 16,
      fontWeight: '700',
    },
  });
