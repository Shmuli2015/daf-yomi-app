import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { useSheetDismissGesture } from '../../hooks/useSheetDismissGesture';
import SheetDragHandle from '../SheetDragHandle';

export type BulkConfirmVariant =
  | 'markAll'
  | 'unmarkAll'
  | 'markAllPersonal'
  | 'unmarkAllPersonal';

interface BulkActionConfirmOverlayProps {
  variant: BulkConfirmVariant | null;
  dafCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

function getBulkConfirmCopy(variant: BulkConfirmVariant, dafCount: number) {
  if (variant === 'markAll') {
    return {
      title: 'סמן את כל המסכת?',
      message: `פעולה זו תסמן את כל ${dafCount} הדפים במסכת זו כנלמדו בדף יומי`,
    };
  }
  if (variant === 'unmarkAll') {
    return {
      title: 'בטל סימון כל המסכת?',
      message: `פעולה זו תבטל את הסימון של כל ${dafCount} הדפים במסכת זו בדף יומי`,
    };
  }
  if (variant === 'markAllPersonal') {
    return {
      title: 'סמן את כל המסכת באישי?',
      message: `פעולה זו תסמן את כל ${dafCount} הדפים במסכת זו כנלמדו במסלול האישי`,
    };
  }
  return {
    title: 'בטל סימון כל המסכת באישי?',
    message: `פעולה זו תבטל את הסימון של כל ${dafCount} הדפים במסכת זו במסלול האישי`,
  };
}

export default function BulkActionConfirmOverlay({
  variant,
  dafCount,
  onConfirm,
  onCancel,
}: BulkActionConfirmOverlayProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { panHandlers, sheetAnimatedStyle, overlayAnimatedStyle } = useSheetDismissGesture({
    visible: variant !== null,
    onClose: onCancel,
  });

  if (!variant) return null;

  const copy = getBulkConfirmCopy(variant, dafCount);

  return (
    <View style={styles.overlay}>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, styles.overlayDim, overlayAnimatedStyle]}
      />
      <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
      <View style={styles.sheetLayer} pointerEvents="box-none">
      <Animated.View pointerEvents="auto" style={[styles.sheet, sheetAnimatedStyle]}>
        <SafeAreaView edges={['bottom']}>
          <SheetDragHandle panHandlers={panHandlers} />
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.message}>{copy.message}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>ביטול</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.confirmBtn} activeOpacity={0.7}>
              <Text style={styles.confirmBtnText}>אישור</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10000,
    },
    overlayDim: {
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sheetLayer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
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
