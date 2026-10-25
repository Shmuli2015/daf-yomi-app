import React from 'react';
import { Text, StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import {
  emphasizeRashiDibur,
  parseCommentaryRuns,
  stripEmDash,
  stripSteinsaltzSectionLetters,
} from '../../utils/commentaryEmphasis';
import { rtlBodyTextProps, rtlNestedRunStyle } from '../../utils/rtlBodyText';
import type { SefariaCommentatorKey } from '../../utils/sefariaCommentators';

interface CommentaryBodyTextProps {
  text: string;
  commentator?: SefariaCommentatorKey;
  baseStyle: StyleProp<TextStyle>;
  accentColor: string;
}

export default function CommentaryBodyText({
  text,
  commentator,
  baseStyle,
  accentColor,
}: CommentaryBodyTextProps) {
  const sanitized = stripEmDash(text);
  const prepared =
    commentator === 'steinsaltz'
      ? stripSteinsaltzSectionLetters(sanitized)
      : commentator
        ? emphasizeRashiDibur(sanitized)
        : sanitized;
  const runs = parseCommentaryRuns(prepared);

  return (
    <Text style={baseStyle} selectable {...rtlBodyTextProps}>
      {'\u200F'}
      {runs.map((run, index) => (
        <Text
          key={index}
          style={[
            rtlNestedRunStyle,
            run.isGemara && styles.gemaraRun,
            run.isGemara && { color: accentColor },
          ]}
        >
          {run.text}
        </Text>
      ))}
    </Text>
  );
}

const styles = StyleSheet.create({
  gemaraRun: {
    fontWeight: '800',
  },
});
