import React, { useMemo } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import type { Theme } from '../../theme';
import {
  buildHighlightRegex,
  splitByHighlight,
  tokenizeQuery,
} from './guideSearchUtils';

interface GuideItemTextProps {
  text: string;
  baseStyle: StyleProp<TextStyle>;
  boldStyle: StyleProp<TextStyle>;
  theme: Theme;
  searchQuery?: string;
  highlightRegex?: RegExp | null;
}

const MARKER_SPLIT = /(\*\*[^*]+\*\*|\[\[[^\]]+\]\])/g;

function splitGuideParts(text: string): string[] {
  return text.split(MARKER_SPLIT).filter((part) => part.length > 0);
}

export const GuideItemText = React.memo(function GuideItemText({
  text,
  baseStyle,
  boldStyle,
  theme,
  searchQuery = '',
  highlightRegex,
}: GuideItemTextProps) {
  const effectiveRegex = useMemo(() => {
    if (highlightRegex !== undefined) return highlightRegex;
    const tokens = tokenizeQuery(searchQuery);
    return buildHighlightRegex(tokens);
  }, [highlightRegex, searchQuery]);

  const highlightStyle = useMemo(
    () => ({
      color: theme.colors.accent,
      fontWeight: '900' as const,
    }),
    [theme],
  );

  const actionTextStyle = useMemo(
    () => ({
      color: theme.colors.accent,
      fontWeight: '800' as const,
    }),
    [theme],
  );

  const content = useMemo(() => {
    const parts = splitGuideParts(text);

    const renderWithHighlight = (
      str: string,
      style: StyleProp<TextStyle>,
      partKey: string | number,
    ) => {
      const segments = splitByHighlight(str, effectiveRegex);
      if (segments.length <= 1 && !segments[0]?.isMatch) {
        return (
          <Text key={partKey} style={style}>
            {str}
          </Text>
        );
      }

      return (
        <Text key={partKey} style={style}>
          {segments.map((seg, idx) =>
            seg.isMatch ? (
              <Text key={idx} style={[style, highlightStyle]}>
                {seg.text}
              </Text>
            ) : (
              seg.text
            ),
          )}
        </Text>
      );
    };

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return renderWithHighlight(boldText, [baseStyle, boldStyle], index);
      }
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const badgeContent = part.slice(2, -2);
        return renderWithHighlight(badgeContent, [baseStyle, actionTextStyle], index);
      }
      return renderWithHighlight(part, baseStyle, index);
    });
  }, [actionTextStyle, baseStyle, boldStyle, effectiveRegex, highlightStyle, text]);

  return <Text style={baseStyle}>{content}</Text>;
});

export default GuideItemText;
