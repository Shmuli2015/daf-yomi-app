import React, { useMemo } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { useTheme } from '../../theme';

interface GuideItemTextProps {
  text: string;
  baseStyle: StyleProp<TextStyle>;
  boldStyle: StyleProp<TextStyle>;
  theme: ReturnType<typeof useTheme>;
  searchQuery?: string;
}

const MARKER_SPLIT = /(\*\*[^*]+\*\*|\[\[[^\]]+\]\])/g;

function splitGuideParts(text: string): string[] {
  return text.split(MARKER_SPLIT).filter((part) => part.length > 0);
}

const GuideItemText = React.memo(function GuideItemText({
  text,
  baseStyle,
  boldStyle,
  theme,
  searchQuery = '',
}: GuideItemTextProps) {
  const q = searchQuery.trim().toLowerCase();

  const highlightStyle = useMemo(
    () => ({
      backgroundColor: theme.colors.accentLight,
      color: theme.colors.accent,
      fontWeight: '900' as const,
      borderRadius: 3,
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
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = q.length > 0 ? new RegExp(`(${escaped})`, 'gi') : null;

    const renderPartWithHighlight = (
      str: string,
      style: StyleProp<TextStyle>,
      partKey: string | number,
    ) => {
      if (!regex) {
        return (
          <Text key={partKey} style={style}>
            {str}
          </Text>
        );
      }

      const subParts = str.split(regex);
      if (subParts.length <= 1) {
        return (
          <Text key={partKey} style={style}>
            {str}
          </Text>
        );
      }

      return (
        <Text key={partKey} style={style}>
          {subParts.map((sub, subIdx) =>
            sub.toLowerCase() === q ? (
              <Text key={subIdx} style={[style, highlightStyle]}>
                {sub}
              </Text>
            ) : (
              sub
            ),
          )}
        </Text>
      );
    };

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return renderPartWithHighlight(boldText, [baseStyle, boldStyle], index);
      }
      if (part.startsWith('[[') && part.endsWith(']]')) {
        const badgeContent = part.slice(2, -2);
        return renderPartWithHighlight(badgeContent, [baseStyle, actionTextStyle], index);
      }
      return renderPartWithHighlight(part, baseStyle, index);
    });
  }, [actionTextStyle, baseStyle, boldStyle, highlightStyle, q, text]);

  return <Text style={baseStyle}>{content}</Text>;
});

export default GuideItemText;
