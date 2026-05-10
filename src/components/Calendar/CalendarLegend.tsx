import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme';

const LegendItem = ({
  label,
  icon,
  iconColor,
  isLast,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  isLast?: boolean;
}) => (
  <View style={[styles.legendItem, !isLast && styles.itemBorder]}>
    <View style={styles.legendText}>
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
    <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255,255,255,0.03)' }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
    </View>
  </View>
);

const CalendarLegend = () => {
  return (
    <View style={styles.container}>
      <View style={styles.mainCard}>
        <LegendItem
          label="דף שנלמד"
          icon="checkmark-circle"
          iconColor={THEME.colors.accent}
        />
        <LegendItem
          label="הלימוד להיום"
          icon="calendar"
          iconColor={THEME.colors.textPrimary}
        />
        <LegendItem
          label="טרם נלמד"
          icon="ellipse-outline"
          iconColor={THEME.colors.textMuted}
          isLast
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  mainCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 8,
    ...THEME.shadow.card,
  },
  legendItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 16,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
});

export default CalendarLegend;
