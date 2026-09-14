import React, { useMemo } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createFullscreenExitButtonStyles } from './fullscreenExitButtonStyles';

interface FullscreenExitButtonProps {
  onPress: () => void;
}

export default function FullscreenExitButton({ onPress }: FullscreenExitButtonProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createFullscreenExitButtonStyles(theme), [theme]);

  const safeBottom = Math.max(insets.bottom, 48) + 16;

  return (
    <TouchableOpacity
      style={[styles.container, { bottom: safeBottom }]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="צא ממסך מלא"
    >
      <Ionicons name="contract-outline" size={16} color={theme.colors.accent} />
      <Text style={styles.text}>צא ממסך מלא</Text>
    </TouchableOpacity>
  );
}
