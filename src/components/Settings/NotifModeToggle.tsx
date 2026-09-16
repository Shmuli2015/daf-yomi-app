import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { useModeSwitcherIndicator } from '../../hooks/useModeSwitcherIndicator';
import { createNotifModeToggleStyles } from './NotifModeToggle.styles';

type Mode = 'daily' | 'custom';

interface Props {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

const TABS: Array<{ id: Mode; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { id: 'custom', label: 'לפי ימים', icon: 'grid-outline' },
  { id: 'daily', label: 'כל יום', icon: 'calendar-outline' },
];

const MODE_IDS = TABS.map(tab => tab.id);

export const NotifModeToggle = ({ mode, onChange }: Props) => {
  const theme = useTheme();
  const styles = useMemo(() => createNotifModeToggleStyles(theme), [theme]);
  const { onSwitcherLayout, indicatorStyle, isReady } = useModeSwitcherIndicator(mode, MODE_IDS);

  return (
    <View style={styles.container}>
      <View style={styles.segmentedControl} onLayout={onSwitcherLayout}>
        <Animated.View pointerEvents="none" style={[styles.indicator, indicatorStyle]} />
        {TABS.map(tab => {
          const isActive = mode === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.btn, isActive && !isReady && styles.btnActiveFallback]}
              onPress={() => onChange(tab.id)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={tab.icon}
                size={15}
                color={isActive ? theme.colors.white : theme.colors.textSecondary}
              />
              <Text style={[styles.btnText, isActive && styles.btnTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
