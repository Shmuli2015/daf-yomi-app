import React, { useMemo } from 'react';
import { Text, StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import {
  emphasizeRashiDibur,
  parseCommentaryRuns,
  stripEmDash,
  stripSteinsaltzSectionLetters,
} from '../../utils/commentaryEmphasis';
import { buildHighlightSpans } from '../../utils/textSearch';
import { rtlBodyTextProps, rtlNestedRunStyle } from '../../utils/rtlBodyText';
import { useTheme } from '../../theme';
import type { SefariaCommentatorKey } from '../../utils/sefariaCommentators';
import { createSearchHighlightTextStyles } from './SearchHighlightText.styles';

interface CommentaryBodyTextProps {
  text: string;
  commentator?: SefariaCommentatorKey;
  baseStyle: StyleProp<TextStyle>;
  accentColor: string;
  searchQuery?: string;
  activeOccurrenceIndex?: number | null;
}

export default function CommentaryBodyText({
  text,
  commentator,
  baseStyle,
  accentColor,
  searchQuery = '',
  activeOccurrenceIndex = null,
}: CommentaryBodyTextProps) {
  const theme = useTheme();
  const highlightStyles = useMemo(() => createSearchHighlightTextStyles(theme), [theme]);
  const runs = useMemo(() => {
    const sanitized = stripEmDash(text);
    const prepared =
      commentator === 'steinsaltz'
        ? stripSteinsaltzSectionLetters(sanitized)
        : commentator
          ? emphasizeRashiDibur(sanitized)
          : sanitized;
    return parseCommentaryRuns(prepared);
  }, [commentator, text]);
  const hasSearchQuery = searchQuery.trim().length > 0;
  let occurrenceCursor = -1;

  return (
    <Text style={baseStyle} selectable {...rtlBodyTextProps}>
      {'\u200F'}
      {runs.map((run, runIndex) => {
        const runStyle = [
          rtlNestedRunStyle,
          run.isGemara && styles.gemaraRun,
          run.isGemara && { color: accentColor },
        ];

        if (!hasSearchQuery) {
          return (
            <Text key={runIndex} style={runStyle}>
              {run.text}
            </Text>
          );
        }

        const spans = buildHighlightSpans(run.text, searchQuery);
        return (
          <Text key={runIndex} style={runStyle}>
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
                  key={`${runIndex}-${spanIndex}`}
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

const styles = StyleSheet.create({
  gemaraRun: {
    fontWeight: '800',
  },
});
