import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ViewerStyles } from './viewerStyles';

interface TzuratZoomHintProps {
  styles: ViewerStyles;
  textMuted: string;
}

export default function TzuratZoomHint({ styles, textMuted }: TzuratZoomHintProps) {
  return (
    <View style={styles.zoomHint}>
      <Ionicons name="expand-outline" size={14} color={textMuted} />
      <Text style={styles.zoomHintText}>צבוט עם שתי אצבעות להגדלה</Text>
    </View>
  );
}
