import React, { useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { HDate } from '@hebcal/core';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import { createSelectedDafCardStyles } from './SelectedDafCard.styles';
import { kinnimTamidCalendarDisplay } from '../../utils/mishnahOnlySefaria';
import { getHebrewDayEventInfo } from '../../utils/hebrewCalendarEvents';

interface SelectedDafCardProps {
  selectedDate: HDate;
  dafInfo: {
    masechet: string;
    daf: string;
    dateString: string;
    masechetEn: string;
    dafNum: number;
    amud: 'a' | 'b';
  };
  studyStatus?: 'none' | 'partial' | 'learned';
  onToggle?: () => void;
  onLongPressToggle?: () => void;
  onOpenTzuratHadaf?: () => void;
  onPrevDay?: () => void;
  onNextDay?: () => void;
  onCatchUp?: () => void;
  missedCount?: number;
}

export default function SelectedDafCard({
  selectedDate,
  dafInfo,
  studyStatus = 'none',
  onToggle,
  onLongPressToggle,
  onOpenTzuratHadaf,
  onPrevDay,
  onNextDay,
  onCatchUp,
  missedCount = 0,
}: SelectedDafCardProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSelectedDafCardStyles(theme), [theme]);
  const showSecularDate = useAppStore((s) => s.settings?.show_secular_date === 1);
  const isFuture = dafInfo.dateString > new Date().toISOString().split('T')[0];

  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scale.setValue(0.92);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, damping: 14, stiffness: 120, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [selectedDate]);

  const cleanHebDate = selectedDate.renderGematriya().replace(/[\u0591-\u05C7]/g, '');
  const gregObj = selectedDate.greg();
  const gregDateStr = new Date(
    gregObj.getFullYear(),
    gregObj.getMonth(),
    gregObj.getDate()
  ).toLocaleDateString('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const sharedDay = kinnimTamidCalendarDisplay(dafInfo.masechet, dafInfo.dafNum);
  const eventInfo = useMemo(() => getHebrewDayEventInfo(selectedDate), [selectedDate]);

  const isLearned = studyStatus === 'learned';
  const isPartial = studyStatus === 'partial';
  const toggleIconName = isLearned
    ? 'checkmark-circle'
    : isPartial
      ? 'ellipse'
      : 'checkmark-circle-outline';
  const toggleLabel = isLearned
    ? 'אשריך! סיימת'
    : isPartial
      ? 'סיימתי את הדף!'
      : isFuture
        ? 'למדתי מראש'
        : 'סמן כנלמד';
  const toggleIconColor = isPartial ? theme.colors.accent : theme.colors.white;

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }], opacity }]}>
      <View style={styles.navHeaderRow}>
        <TouchableOpacity
          onPress={onPrevDay}
          style={styles.dayNavBtn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="יום קודם"
        >
          <Ionicons name="chevron-forward" size={16} color={theme.colors.accent} />
          <Text style={styles.dayNavBtnText}>יום קודם</Text>
        </TouchableOpacity>

        <View style={styles.dateCenter}>
          <Text style={styles.hebDate}>{cleanHebDate}</Text>
          {showSecularDate && <Text style={styles.gregDate}>{gregDateStr}</Text>}
          {eventInfo.eventName ? (
            <View style={styles.eventBadge}>
              <Text style={styles.eventBadgeText}>{eventInfo.eventName}</Text>
            </View>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={onNextDay}
          style={styles.dayNavBtn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="יום הבא"
        >
          <Text style={styles.dayNavBtnText}>יום הבא</Text>
          <Ionicons name="chevron-back" size={16} color={theme.colors.accent} />
        </TouchableOpacity>
      </View>

      <View style={styles.dafInfoCard}>
        <Text style={styles.masechetName}>{sharedDay?.masechetHe ?? dafInfo.masechet}</Text>
        <View style={styles.dafRow}>
          <View style={styles.dafDivider} />
          <Text style={styles.dafText}>{dafInfo.daf}</Text>
          <View style={styles.dafDivider} />
        </View>
        {sharedDay ? <Text style={styles.sharedNote}>{sharedDay.subtitleHe}</Text> : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onToggle}
          onLongPress={!isLearned ? onLongPressToggle : undefined}
          delayLongPress={400}
          activeOpacity={0.85}
          style={[
            styles.toggleBtn,
            isLearned ? styles.toggleBtnLearned : isPartial ? styles.toggleBtnPartial : styles.toggleBtnPending,
          ]}
        >
          <View style={styles.toggleIconWrapper}>
            <Ionicons name={toggleIconName} size={18} color={toggleIconColor} />
          </View>
          <Text
            style={[
              styles.toggleText,
              isPartial ? styles.toggleTextPartial : styles.toggleTextFilled,
            ]}
          >
            {toggleLabel}
          </Text>
        </TouchableOpacity>

        {missedCount > 0 && onCatchUp ? (
          <TouchableOpacity
            onPress={onCatchUp}
            activeOpacity={0.85}
            style={styles.catchUpCard}
          >
            <View style={styles.catchUpRight}>
              <View style={styles.catchUpIconWrapper}>
                <Ionicons name="flash" size={16} color={theme.colors.accent} />
              </View>
              <View style={styles.catchUpTextCol}>
                <Text style={styles.catchUpTitle}>
                  ישנם {missedCount} דפים להשלמה
                </Text>
                <Text style={styles.catchUpSubtitle}>
                  דפים קודמים שטרם סומנו
                </Text>
              </View>
            </View>

            <View style={styles.catchUpActionBadge}>
              <Text style={styles.catchUpActionText}>השלם כעת</Text>
              <Ionicons name="chevron-back" size={14} color={theme.colors.accent} />
            </View>
          </TouchableOpacity>
        ) : null}

        <TouchableOpacity
          onPress={onOpenTzuratHadaf}
          activeOpacity={0.7}
          style={styles.tzuratBtn}
        >
          <View style={styles.tzuratIconWrapper}>
            <Ionicons name="reader-outline" size={18} color={theme.colors.textPrimary} />
          </View>
          <Text style={styles.tzuratText}>לימוד הדף</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
