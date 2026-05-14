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
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.screenRoot}>
        <ScreenTopGradient />
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <CalendarHeader />
          <HebrewCalendar />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    screenRoot: {
      flex: 1,
      position: 'relative',
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
