import React, { forwardRef, useId, useMemo } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Defs, G, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
import { CARD_SIZE, type ShareProgressData } from '../../utils/shareProgressImage';

const COLORS = {
  accent: '#C9963C',
  accentMid: '#B88620',
  accentDeep: '#8B6914',
  surface: '#FFFCF9',
  surface2: '#FFF8F0',
  primary: '#0F172A',
  textSecondary: '#334155',
  muted: '#64748B',
  progressTrack: '#E2E8F0',
  accentLight: 'rgba(201,150,60,0.18)',
  accentGlow: 'rgba(201,150,60,0.35)',
};

const RING_SIZE = 400;
const RING_RADIUS = 152;
const STROKE_WIDTH = 32;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface ShareProgressCardProps {
  data: ShareProgressData;
  onLayout?: (e: LayoutChangeEvent) => void;
}

const ShareProgressCard = forwardRef<View, ShareProgressCardProps>(function ShareProgressCard(
  { data, onLayout },
  ref,
) {
  const styles = useMemo(() => createStyles(), []);
  const svgGradIdRaw = useId();
  const goldArcId = useMemo(() => `shareGold_${svgGradIdRaw.replace(/\W/g, '')}`, [svgGradIdRaw]);

  return (
    <View ref={ref} style={styles.root} collapsable={false} onLayout={onLayout}>
      <LinearGradient
        colors={[COLORS.surface2, COLORS.surface, '#FFFFFF', COLORS.surface2]}
        locations={[0, 0.35, 0.72, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={[`${COLORS.accent}22`, 'transparent', `${COLORS.accent}14`]}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.decorTop} />
      <View style={styles.decorBottom} />

      <View style={styles.content}>
        {data.variant === 'streak' ? (
          <View style={styles.streakBody}>
            <Text style={styles.streakEyebrow}>ההישג שלי כרגע</Text>

            <View style={styles.flameOuter}>
              <LinearGradient
                colors={['rgba(255,255,255,0.95)', COLORS.surface2]}
                style={styles.flameRing}
              >
                <View style={styles.flameInnerGlow}>
                  <Ionicons name="flame" size={132} color={COLORS.accent} />
                </View>
              </LinearGradient>
            </View>

            <View style={styles.streakTextBlock}>
              <Text style={styles.streakValue}>{data.streak}</Text>
              <Text style={styles.streakLabel}>ימים ברצף</Text>
            </View>

            <View style={styles.datePill}>
              <Text style={styles.hebrewDate}>{data.hebrewDate}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.shasBody}>
            <View style={styles.ringStack}>
              <View style={styles.ringGlow} />
              <View style={styles.ringContainer}>
              <Svg width={RING_SIZE} height={RING_SIZE}>
                <Defs>
                  <SvgGradient id={goldArcId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <Stop offset="0%" stopColor="#E8C97C" />
                    <Stop offset="45%" stopColor={COLORS.accent} />
                    <Stop offset="100%" stopColor={COLORS.accentDeep} />
                  </SvgGradient>
                </Defs>
                <G transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}>
                  <Circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RING_RADIUS}
                    stroke={COLORS.progressTrack}
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                  />
                  <Circle
                    cx={RING_SIZE / 2}
                    cy={RING_SIZE / 2}
                    r={RING_RADIUS}
                    stroke={`url(#${goldArcId})`}
                    strokeWidth={STROKE_WIDTH}
                    fill="none"
                    strokeDasharray={`${CIRCUMFERENCE}`}
                    strokeDashoffset={CIRCUMFERENCE * (1 - data.progress)}
                    strokeLinecap="round"
                  />
                </G>
              </Svg>
              <View style={styles.ringCenter}>
                <Text style={styles.ringPercent}>{data.percentage}%</Text>
                <Text style={styles.ringPercentLabel}>מהש״ס</Text>
              </View>
              </View>
            </View>

            <View style={styles.statsRow}>
              <LinearGradient colors={['#FFFFFF', COLORS.surface2]} style={styles.statCard}>
                <Text style={styles.statValue}>{data.learnedDafim}</Text>
                <Text style={styles.statLabel}>דפים נלמדו</Text>
              </LinearGradient>
              <LinearGradient colors={['#FFFFFF', COLORS.surface2]} style={styles.statCard}>
                <Text style={styles.statValue}>{data.completedMasechtot}</Text>
                <Text style={styles.statLabel}>מסכתות שהושלמו</Text>
              </LinearGradient>
            </View>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLineWrap}>
          <LinearGradient
            colors={[`${COLORS.accent}00`, COLORS.accent, `${COLORS.accent}00`]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.footerGradientLine}
          />
        </View>
        <View style={styles.branding}>
          <View style={styles.logoOuter}>
            <Image source={require('../../../assets/icon.png')} style={styles.logo} />
          </View>
          <View>
            <Text style={styles.appName}>מסע דף</Text>
            <Text style={styles.appTagline}>מעקב דף יומי</Text>
          </View>
        </View>
      </View>
    </View>
  );
});

export default ShareProgressCard;

const createStyles = () =>
  StyleSheet.create({
    root: {
      width: CARD_SIZE,
      height: CARD_SIZE,
      direction: 'rtl',
      overflow: 'hidden',
      backgroundColor: COLORS.surface,
    },
    decorTop: {
      position: 'absolute',
      top: -120,
      right: -80,
      width: 440,
      height: 440,
      borderRadius: 220,
      backgroundColor: COLORS.accentGlow,
      opacity: 0.55,
    },
    decorBottom: {
      position: 'absolute',
      bottom: -100,
      left: -100,
      width: 380,
      height: 380,
      borderRadius: 190,
      backgroundColor: 'rgba(201,150,60,0.12)',
      opacity: 0.9,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 64,
    },
    streakBody: {
      alignItems: 'center',
      gap: 40,
    },
    streakEyebrow: {
      fontSize: 28,
      fontWeight: '700',
      color: COLORS.accentMid,
      letterSpacing: 1,
      textTransform: 'none',
      marginBottom: -12,
    },
    flameOuter: {
      shadowColor: COLORS.accentDeep,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.22,
      shadowRadius: 32,
      elevation: 12,
      borderRadius: 140,
    },
    flameRing: {
      width: 280,
      height: 280,
      borderRadius: 140,
      padding: 8,
      borderWidth: 2,
      borderColor: 'rgba(201,150,60,0.35)',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
    flameInnerGlow: {
      width: 246,
      height: 246,
      borderRadius: 123,
      backgroundColor: COLORS.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    streakTextBlock: {
      alignItems: 'center',
    },
    streakValue: {
      fontSize: 168,
      fontWeight: '900',
      color: COLORS.primary,
      letterSpacing: -6,
      lineHeight: 176,
      textShadowColor: 'rgba(201,150,60,0.15)',
      textShadowOffset: { width: 0, height: 4 },
      textShadowRadius: 8,
    },
    streakLabel: {
      fontSize: 52,
      fontWeight: '800',
      color: COLORS.textSecondary,
      marginTop: -6,
      letterSpacing: -0.5,
    },
    datePill: {
      paddingVertical: 20,
      paddingHorizontal: 40,
      borderRadius: 100,
      backgroundColor: '#FFFFFF',
      borderWidth: 1.5,
      borderColor: 'rgba(201,150,60,0.28)',
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 16,
      elevation: 3,
    },
    hebrewDate: {
      fontSize: 36,
      fontWeight: '800',
      color: COLORS.muted,
      textAlign: 'center',
      letterSpacing: 0.5,
    },
    shasBody: {
      alignItems: 'center',
      width: '100%',
    },
    ringStack: {
      width: RING_SIZE,
      height: RING_SIZE,
      marginBottom: 52,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    ringGlow: {
      position: 'absolute',
      width: RING_SIZE + 96,
      height: RING_SIZE + 96,
      borderRadius: (RING_SIZE + 96) / 2,
      backgroundColor: COLORS.accentGlow,
      opacity: 0.4,
      alignSelf: 'center',
    },
    ringContainer: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      width: RING_SIZE,
      height: RING_SIZE,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.08,
      shadowRadius: 40,
      elevation: 6,
    },
    ringCenter: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    ringPercent: {
      fontSize: 76,
      fontWeight: '900',
      color: COLORS.primary,
      letterSpacing: -3,
    },
    ringPercentLabel: {
      fontSize: 26,
      fontWeight: '800',
      color: COLORS.muted,
      letterSpacing: 0.3,
      marginTop: 6,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      justifyContent: 'center',
      gap: 20,
      width: '100%',
      paddingHorizontal: 8,
    },
    statCard: {
      flex: 1,
      maxWidth: 440,
      borderRadius: 28,
      paddingVertical: 36,
      paddingHorizontal: 28,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: 'rgba(201,150,60,0.22)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.05,
      shadowRadius: 20,
      elevation: 4,
    },
    statValue: {
      fontSize: 60,
      fontWeight: '900',
      color: COLORS.accent,
      letterSpacing: -2,
    },
    statLabel: {
      fontSize: 24,
      fontWeight: '700',
      color: COLORS.muted,
      textAlign: 'center',
      marginTop: 10,
      lineHeight: 32,
      paddingHorizontal: 4,
    },
    footer: {
      paddingBottom: 48,
      paddingTop: 8,
    },
    footerLineWrap: {
      alignItems: 'center',
      marginBottom: 28,
      paddingHorizontal: 100,
    },
    footerGradientLine: {
      height: 4,
      width: '100%',
      maxWidth: 520,
      borderRadius: 2,
      opacity: 0.85,
    },
    branding: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 24,
      paddingHorizontal: 32,
    },
    logoOuter: {
      padding: 12,
      borderRadius: 22,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: 'rgba(201,150,60,0.2)',
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.07,
      shadowRadius: 12,
      elevation: 3,
    },
    logo: {
      width: 56,
      height: 56,
      borderRadius: 14,
    },
    appName: {
      fontSize: 36,
      fontWeight: '900',
      color: COLORS.primary,
      letterSpacing: -0.5,
    },
    appTagline: {
      fontSize: 23,
      fontWeight: '600',
      color: COLORS.muted,
      marginTop: 4,
    },
  });
