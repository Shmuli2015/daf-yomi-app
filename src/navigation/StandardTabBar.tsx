import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { TAB_CONFIG } from './tabConfig';
import TabButton from './TabButton';
import { subscribeHomeTabFocus } from '../utils/homeTabFocus';

export default function StandardTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    return subscribeHomeTabFocus(() => {
      navigation.navigate('Home');
    });
  }, [navigation]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom > 0 ? insets.bottom : 12 }]}>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const config = TAB_CONFIG[route.name];
        if (!config) return null;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabButton key={route.key} isFocused={isFocused} config={config} onPress={onPress} />
        );
      })}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: theme.colors.tabBar,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      paddingTop: 8,
      ...theme.shadow.tabBar,
    },
  });
