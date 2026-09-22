import React, { useMemo } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { useTheme } from '../../theme';
import { guideBadgeStyles } from './GuideModal.styles';

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
      backgroundColor: theme.colors.accentBorder,
      color: theme.colors.accent,
      fontWeight: '900' as const,
      borderRadius: 4,
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
        const isGold =
          badgeContent.includes('סמן') ||
          badgeContent.includes('סיימתי') ||
          badgeContent.includes('נלמד') ||
          badgeContent.includes('אשריך');
        const isPrimary =
          badgeContent.includes('לימוד הדף') ||
          badgeContent.includes('גיבוי');

        const isMatchedByQuery =
          q.length > 0 && badgeContent.toLowerCase().includes(q);

        const badgeStyle = [
          guideBadgeStyles.badgeInline,
          {
            backgroundColor: isMatchedByQuery
              ? theme.colors.accentBorder
              : isGold
              ? theme.colors.accentLight
              : theme.colors.surface,
            color: isGold || isMatchedByQuery
              ? theme.colors.accent
              : isPrimary
              ? theme.colors.primary
              : theme.colors.textPrimary,
            borderColor: isMatchedByQuery
              ? theme.colors.accent
              : isGold
              ? theme.colors.accentBorder
              : theme.colors.border,
          },
        ];

        return renderPartWithHighlight(` ${badgeContent} `, badgeStyle, index);
      }
      return renderPartWithHighlight(part, baseStyle, index);
    });
  }, [baseStyle, boldStyle, highlightStyle, q, text, theme]);

  return <Text style={baseStyle}>{content}</Text>;
});

export default GuideItemText;
