import React, { useMemo } from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';
import { useTheme } from '../../theme';
import { parseChavrutaBodyParts } from '../../utils/parseChavrutaHtml';
import type { ChavrutaFootnote } from '../../services/chavrutaApi';
import ChavrutaFootnoteMark from './ChavrutaFootnoteMark';
import { createChavrutaBodyTextStyles } from './ChavrutaBodyText.styles';

interface ChavrutaBodyTextProps {
  text: string;
  baseStyle: StyleProp<TextStyle>;
  fontSize: number;
  accentColor: string;
  showNotes: boolean;
  footnotesById: Map<number, ChavrutaFootnote>;
  onPressFootnote: (footnote: ChavrutaFootnote) => void;
}

export default function ChavrutaBodyText({
  text,
  baseStyle,
  fontSize,
  accentColor,
  showNotes,
  footnotesById,
  onPressFootnote,
}: ChavrutaBodyTextProps) {
  const theme = useTheme();
  const styles = useMemo(() => createChavrutaBodyTextStyles(theme), [theme]);
  const parts = useMemo(() => parseChavrutaBodyParts(text), [text]);
  const markSize = Math.max(13, Math.round(fontSize * 0.82));

  return (
    <Text style={baseStyle}>
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
              label={String(footnote.n)}
              fontSize={markSize}
              accentColor={accentColor}
              onPress={() => onPressFootnote(footnote)}
            />
          );
        }

        if (part.isGemara) {
          return (
            <Text
              key={`gemara-${index}`}
              style={[
                styles.gemaraRun,
                {
                  color: accentColor,
                },
              ]}
            >
              {part.text}
            </Text>
          );
        }

        return <Text key={`text-${index}`}>{part.text}</Text>;
      })}
    </Text>
  );
}
