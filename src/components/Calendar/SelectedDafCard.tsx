import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet, Animated } from 'react-native';
import { HDate } from '@hebcal/core';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme';

interface SelectedDafCardProps {
  selectedDate: HDate;
  dafInfo: {
    masechet: string;
    daf: string;
    dateString: string;
    sefariaUrl: string;
  };
  isLearned: boolean;
  onToggle?: () => void;
}

const SelectedDafCard = ({ selectedDate, dafInfo, isLearned, onToggle }: SelectedDafCardProps) => {
  const isFuture = dafInfo.dateString > new Date().toISOString().split('T')[0];

  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, damping: 14, stiffness: 100, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  }, []);

  const cleanHebDate = selectedDate.renderGematriya().replace(/[\u0591-\u05C7]/g, '');
  const gregDateStr = new Date(dafInfo.dateString).toLocaleDateString('he-IL', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const toggleBg = isLearned ? THEME.colors.successLight : THEME.colors.accentLight;
  const toggleBorder = isLearned ? '#BBF7D0' : 'rgba(201,150,60,0.3)';
  const toggleIconColor = isLearned ? THEME.colors.success : THEME.colors.accent;
  const toggleTextColor = isLearned ? '#16A34A' : THEME.colors.accent;
  const toggleIconName = isLearned ? 'checkmark-done' : isFuture ? 'calendar-outline' : 'book-outline';
  const toggleLabel = isLearned ? 'אשריך! סיימת' : isFuture ? 'למדתי מראש' : 'סמן כנלמד';

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }], opacity }]}>
      <View style={styles.dateRow}>
        <View style={styles.dateInfo}>
          <Text style={styles.hebDate}>{cleanHebDate}</Text>
          <Text style={styles.gregDate}>{gregDateStr}</Text>
        </View>
        <View style={styles.dateBadge}>
          <Text style={styles.dateBadgeText}>סדר הלימוד</Text>
        </View>
      </View>

      <View style={styles.dafInfoCard}>
        <Text style={styles.masechetName}>{dafInfo.masechet}</Text>
        <View style={styles.dafRow}>
          <View style={styles.dafDivider} />
          <Text style={styles.dafText}>{dafInfo.daf}</Text>
          <View style={styles.dafDivider} />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onToggle}
          activeOpacity={0.85}
          style={[styles.toggleBtn, { backgroundColor: toggleBg, borderColor: toggleBorder }]}
        >
          <View style={styles.toggleIconWrapper}>
            <Ionicons name={toggleIconName} size={18} color={toggleIconColor} />
          </View>
          <Text style={[styles.toggleText, { color: toggleTextColor }]}>{toggleLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Linking.openURL(dafInfo.sefariaUrl)}
          activeOpacity={0.7}
          style={styles.sefariaBtn}
        >
          <View style={styles.sefariaIconWrapper}>
            <Ionicons name="open-outline" size={16} color={THEME.colors.textSecondary} />
          </View>
          <Text style={styles.sefariaText}>פתח בספריא (Sefaria)</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { paddingTop: 0 },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateBadge: {
    backgroundColor: THEME.colors.accentLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(201,150,60,0.15)',
  },
  dateBadgeText: {
    color: THEME.colors.accent,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  dateInfo: { alignItems: 'flex-start' },
  hebDate: { fontSize: 14, fontWeight: '900', color: THEME.colors.primary },
  gregDate: { fontSize: 9, fontWeight: '600', color: THEME.colors.textMuted, marginTop: 1 },
  dafInfoCard: {
    backgroundColor: THEME.colors.background,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  masechetName: {
    fontSize: 28,
    fontWeight: '900',
    color: THEME.colors.primary,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  dafRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dafDivider: { width: 20, height: 1.2, backgroundColor: 'rgba(201,150,60,0.3)', borderRadius: 1 },
  dafText: { fontSize: 18, fontWeight: '800', color: THEME.colors.accent },
  actions: { gap: 8 },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 8,
  },
  toggleIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleText: { fontSize: 15, fontWeight: '900', letterSpacing: -0.1 },
  sefariaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: THEME.colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 6,
  },
  sefariaIconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sefariaText: { color: THEME.colors.textSecondary, fontWeight: '700', fontSize: 13 },
});

export default SelectedDafCard;
