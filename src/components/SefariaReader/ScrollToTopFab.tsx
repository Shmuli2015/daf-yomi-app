import React, { useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { triggerImpact } from '../../utils/haptics';
import { createScrollToTopFabStyles } from './ScrollToTopFab.styles';

interface ScrollToTopFabProps {
  visible: boolean;
  onPress: () => void;
  accentColor?: string;
}

export default function ScrollToTopFab({
  visible,
  onPress,
  accentColor,
}: ScrollToTopFabProps) {
  const theme = useTheme();
  const styles = useMemo(() => createScrollToTopFabStyles(theme), [theme]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(visible ? 1 : 0, { duration: 150 }),
    transform: [{ scale: withTiming(visible ? 1 : 0.7, { duration: 150 }) }],
  }));

  const handlePress = () => {
    triggerImpact('light');
    onPress();
  };

  return (
    <Animated.View
      style={[styles.fab, animatedStyle]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons
          name="arrow-up"
          size={22}
          color={accentColor || theme.colors.accent}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}
