import React, { useMemo, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { TAB_CONFIG } from './tabConfig';

type Props = {
  isFocused: boolean;
  config: typeof TAB_CONFIG[string];
  onPress: () => void;
};

export default function TabButton({ isFocused, config, onPress }: Props) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.9, damping: 10, stiffness: 300, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 200, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity style={styles.tab} onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[
        styles.tabContent,
        isFocused && styles.tabContentActive,
        { transform: [{ scale }] },
      ]}>
        <Ionicons
          name={isFocused ? config.activeIcon : config.inactiveIcon}
          size={22}
          color={isFocused ? theme.colors.accent : theme.colors.textSecondary}
        />
        <Text style={[
          styles.tabLabel,
          isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
        ]}>
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
    tabContent: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 12,
    },
    tabContentActive: {
      backgroundColor: theme.colors.accentLight,
    },
    tabLabel: {
      fontSize: 11,
      fontWeight: '600',
      marginTop: 4,
    },
    tabLabelInactive: {
      color: theme.colors.textSecondary,
    },
    tabLabelActive: {
      color: theme.colors.accent,
    },
  });
