import React from 'react';
import { Text, StyleSheet, type StyleProp, type TextStyle } from 'react-native';
import {
  emphasizeRashiDibur,
  parseCommentaryRuns,
  stripEmDash,
} from '../../utils/commentaryEmphasis';
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
  const prepared = commentator && commentator !== 'steinsaltz' ? emphasizeRashiDibur(sanitized) : sanitized;
  const runs = parseCommentaryRuns(prepared);

  return (
    <Text style={baseStyle}>
      {'\u200F'}
      {runs.map((run, index) =>
        run.isGemara ? (
          <Text
            key={index}
            style={[
              styles.gemaraRun,
              {
                color: accentColor,
              },
            ]}
          >
            {run.text}
          </Text>
        ) : (
          run.text
        ),
      )}
    </Text>
  );
}

const styles = StyleSheet.create({
  gemaraRun: {
    fontWeight: '800',
  },
});
