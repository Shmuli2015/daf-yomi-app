import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Animated } from 'react-native';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_MARGIN_H = 16;
const BAR_HEIGHT = 64;
const BOTTOM_MARGIN = 10;
const BAR_WIDTH = SCREEN_WIDTH - BAR_MARGIN_H * 2;
const TAB_SLOT_WIDTH = BAR_WIDTH / 4;
const INDICATOR_WIDTH = TAB_SLOT_WIDTH - 14;

const TAB_CONFIG: Record<string, {
  activeIcon: keyof typeof Ionicons.glyphMap;
  inactiveIcon: keyof typeof Ionicons.glyphMap;
  label: string;
}> = {
  Home: { activeIcon: 'home', inactiveIcon: 'home-outline', label: 'ראשי' },
  Calendar: { activeIcon: 'calendar', inactiveIcon: 'calendar-outline', label: 'לוח שנה' },
  History: { activeIcon: 'library', inactiveIcon: 'library-outline', label: 'ש״ס' },
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
      Animated.spring(scale, { toValue: 0.8, damping: 8, stiffness: 250, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, damping: 12, stiffness: 200, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity style={styles.tab} onPress={handlePress} activeOpacity={1}>
      <Animated.View style={[styles.tabContent, { transform: [{ scale }] }]}>
        <Ionicons
          name={isFocused ? config.activeIcon : config.inactiveIcon}
          size={24}
          color={isFocused ? 'white' : 'rgba(255,255,255,0.4)'}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const indicatorAnim = useRef(new Animated.Value(state.index * TAB_SLOT_WIDTH + 7)).current;

  useEffect(() => {
    Animated.spring(indicatorAnim, {
      toValue: state.index * TAB_SLOT_WIDTH + 7,
      damping: 18,
      stiffness: 150,
      useNativeDriver: true,
    }).start();
  }, [state.index]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + BOTTOM_MARGIN }]}>
      <View style={styles.bar}>
        {/* Sliding gold indicator */}
        <Animated.View
          style={[
            styles.indicator,
            { width: INDICATOR_WIDTH, transform: [{ translateX: indicatorAnim }] },
          ]}
        />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    paddingHorizontal: BAR_MARGIN_H,
    paddingTop: 6,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.tabBar,
    borderRadius: 28,
    height: BAR_HEIGHT,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#C9963C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 14,
  },
  indicator: {
    position: 'absolute',
    height: 44,
    backgroundColor: THEME.colors.accent,
    borderRadius: 16,
    top: 10,
    left: 0,
    opacity: 0.9,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: BAR_HEIGHT,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function AppNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Home" component={HomeScreen} />
    </Tab.Navigator>
  );
}
