import React, { useMemo, useRef, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { TAB_CONFIG } from './tabConfig';
import { triggerSelection } from '../utils/haptics';

type Props = {
  isFocused: boolean;
  config: typeof TAB_CONFIG[string];
  onPress: () => void;
};

export default function TabButton({ isFocused, config, onPress }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const pressScale = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(isFocused ? 1 : 0.88)).current;

  useEffect(() => {
    Animated.spring(iconScale, {
      toValue: isFocused ? 1 : 0.88,
      damping: 14,
      stiffness: 280,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  const handlePress = () => {
    void triggerSelection();
    Animated.sequence([
      Animated.spring(pressScale, { toValue: 0.88, damping: 10, stiffness: 320, useNativeDriver: true }),
      Animated.spring(pressScale, { toValue: 1, damping: 12, stiffness: 220, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity style={styles.tab} onPress={handlePress} activeOpacity={1}>
      <Animated.View style={[styles.tabInner, { transform: [{ scale: pressScale }] }]}>
        <Animated.View style={[styles.iconWrapper, { transform: [{ scale: iconScale }] }]}>
          <Ionicons
            name={isFocused ? config.activeIcon : config.inactiveIcon}
            size={24}
            color={isFocused ? theme.colors.accent : theme.colors.textSecondary}
          />
        </Animated.View>
        <Text
          style={[
            styles.tabLabel,
            isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
          ]}
        >
          {config.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabInner: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
    },
    iconWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabLabel: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 5,
      letterSpacing: 0.2,
    },
    tabLabelInactive: {
      color: theme.colors.textSecondary,
    },
    tabLabelActive: {
      color: theme.colors.accent,
    },
  });
