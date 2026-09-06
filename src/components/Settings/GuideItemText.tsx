import React from 'react';
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

export default function GuideItemText({
  text,
  baseStyle,
  boldStyle,
  theme,
  searchQuery = '',
}: GuideItemTextProps) {
  const parts = text
    .split(/(\*\*[^*]+\*\*|\[\[[^\]]+\]\])/g)
    .filter((part) => part.length > 0);

  const q = searchQuery.trim().toLowerCase();

  const highlightStyle = {
    backgroundColor: 'rgba(201, 150, 60, 0.35)',
    color: theme.colors.accent,
    fontWeight: '900' as const,
    borderRadius: 4,
  };

  const renderPartWithHighlight = (
    str: string,
    style: any,
    partKey: string | number,
  ) => {
    if (!q) {
      return (
        <Text key={partKey} style={style}>
          {str}
        </Text>
      );
    }

    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
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

  return (
    <Text style={baseStyle}>
      {parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const boldText = part.slice(2, -2);
          return renderPartWithHighlight(
            boldText,
            [baseStyle, boldStyle],
            index,
          );
        }
        if (part.startsWith('[[') && part.endsWith(']]')) {
          const badgeContent = part.slice(2, -2);
          const isGold =
            badgeContent.includes('סמן') ||
            badgeContent.includes('סיימתי') ||
            badgeContent.includes('נלמד') ||
            badgeContent.includes('אשריך');
          const isPrimary =
            badgeContent.includes('ספריא') ||
            badgeContent.includes('צורת הדף') ||
            badgeContent.includes('גיבוי');

          const isMatchedByQuery =
            q.length > 0 && badgeContent.toLowerCase().includes(q);

          const badgeStyle = [
            guideBadgeStyles.badgeInline,
            {
              backgroundColor: isMatchedByQuery
                ? 'rgba(201, 150, 60, 0.4)'
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
                ? 'rgba(201, 150, 60, 0.35)'
                : theme.colors.border,
            },
          ];

          return renderPartWithHighlight(
            ` ${badgeContent} `,
            badgeStyle,
            index,
          );
        }
        return renderPartWithHighlight(part, baseStyle, index);
      })}
    </Text>
  );
}
