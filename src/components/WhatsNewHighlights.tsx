import React, { useMemo } from 'react';
import { ScrollView, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { createWhatsNewHighlightsStyles } from './WhatsNewHighlights.styles';
import WhatsNewHighlightItem from './WhatsNewHighlightItem';

type WhatsNewHighlightsProps = {
  items: string[];
};

export default function WhatsNewHighlights({ items }: WhatsNewHighlightsProps) {
  const theme = useTheme();
  const styles = useMemo(() => createWhatsNewHighlightsStyles(theme), [theme]);
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const maxListHeight = Math.max(140, Math.round((height - insets.top - insets.bottom) * 0.38));

  if (!items.length) return null;

  return (
    <ScrollView
      style={[styles.list, { maxHeight: maxListHeight }]}
      contentContainerStyle={styles.listContent}
      nestedScrollEnabled
      showsVerticalScrollIndicator
      bounces={items.length > 4}
    >
      {items.map((item, index) => (
        <WhatsNewHighlightItem
          key={`${index}-${item}`}
          index={index}
          text={item}
          isLast={index === items.length - 1}
        />
      ))}
    </ScrollView>
  );
}
