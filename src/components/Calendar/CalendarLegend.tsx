import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme';

const LegendItem = ({
  label,
  description,
  icon,
  iconColor,
  bgColor,
  borderColor,
}: {
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  bgColor: string;
  borderColor: string;
}) => (
  <View style={[styles.legendItem, { backgroundColor: bgColor, borderColor }]}>
    <View style={[styles.iconWrapper, { backgroundColor: 'white' }]}>
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <View style={styles.legendText}>
      <Text style={styles.legendLabel}>{label}</Text>
      <Text style={styles.legendDesc}>{description}</Text>
    </View>
  </View>
);

const CalendarLegend = () => {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.accentBar} />
        <Text style={styles.title}>סטטוס לימוד</Text>
      </View>

      <LegendItem
        label="דף שנלמד"
        description="דף שסומן כנלמד במערכת"
        icon="checkmark-circle"
        iconColor={THEME.colors.accent}
        bgColor={THEME.colors.accentLight}
        borderColor="rgba(201,150,60,0.2)"
      />
      <LegendItem
        label="הספק היום"
        description="הלימוד המיועד להיום"
        icon="calendar"
        iconColor={THEME.colors.primary}
        bgColor="rgba(30,41,59,0.05)"
        borderColor="rgba(30,41,59,0.1)"
      />
      <LegendItem
        label="טרם הושלם"
        description="דפים הממתינים ללימוד"
        icon="time-outline"
        iconColor={THEME.colors.muted}
        bgColor="#F8F7F3"
        borderColor={THEME.colors.border}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 4,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
    justifyContent: 'flex-end',
  },
  accentBar: {
    width: 4,
    height: 24,
    backgroundColor: THEME.colors.accent,
    borderRadius: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: THEME.colors.primary,
  },
  legendItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  legendText: {
    flex: 1,
    alignItems: 'flex-end',
  },
  legendLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
  },
  legendDesc: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
    marginTop: 1,
  },
});

export default CalendarLegend;
