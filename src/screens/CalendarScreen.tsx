import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HebrewCalendar from '../components/HebrewCalendar';
import CalendarHeader from '../components/Calendar/CalendarHeader';
import ScreenTopGradient from '../components/ScreenTopGradient';

import { useTheme } from '../theme';

export default function CalendarScreen() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.outer}>
      <ScreenTopGradient />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <CalendarHeader />
          <HebrewCalendar />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    outer: {
      flex: 1,
      position: 'relative',
      backgroundColor: theme.colors.background,
    },
    safeArea: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    scroll: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    content: {
      paddingTop: 24,
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
  });
