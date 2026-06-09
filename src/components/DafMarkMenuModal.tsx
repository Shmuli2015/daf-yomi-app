import React, { useEffect, useRef, useMemo } from 'react';
import { Text, StyleSheet, TouchableOpacity, Modal, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

interface DafMarkMenuModalProps {
  visible: boolean;
  onSelectFull: () => void;
  onSelectHalfA: () => void;
  onSelectHalfB: () => void;
  onCancel: () => void;
  showUnmark?: boolean;
  onUnmark?: () => void;
}

export default function DafMarkMenuModal({
  visible,
  onSelectFull,
  onSelectHalfA,
  onSelectHalfB,
  onCancel,
  showUnmark = false,
  onUnmark,
}: DafMarkMenuModalProps) {
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
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.panel} onPress={(e) => e.stopPropagation()}>
          <Animated.View style={[styles.container, { opacity, transform: [{ scale }] }]}>
            <Text style={styles.title}>סימון לימוד</Text>
            <Text style={styles.subtitle}>בחר כמה למדת היום</Text>

            <TouchableOpacity style={styles.optionButton} onPress={onSelectFull} activeOpacity={0.8}>
              <Ionicons name="checkmark-circle" size={22} color={theme.colors.success} />
              <Text style={styles.optionText}>דף מלא</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={onSelectHalfA} activeOpacity={0.8}>
              <Ionicons name="remove-circle-outline" size={22} color={theme.colors.accent} />
              <Text style={styles.optionText}>חצי דף (א)</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionButton} onPress={onSelectHalfB} activeOpacity={0.8}>
              <Ionicons name="remove-circle-outline" size={22} color={theme.colors.accent} />
              <Text style={styles.optionText}>חצי דף (ב)</Text>
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
          </Animated.View>
        </Pressable>
      </Pressable>
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
    panel: {
      width: '100%',
      maxWidth: 360,
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      padding: 24,
      width: '100%',
      borderWidth: 1,
      borderColor: theme.colors.border,
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
