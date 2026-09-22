import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createHomeHeroSwipeHintStyles } from './HomeHeroSwipeHint.styles';

const HomeHeroSwipeHint = React.memo(function HomeHeroSwipeHint() {
  const theme = useTheme();
  const styles = useMemo(() => createHomeHeroSwipeHintStyles(theme), [theme]);

  return (
    <View
      style={styles.container}
      pointerEvents="none"
      accessible
      accessibilityRole="text"
      accessibilityLabel="החלקה למעבר בין ימים"
    >
      <Ionicons
        name="chevron-forward"
        size={13}
        color={theme.colors.textMuted}
        style={styles.chevron}
      />
      <Text style={styles.label}>החלקה למעבר בין ימים</Text>
      <Ionicons
        name="chevron-back"
        size={13}
        color={theme.colors.textMuted}
        style={styles.chevron}
      />
    </View>
  );
});

export default HomeHeroSwipeHint;
