import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

export type InfoModalIconName = keyof typeof Ionicons.glyphMap;

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  /** Optional line shown below the message (e.g. email) — accent styling, selectable */
  emphasis?: string;
  actionLabel?: string;
  /** Ionicons glyph — default info circle */
  iconName?: InfoModalIconName;
  /** Tighter card and typography for lightweight notices */
  compact?: boolean;
}

export default function InfoModal({
  visible,
  onClose,
  title,
  message,
  emphasis,
  actionLabel = 'הבנתי',
  iconName = 'information-circle',
  compact = false,
}: InfoModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme, compact), [theme, compact]);
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 100, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, opacity, scale]);

  if (!visible) return null;

  const card = (
    <Animated.View style={[styles.container, { opacity, transform: [{ scale }] }]}>
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
        <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
          <Text style={styles.closeText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </Animated.View>
  );

  return (
    <Modal transparent visible={visible} animationType="none">
      {compact ? (
        <View style={styles.overlayCompact}>
          <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="סגור" />
          {card}
        </View>
      ) : (
        <View style={styles.overlay}>{card}</View>
      )}
    </Modal>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>, compact: boolean) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    overlayCompact: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.7)',
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: compact ? 18 : 24,
      padding: compact ? 18 : 24,
      paddingTop: compact ? 36 : 24,
      width: '100%',
      maxWidth: compact ? 280 : 320,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      direction: 'rtl',
    },
    compactCloseRow: {
      position: 'absolute',
      top: 10,
      left: 10,
      right: 10,
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
      color: '#FFFFFF',
      fontSize: compact ? 15 : 16,
      fontWeight: '800',
    },
  });
