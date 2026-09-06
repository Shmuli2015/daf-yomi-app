import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import type { TzuratNavigationStyles } from './TzuratNavigationBar.styles';

interface TzuratNavButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  disabled: boolean;
  onPress: () => void;
  styles: TzuratNavigationStyles;
  theme: ReturnType<typeof useTheme>;
  compact?: boolean;
}

export default function TzuratNavButton({
  label,
  icon,
  disabled,
  onPress,
  styles,
  theme,
  compact,
}: TzuratNavButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={[styles.btn, compact && styles.btnCompact, disabled && styles.btnDisabled]}
    >
      <Ionicons
        name={icon}
        size={compact ? 16 : 18}
        color={disabled ? theme.colors.textSecondary : theme.colors.accent}
      />
      <Text style={[styles.btnText, compact && styles.btnTextCompact, disabled && styles.btnTextDisabled]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
