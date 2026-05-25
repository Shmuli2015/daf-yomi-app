import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ViewerStyles } from './viewerStyles';

interface TzuratZoomHintProps {
  styles: ViewerStyles;
  textMuted: string;
  isLandscape?: boolean;
  onToggleOrientation?: () => void;
}

export default function TzuratZoomHint({
  styles,
  textMuted,
  isLandscape = false,
  onToggleOrientation,
}: TzuratZoomHintProps) {
  return (
    <View style={styles.zoomHint}>
      <View style={styles.zoomHintGroup}>
        <Ionicons name="expand-outline" size={14} color={textMuted} />
        <Text style={styles.zoomHintText}>צבוט עם שתי אצבעות להגדלה</Text>
      </View>

      <View style={styles.zoomHintDivider} />

      <TouchableOpacity
        onPress={onToggleOrientation}
        style={styles.rotateGroup}
        activeOpacity={0.7}
        accessibilityLabel={isLandscape ? 'סיבוב לאנכי' : 'סיבוב לרוחב'}
      >
        <Ionicons
          name={isLandscape ? 'phone-portrait-outline' : 'phone-landscape-outline'}
          size={14}
          color={textMuted}
        />
        <Text style={styles.zoomHintText}>
          {isLandscape ? 'סובב לאנכי' : 'סובב לרוחב'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
