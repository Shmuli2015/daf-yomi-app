import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import type { AmudSide } from '../../utils/dafStatus';
import type { TzuratMarkTrackModalStyles } from './TzuratMarkTrackModal.styles';

interface TzuratMarkTrackOptionProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  status: 'none' | 'partial' | 'learned';
  partialAmud?: AmudSide | null;
  onPress: () => void;
  onLongPress?: () => void;
  styles: TzuratMarkTrackModalStyles;
}

function statusLabel(
  status: 'none' | 'partial' | 'learned',
  partialAmud?: AmudSide | null,
): string {
  if (status === 'learned') return 'נלמד';
  if (status === 'partial') {
    if (partialAmud === 'b') return 'חצי דף (ב) · לחיצה תשלים לדף מלא';
    return 'חצי דף (א) · לחיצה תשלים לדף מלא';
  }
  return 'סמן דף מלא';
}

export default function TzuratMarkTrackOption({
  icon,
  title,
  status,
  partialAmud = null,
  onPress,
  onLongPress,
  styles,
}: TzuratMarkTrackOptionProps) {
  const theme = useTheme();
  const isLearned = status === 'learned';
  const isPartial = status === 'partial';

  return (
    <TouchableOpacity
      style={[styles.optionButton, isLearned && styles.optionButtonLearned]}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      activeOpacity={0.8}
    >
      <Ionicons
        name={isLearned ? 'checkmark-circle' : isPartial ? 'ellipse' : icon}
        size={22}
        color={isLearned ? theme.colors.success : theme.colors.accent}
      />
      <View style={styles.optionTextBlock}>
        <Text style={styles.optionText}>{title}</Text>
        <Text style={[styles.optionStatus, isLearned && styles.optionStatusDone]}>
          {statusLabel(status, partialAmud)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
