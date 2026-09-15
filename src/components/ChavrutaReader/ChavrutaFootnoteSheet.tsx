import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../BottomSheetModal';
import CommentaryBodyText from '../SefariaReader/CommentaryBodyText';
import { useTheme } from '../../theme';
import type { ChavrutaFootnote } from '../../services/chavrutaApi';
import { emphasizeChavrutaFootnote } from '../../utils/chavrutaFootnoteEmphasis';
import ChavrutaFootnoteNav from './ChavrutaFootnoteNav';
import { createChavrutaFootnoteSheetStyles } from './ChavrutaFootnoteSheet.styles';

interface ChavrutaFootnoteSheetProps {
  footnotes: ChavrutaFootnote[];
  activeIndex: number | null;
  onChangeIndex: (index: number) => void;
  onClose: () => void;
}

export default function ChavrutaFootnoteSheet({
  footnotes,
  activeIndex,
  onChangeIndex,
  onClose,
}: ChavrutaFootnoteSheetProps) {
  const theme = useTheme();
  const styles = useMemo(() => createChavrutaFootnoteSheetStyles(theme), [theme]);
  const footnote = activeIndex == null ? null : footnotes[activeIndex] ?? null;
  const visible = footnote != null;

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{`הערה ${footnote?.n ?? ''}`}</Text>
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

      {footnotes.length > 1 && activeIndex != null ? (
        <ChavrutaFootnoteNav
          currentIndex={activeIndex}
          total={footnotes.length}
          onPrev={() => onChangeIndex(Math.max(0, activeIndex - 1))}
          onNext={() => onChangeIndex(Math.min(footnotes.length - 1, activeIndex + 1))}
        />
      ) : null}
    </BottomSheetModal>
  );
}
