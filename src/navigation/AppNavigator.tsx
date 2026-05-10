import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Animated, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

const TAB_CONFIG: Record<string, {
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
  label: string;
}> = {
  Home: { activeIcon: 'home', inactiveIcon: 'home-outline', label: 'ראשי' },
  Calendar: { activeIcon: 'calendar', inactiveIcon: 'calendar-outline', label: 'לוח שנה' },
  History: { activeIcon: 'stats-chart', inactiveIcon: 'stats-chart-outline', label: 'ש״ס' },
  Settings: { activeIcon: 'settings', inactiveIcon: 'settings-outline', label: 'הגדרות' },
};

function TabButton({
  isFocused,
  config,
  onPress,
}: {
  isFocused: boolean;
  config: typeof TAB_CONFIG[string];
  onPress: () => void;
}) {
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
        { transform: [{ scale }] }
      ]}>
        <Ionicons
          name={isFocused ? config.activeIcon : config.inactiveIcon}
          size={22}
          color={isFocused ? THEME.colors.accent : THEME.colors.textSecondary}
        />
        <Text style={[
          styles.tabLabel, 
          isFocused ? styles.tabLabelActive : styles.tabLabelInactive
        ]}>
          {config.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function StandardTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  
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

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingTop: 12,
  },
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
    backgroundColor: THEME.colors.accentLight,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  tabLabelInactive: {
    color: THEME.colors.textSecondary,
  },
  tabLabelActive: {
    color: THEME.colors.accent,
  },
});

export default function AppNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <StandardTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
