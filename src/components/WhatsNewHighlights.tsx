import React, { useMemo } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../theme';
import { createWhatsNewHighlightsStyles } from './WhatsNewHighlights.styles';

type WhatsNewHighlightsProps = {
  items: string[];
};

export default function WhatsNewHighlights({ items }: WhatsNewHighlightsProps) {
  const theme = useTheme();
  const styles = useMemo(() => createWhatsNewHighlightsStyles(theme), [theme]);

  if (!items.length) return null;

  return (
    <ScrollView
      style={styles.list}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
    >
      {items.map((item, index) => (
        <View key={`${index}-${item}`} style={styles.row}>
          <Text style={styles.bullet}>•</Text>
          <Text
            style={[
              styles.text,
              { textAlign: Platform.OS === 'web' ? 'right' : 'left' },
            ]}
          >
            {item}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}
