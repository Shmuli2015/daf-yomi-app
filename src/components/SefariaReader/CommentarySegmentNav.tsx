import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CommentarySegmentNavProps {
  segmentNumber: number;
  totalSegments: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  textColor: string;
  subTextColor: string;
  borderColor: string;
  accentColor: string;
}

export default function CommentarySegmentNav({
  segmentNumber,
  totalSegments,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  textColor,
  subTextColor,
  borderColor,
  accentColor,
}: CommentarySegmentNavProps) {
  return (
    <View style={styles.row}>
      <TouchableOpacity
        style={[styles.navBtn, { borderColor }, !hasPrev && styles.navBtnDisabled]}
        onPress={onPrev}
        disabled={!hasPrev}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="פסקה קודמת"
      >
        <Ionicons
          name="chevron-forward"
          size={22}
          color={hasPrev ? accentColor : subTextColor}
        />
      </TouchableOpacity>

      <Text style={[styles.label, { color: textColor }]}>
        {`\u200Fפיסקה ${segmentNumber} מתוך ${totalSegments}`}
      </Text>

      <TouchableOpacity
        style={[styles.navBtn, { borderColor }, !hasNext && styles.navBtnDisabled]}
        onPress={onNext}
        disabled={!hasNext}
        activeOpacity={0.7}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel="פסקה הבאה"
      >
        <Ionicons
          name="chevron-back"
          size={22}
          color={hasNext ? accentColor : subTextColor}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 10,
    direction: 'rtl',
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: {
    opacity: 0.35,
  },
  label: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    writingDirection: 'rtl',
  },
});
