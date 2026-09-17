import React, { useRef } from 'react';
import { TouchableOpacity, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import type { TzuratNavigationStyles } from './TzuratNavigationBar.styles';

interface TzuratNavButtonProps {
  label?: string;
  accessibilityLabel: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconSize: number;
  disabled: boolean;
  onPress: () => void;
  styles: TzuratNavigationStyles;
  theme: ReturnType<typeof useTheme>;
  iconOnly?: boolean;
}

export default function TzuratNavButton({
  label,
  accessibilityLabel,
  icon,
  iconSize,
  disabled,
  onPress,
  styles,
  theme,
  iconOnly,
}: TzuratNavButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!disabled) {
      Animated.spring(scaleAnim, {
        toValue: 0.93,
        useNativeDriver: true,
        speed: 20,
      }).start();
    }
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.btn,
        iconOnly ? styles.btnDaf : styles.btnAmud,
        disabled && styles.btnDisabled,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityState={{ disabled }}
        style={styles.btnInner}
      >
        <Ionicons
          name={icon}
          size={iconSize}
          color={disabled ? theme.colors.textSecondary : theme.colors.accent}
        />
        {label && !iconOnly ? (
          <Text style={[styles.btnText, disabled && styles.btnTextDisabled]}>
            {label}
          </Text>
        ) : null}
      </TouchableOpacity>
    </Animated.View>
  );
}
