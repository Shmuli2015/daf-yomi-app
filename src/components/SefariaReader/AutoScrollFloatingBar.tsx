import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { triggerSelection } from '../../utils/haptics';
import type { AutoScrollSpeedLevel } from '../../hooks/useAutoScroll';
import { createAutoScrollFloatingBarStyles } from './AutoScrollFloatingBar.styles';

const SPEED_LEVELS: AutoScrollSpeedLevel[] = [1, 2, 3, 4, 5];

interface AutoScrollFloatingBarProps {
  isPaused: boolean;
  level: AutoScrollSpeedLevel;
  bottomOffset?: number;
  onTogglePlayPause: () => void;
  onChangeLevel: (level: AutoScrollSpeedLevel) => void;
  onClose: () => void;
}

export default function AutoScrollFloatingBar({
  isPaused,
  level,
  bottomOffset,
  onTogglePlayPause,
  onChangeLevel,
  onClose,
}: AutoScrollFloatingBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createAutoScrollFloatingBarStyles(theme), [theme]);

  const effectiveBottom = bottomOffset ?? Math.max(insets.bottom + 8, 16);

  const handleToggle = () => {
    void triggerSelection();
    onTogglePlayPause();
  };

  const handleSelectLevel = (selectedLevel: AutoScrollSpeedLevel) => {
    void triggerSelection();
    onChangeLevel(selectedLevel);
  };

  const handleClose = () => {
    void triggerSelection();
    onClose();
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      exiting={FadeOutDown.duration(180)}
      style={[styles.container, { bottom: effectiveBottom }]}
    >
      <TouchableOpacity
        style={styles.playPauseBtn}
        onPress={handleToggle}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={isPaused ? 'המשך גלילה' : 'השהה גלילה'}
      >
        <Ionicons
          name={isPaused ? 'play' : 'pause'}
          size={14}
          color={theme.colors.surface}
        />
        <Text style={styles.playPauseBtnText}>
          {isPaused ? 'המשך' : 'השהה'}
        </Text>
      </TouchableOpacity>

      <View style={styles.speedSelector}>
        {SPEED_LEVELS.map((lvl) => {
          const isActive = lvl === level;
          return (
            <TouchableOpacity
              key={lvl}
              style={[styles.speedBtn, isActive && styles.speedBtnActive]}
              onPress={() => handleSelectLevel(lvl)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`מהירות ${lvl}`}
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[
                  styles.speedBtnText,
                  isActive && styles.speedBtnTextActive,
                ]}
              >
                {lvl}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={styles.closeBtn}
        onPress={handleClose}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="סגור גלילה אוטומטית"
      >
        <Ionicons name="close" size={16} color={theme.colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}
