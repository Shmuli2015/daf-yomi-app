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
        <View style={styles.closeRow} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="סגור"
          >
            <Ionicons name="close" size={20} color={theme.colors.textMuted} />
          </TouchableOpacity>
        </View>
        <View style={styles.header}>
          <View style={styles.iconWrap}>
            <Ionicons name="sparkles" size={28} color={theme.colors.accent} />
          </View>
          <Text style={styles.title}>מה חדש</Text>
          <View style={styles.versionBadge}>
            <Text style={styles.versionText}>גרסה {version}</Text>
          </View>
        </View>
        <WhatsNewHighlights items={highlights} />
      </View>
    </BottomSheetModal>
  );
}
