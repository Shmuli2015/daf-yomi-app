import React, { useMemo } from 'react';
import { Platform, Text, View } from 'react-native';
import { useTheme } from '../theme';
import { createWhatsNewHighlightItemStyles } from './WhatsNewHighlightItem.styles';

type WhatsNewHighlightItemProps = {
  index: number;
  text: string;
  isLast: boolean;
};

export default function WhatsNewHighlightItem({
  index,
  text,
  isLast,
}: WhatsNewHighlightItemProps) {
  const theme = useTheme();
  const styles = useMemo(() => createWhatsNewHighlightItemStyles(theme), [theme]);

  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.indexBadge}>
        <Text style={styles.indexText}>{index + 1}</Text>
      </View>
      <Text
        style={[
          styles.text,
          { textAlign: Platform.OS === 'web' ? 'right' : 'left' },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}
