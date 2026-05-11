import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

const LegendItem = ({
  label,
  icon,
  iconColor,
  isLast,
  dividerColor,
  labelStyle,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  isLast?: boolean;
  dividerColor: string;
  labelStyle: TextStyle;
}) => (
  <View style={[itemStyles.item, !isLast && { borderBottomWidth: 1, borderBottomColor: dividerColor }]}>
    <View style={itemStyles.textContainer}>
      <Text style={labelStyle}>{label}</Text>
    </View>
    <View style={itemStyles.iconWrapper}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
  </View>
);

const itemStyles = StyleSheet.create({
  item: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  textContainer: { flex: 1, alignItems: 'flex-end' },
  iconWrapper: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});

const CalendarLegend = () => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.mainCard}>
        <LegendItem
          label="דף שנלמד"
          icon="checkmark-circle"
          iconColor={theme.colors.accent}
          dividerColor={theme.colors.border}
          labelStyle={styles.legendLabel}
        />
        <LegendItem
          label="הלימוד להיום"
          icon="calendar"
          iconColor={theme.colors.textPrimary}
          dividerColor={theme.colors.border}
          labelStyle={styles.legendLabel}
        />
        <LegendItem
          label="טרם נלמד"
          icon="ellipse-outline"
          iconColor={theme.colors.textMuted}
          isLast
          dividerColor={theme.colors.border}
          labelStyle={styles.legendLabel}
        />
      </View>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      marginTop: 32,
      paddingHorizontal: 20,
      marginBottom: 40,
    },
    mainCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingVertical: 8,
      ...theme.shadow.card,
    },
    legendLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
  });

export default CalendarLegend;
