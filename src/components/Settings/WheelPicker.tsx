import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useTheme } from '../../theme';

interface WheelPickerProps {
  items: string[];
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  itemHeight?: number;
}

const ITEM_HEIGHT = 48;
const VISIBLE_ITEMS = 5;
const MULTIPLIER = 100;
export const WheelPicker = ({
  items,
  selectedIndex,
  onIndexChange,
  itemHeight = ITEM_HEIGHT,
}: WheelPickerProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const scrollRef = useRef<ScrollView>(null);
  const lastScrolledIndex = useRef<number>(-1);
  const count = items.length;
  const containerHeight = itemHeight * VISIBLE_ITEMS;

  const virtualItems = Array.from({ length: count * MULTIPLIER }, (_, i) => items[i % count]);

  const middleBlock = Math.floor(MULTIPLIER / 2) * count;

  const getOffset = useCallback(
    (index: number) => (middleBlock + index) * itemHeight,
    [middleBlock, itemHeight]
  );

  useEffect(() => {
    if (selectedIndex !== lastScrolledIndex.current) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: getOffset(selectedIndex),
          animated: false,
        });
        lastScrolledIndex.current = selectedIndex;
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [selectedIndex, getOffset]);

  const snapToIndex = useCallback(
    (y: number) => {
      const virtualIndex = Math.max(
        0,
        Math.min(count * MULTIPLIER - 1, Math.round(y / itemHeight))
      );
      const realIndex = virtualIndex % count;

      const centeredOffset = (middleBlock + realIndex) * itemHeight;
      scrollRef.current?.scrollTo({ y: centeredOffset, animated: false });

      if (realIndex !== lastScrolledIndex.current) {
        lastScrolledIndex.current = realIndex;
        onIndexChange(realIndex);
      }
    },
    [count, itemHeight, middleBlock, onIndexChange]
  );

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    snapToIndex(e.nativeEvent.contentOffset.y);
  };

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      <View
        style={[styles.selectionHighlight, { height: itemHeight, top: itemHeight * 2 }]}
        pointerEvents="none"
      />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScrollEndDrag={onScrollEnd}
        onMomentumScrollEnd={onScrollEnd}
        decelerationRate="fast"
        snapToInterval={itemHeight}
        contentContainerStyle={{ paddingVertical: itemHeight * 2 }}
      >
        {virtualItems.map((item, index) => {
          const realIdx = index % count;
          const isSelected = realIdx === selectedIndex &&
            Math.abs(index - (middleBlock + selectedIndex)) < count;

          return (
            <View key={index} style={[styles.item, { height: itemHeight }]}>
              <Text style={[styles.itemText, isSelected && styles.selectedItemText]}>
                {item}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      width: 80,
      overflow: 'hidden',
    },
    item: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemText: {
      fontSize: 22,
      color: theme.colors.textMuted,
      fontWeight: '600',
    },
    selectedItemText: {
      color: theme.colors.accent,
      fontSize: 28,
      fontWeight: '900',
    },
    selectionHighlight: {
      position: 'absolute',
      left: 6,
      right: 6,
      borderTopWidth: 1.5,
      borderBottomWidth: 1.5,
      borderColor: theme.colors.accentBorder,
      zIndex: 1,
      backgroundColor: theme.colors.accentLight,
    },
  });
