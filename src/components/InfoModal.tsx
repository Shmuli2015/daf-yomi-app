import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

interface InfoModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  /** Optional line shown below the message (e.g. email) — accent styling, selectable */
  emphasis?: string;
  actionLabel?: string;
}

export default function InfoModal({
  visible,
  onClose,
  title,
  message,
  emphasis,
  actionLabel = 'הבנתי',
}: InfoModalProps) {
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
    }
  }, [visible, opacity, scale]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity, transform: [{ scale }] }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="information-circle" size={36} color={theme.colors.accent} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.message, !emphasis && styles.messageSolo]}>{message}</Text>
          {emphasis ? (
            <Text style={styles.emphasis} selectable>
              {emphasis}
            </Text>
          ) : null}

          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeText}>{actionLabel}</Text>
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
      maxWidth: 320,
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
      fontSize: 22,
      fontWeight: '900',
      marginBottom: 8,
      textAlign: 'center',
    },
    message: {
      color: theme.colors.textSecondary,
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
      marginBottom: 10,
    },
    messageSolo: {
      marginBottom: 24,
    },
    emphasis: {
      color: theme.colors.accent,
      fontSize: 16,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 24,
      marginTop: 6,
      letterSpacing: -0.2,
    },
    closeButton: {
      width: '100%',
      backgroundColor: theme.colors.accent,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
    },
    closeText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '800',
    },
  });
