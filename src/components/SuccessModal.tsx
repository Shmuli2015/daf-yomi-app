import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export default function SuccessModal({ visible, onClose, title, message }: SuccessModalProps) {
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
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <View style={styles.overlay}>
        <Animated.View style={[styles.container, { opacity, transform: [{ scale }] }]}>
          <View style={styles.iconContainer}>
            <Ionicons name="checkmark-circle" size={36} color={theme.colors.success} />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.closeText}>מעולה</Text>
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
      // @ts-ignore
      direction: 'rtl',
    },
    iconContainer: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(34,197,94,0.1)',
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
      lineHeight: 22,
      textAlign: 'center',
      marginBottom: 24,
    },
    closeButton: {
      width: '100%',
      backgroundColor: theme.colors.success,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
    },
    closeText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '800',
    },
  });
