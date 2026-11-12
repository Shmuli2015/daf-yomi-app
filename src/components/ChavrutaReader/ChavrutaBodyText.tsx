import React, { useMemo } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { useTheme } from '../../theme';
import { chavrutaFootnoteLabel, parseChavrutaBodyParts } from '../../utils/parseChavrutaHtml';
import { buildHighlightSpans } from '../../utils/textSearch';
import { rtlBodyTextProps, rtlNestedRunStyle } from '../../utils/rtlBodyText';
import type { ChavrutaFootnote } from '../../services/chavrutaApi';
import ChavrutaFootnoteMark from './ChavrutaFootnoteMark';
import { createChavrutaBodyTextStyles } from './ChavrutaBodyText.styles';
import { createSearchHighlightTextStyles } from '../SefariaReader/SearchHighlightText.styles';

interface ChavrutaBodyTextProps {
  text: string;
  baseStyle: StyleProp<TextStyle>;
  fontSize: number;
  accentColor: string;
  showNotes: boolean;
  footnotesById: Map<number, ChavrutaFootnote>;
  onPressFootnote: (footnote: ChavrutaFootnote) => void;
  searchQuery?: string;
  activeOccurrenceIndex?: number | null;
}

export default function ChavrutaBodyText({
  text,
  baseStyle,
  fontSize,
  accentColor,
  showNotes,
  footnotesById,
  onPressFootnote,
  searchQuery = '',
  activeOccurrenceIndex = null,
}: ChavrutaBodyTextProps) {
  const theme = useTheme();
  const styles = useMemo(() => createChavrutaBodyTextStyles(theme), [theme]);
  const highlightStyles = useMemo(() => createSearchHighlightTextStyles(theme), [theme]);
  const parts = useMemo(() => parseChavrutaBodyParts(text), [text]);
  const markSize = Math.max(13, Math.round(fontSize * 0.82));
  const hasSearchQuery = searchQuery.trim().length > 0;
  let occurrenceCursor = -1;

  return (
    <Text style={baseStyle} selectable {...rtlBodyTextProps}>
      {'\u200F'}
      {parts.map((part, index) => {
        if (part.kind === 'footnote') {
          if (!showNotes) {
            return null;
          }

          const footnote = footnotesById.get(part.id);
          if (!footnote) {
            return null;
          }

          return (
            <ChavrutaFootnoteMark
              key={`fn-${part.id}-${index}`}
              label={chavrutaFootnoteLabel(footnote)}
              fontSize={markSize}
              accentColor={accentColor}
              onPress={() => onPressFootnote(footnote)}
            />
          );
        }

        const runStyle = [
          rtlNestedRunStyle,
          part.isGemara && styles.gemaraRun,
          part.isGemara && { color: accentColor },
        ];

        if (!hasSearchQuery) {
          return (
            <Text key={`text-${index}`} style={runStyle}>
              {part.text}
            </Text>
          );
        }

        const spans = buildHighlightSpans(part.text, searchQuery);
        return (
          <Text key={`text-${index}`} style={runStyle}>
            {spans.map((span, spanIndex) => {
              const isMatch = span.isMatch;
              if (isMatch) {
                occurrenceCursor += 1;
              }
              const isActiveMatch =
                isMatch &&
                activeOccurrenceIndex != null &&
                occurrenceCursor === activeOccurrenceIndex;

              return (
                <Text
                  key={`${index}-${spanIndex}`}
                  style={[
                    rtlNestedRunStyle,
                    isMatch && (isActiveMatch ? highlightStyles.activeMatch : highlightStyles.match),
                  ]}
                >
                  {span.text}
                </Text>
              );
            })}
          </Text>
        );
      })}
    </Text>
  );
}
