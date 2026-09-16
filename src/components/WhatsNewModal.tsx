import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import BottomSheetModal from './BottomSheetModal';
import WhatsNewHighlights from './WhatsNewHighlights';
import { createWhatsNewModalStyles } from './WhatsNewModal.styles';

type WhatsNewModalProps = {
  visible: boolean;
  version: string;
  highlights: string[];
  onClose: () => void;
};

export default function WhatsNewModal({
  visible,
  version,
  highlights,
  onClose,
}: WhatsNewModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createWhatsNewModalStyles(theme), [theme]);

  if (!highlights.length) return null;

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="sparkles-outline" size={32} color={theme.colors.accent} />
        </View>
        <Text style={styles.title}>מה חדש בגרסה {version}</Text>
        <Text style={styles.body}>עדכנו את מסע דף. הנה השינויים העיקריים:</Text>
        <WhatsNewHighlights items={highlights} />
        <TouchableOpacity style={styles.primaryBtn} onPress={onClose} activeOpacity={0.85}>
          <Text style={styles.primaryLabel}>הבנתי</Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
}
