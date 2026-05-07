import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Linking, StyleSheet, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../theme';

interface HomeHeaderProps {
  gregorianDateStr: string;
  hebrewDateStr: string;
  todayMasechet: string;
  todayDafNum: string;
  sefariaUrl: string;
}

export default function HomeHeader({
  gregorianDateStr,
  hebrewDateStr,
  todayMasechet,
  todayDafNum,
  sefariaUrl,
}: HomeHeaderProps) {
  const cleanHebrewDate = hebrewDateStr.replace(/[\u0591-\u05C7]/g, '');

  const heroOpacity = useRef(new Animated.Value(0)).current;
  const heroTranslateY = useRef(new Animated.Value(-24)).current;
  const cardScale = useRef(new Animated.Value(0.88)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.timing(heroTranslateY, { toValue: 0, duration: 450, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();

    Animated.parallel([
      Animated.spring(cardScale, { toValue: 1, damping: 14, stiffness: 100, delay: 200, useNativeDriver: true }),
      Animated.timing(cardOpacity, { toValue: 1, duration: 400, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity: heroOpacity, transform: [{ translateY: heroTranslateY }] }}>
      {/* Dark navy hero */}
      <View style={styles.hero}>
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        <View style={styles.topRow}>
          <View style={styles.datePill}>
            <Text style={styles.gregorianDate}>{gregorianDateStr}</Text>
          </View>
          <View style={styles.hebrewDateContainer}>
            <Text style={styles.hebrewDate}>{cleanHebrewDate}</Text>
            <View style={styles.goldUnderline} />
          </View>
        </View>

        <View style={styles.labelRow}>
          <View style={styles.labelLine} />
          <Text style={styles.labelText}>הדף היומי</Text>
          <View style={styles.labelLine} />
        </View>
      </View>

      {/* Floating white card */}
      <Animated.View style={[styles.dafCard, { transform: [{ scale: cardScale }], opacity: cardOpacity }]}>
        <Text style={styles.masechetName}>{todayMasechet}</Text>
        <View style={styles.dafBadge}>
          <Text style={styles.dafNumber}>{todayDafNum}</Text>
        </View>
        <TouchableOpacity
          onPress={() => Linking.openURL(sefariaUrl)}
          style={styles.sefariaButton}
          activeOpacity={0.75}
        >
          <Ionicons name="book-outline" size={16} color={THEME.colors.accent} />
          <Text style={styles.sefariaText}>ללימוד בספריא</Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: THEME.colors.primary,
    paddingTop: 58,
    paddingBottom: 76,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  decorCircle1: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(201,150,60,0.06)',
    top: -70,
    right: -60,
  },
  decorCircle2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.025)',
    bottom: 10,
    left: -50,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  datePill: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  gregorianDate: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  hebrewDateContainer: {
    alignItems: 'flex-end',
  },
  hebrewDate: {
    color: 'white',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  goldUnderline: {
    width: 32,
    height: 2.5,
    backgroundColor: THEME.colors.accent,
    borderRadius: 2,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  labelLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(201,150,60,0.2)',
  },
  labelText: {
    color: THEME.colors.accent,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3.5,
    textTransform: 'uppercase',
  },
  dafCard: {
    backgroundColor: THEME.colors.surface,
    marginHorizontal: 20,
    marginTop: -52,
    borderRadius: 36,
    paddingVertical: 28,
    paddingHorizontal: 28,
    alignItems: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.13,
    shadowRadius: 28,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(232,227,216,0.7)',
  },
  masechetName: {
    fontSize: 42,
    fontWeight: '900',
    color: THEME.colors.primary,
    textAlign: 'center',
    letterSpacing: -1,
    marginBottom: 16,
  },
  dafBadge: {
    backgroundColor: THEME.colors.accent,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 9999,
    marginBottom: 20,
    shadowColor: THEME.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 5,
  },
  dafNumber: {
    color: 'white',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  sefariaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: THEME.colors.accentLight,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(201,150,60,0.22)',
  },
  sefariaText: {
    color: THEME.colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
