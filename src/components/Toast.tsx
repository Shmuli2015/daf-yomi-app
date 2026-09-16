import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { createToastStyles } from './Toast.styles';

export type ToastIconName = keyof typeof Ionicons.glyphMap;

interface ToastProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  iconName?: ToastIconName;
  extraBottom?: number;
}

export default function Toast({
  visible,
  onClose,
  title,
  message,
  iconName = 'information-circle',
  extraBottom = 0,
}: ToastProps) {
  const theme = useTheme();
  const styles = useMemo(() => createToastStyles(theme), [theme]);

  if (!visible) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: 8 + extraBottom }]}
    >
      <Pressable
        onPress={onClose}
        style={styles.card}
        accessibilityRole="button"
        accessibilityLabel="סגור"
      >
        <View style={styles.iconBox}>
          <Ionicons name={iconName} size={18} color={theme.colors.accent} />
        </View>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </Pressable>
    </View>
  );
}
