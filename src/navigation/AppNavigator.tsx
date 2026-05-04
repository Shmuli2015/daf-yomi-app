import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import CalendarScreen from '../screens/CalendarScreen';
import HistoryScreen from '../screens/HistoryScreen';
import StatsScreen from '../screens/StatsScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: 'gray',
        headerTitleAlign: 'center',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'ראשי' }} 
      />
      <Tab.Screen 
        name="Calendar" 
        component={CalendarScreen} 
        options={{ title: 'לוח שנה' }} 
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen} 
        options={{ title: 'היסטוריה' }} 
      />
      <Tab.Screen 
        name="Stats" 
        component={StatsScreen} 
        options={{ title: 'סטטיסטיקות' }} 
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen} 
        options={{ title: 'הגדרות' }} 
      />
    </Tab.Navigator>
  );
}
