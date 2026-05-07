import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HebrewCalendar from '../components/HebrewCalendar';
import CalendarHeader from '../components/Calendar/CalendarHeader';
import CalendarLegend from '../components/Calendar/CalendarLegend';
import { THEME } from '../theme';

export default function CalendarScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <CalendarHeader />
        <HebrewCalendar />
        <CalendarLegend />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingVertical: 24,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
});
