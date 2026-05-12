import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { useTheme } from '../../theme';

export type BulkConfirmVariant = 'markAll' | 'unmarkAll';

interface BulkActionConfirmOverlayProps {
  variant: BulkConfirmVariant | null;
  dafCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function BulkActionConfirmOverlay({
  variant,
  dafCount,
  onConfirm,
  onCancel,
}: BulkActionConfirmOverlayProps) {
  const { width: windowWidth } = useWindowDimensions();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme, windowWidth), [theme, windowWidth]);

  if (!variant) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.title}>
          {variant === 'markAll' ? 'סמן את כל המסכת?' : 'בטל סימון כל המסכת?'}
        </Text>
        <Text style={styles.message}>
          {variant === 'markAll'
            ? `פעולה זו תסמן את כל ${dafCount} הדפים במסכת זו כנלמדו`
            : `פעולה זו תבטל את הסימון של כל ${dafCount} הדפים במסכת זו`}
        </Text>
        <View style={styles.buttons}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelBtn} activeOpacity={0.7}>
            <Text style={styles.cancelBtnText}>ביטול</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onConfirm} style={styles.confirmBtn} activeOpacity={0.7}>
            <Text style={styles.confirmBtnText}>אישור</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>, windowWidth: number) =>
  StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10000,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      padding: 24,
      marginHorizontal: 32,
      width: windowWidth - 64,
      maxWidth: 400,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: '900',
      color: theme.colors.primary,
      marginBottom: 12,
      textAlign: 'center',
    },
    message: {
      fontSize: 15,
      color: theme.colors.textSecondary,
      marginBottom: 24,
      textAlign: 'center',
      lineHeight: 22,
    },
    buttons: {
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'center',
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 12,
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
    },
    cancelBtnText: {
      color: theme.colors.textSecondary,
      fontWeight: '700',
      fontSize: 16,
    },
    confirmBtn: {
      flex: 1,
      paddingVertical: 12,
      backgroundColor: theme.colors.accent,
      borderRadius: 12,
      alignItems: 'center',
    },
    confirmBtnText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 16,
    },
  });
