import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../BottomSheetModal';
import CommentaryBodyText from '../SefariaReader/CommentaryBodyText';
import { useTheme } from '../../theme';
import type { ChavrutaFootnote } from '../../services/chavrutaApi';
import { emphasizeChavrutaFootnote } from '../../utils/chavrutaFootnoteEmphasis';
import { chavrutaFootnoteLabel } from '../../utils/parseChavrutaHtml';
import { createChavrutaFootnoteSheetStyles } from './ChavrutaFootnoteSheet.styles';

interface ChavrutaFootnoteSheetProps {
  footnote: ChavrutaFootnote | null;
  onClose: () => void;
}

export default function ChavrutaFootnoteSheet({
  footnote,
  onClose,
}: ChavrutaFootnoteSheetProps) {
  const theme = useTheme();
  const styles = useMemo(() => createChavrutaFootnoteSheetStyles(theme), [theme]);
  const visible = footnote != null;

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{`הערה ${footnote ? chavrutaFootnoteLabel(footnote) : ''}`}</Text>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="סגור"
        >
          <Ionicons name="close" size={20} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        nestedScrollEnabled
        showsVerticalScrollIndicator
      >
        <CommentaryBodyText
          text={emphasizeChavrutaFootnote(footnote?.text ?? '')}
          baseStyle={styles.text}
          accentColor={theme.colors.accent}
        />
      </ScrollView>
    </BottomSheetModal>
  );
}
