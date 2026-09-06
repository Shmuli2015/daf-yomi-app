import React from 'react';
import { Text, type StyleProp, type TextStyle } from 'react-native';

interface HighlightedTextProps {
  text: string;
  highlight?: string;
  baseStyle: StyleProp<TextStyle>;
  highlightStyle: StyleProp<TextStyle>;
}

export default function HighlightedText({
  text,
  highlight,
  baseStyle,
  highlightStyle,
}: HighlightedTextProps) {
  if (!highlight || !highlight.trim()) {
    return <Text style={baseStyle}>{text}</Text>;
  }

  const query = highlight.trim().toLowerCase();
  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(query);

  if (index === -1) {
    return <Text style={baseStyle}>{text}</Text>;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <Text style={baseStyle}>
      {before}
      <Text style={highlightStyle}>{match}</Text>
      {after}
    </Text>
  );
}
