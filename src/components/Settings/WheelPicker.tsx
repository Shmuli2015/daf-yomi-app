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
const SNAP_THRESHOLD = 2;
const VELOCITY_THRESHOLD = 0.1;

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
  const isDragging = useRef(false);
  const isUserScrolling = useRef(false);
  const isLayoutReady = useRef(false);
  const count = items.length;
  const containerHeight = itemHeight * VISIBLE_ITEMS;

  const virtualItems = Array.from({ length: count * MULTIPLIER }, (_, i) => items[i % count]);

  const middleBlock = Math.floor(MULTIPLIER / 2) * count;

  const getOffset = useCallback(
    (index: number) => (middleBlock + index) * itemHeight,
    [middleBlock, itemHeight]
  );

  const scrollToIndex = useCallback(
    (index: number, animated = false) => {
      scrollRef.current?.scrollTo({
        y: getOffset(index),
        animated,
      });
      lastScrolledIndex.current = index;
    },
    [getOffset]
  );

  useEffect(() => {
    if (isUserScrolling.current) return;
    if (selectedIndex === lastScrolledIndex.current) return;

    if (isLayoutReady.current) {
      scrollToIndex(selectedIndex);
      return;
    }

    const frame = requestAnimationFrame(() => {
      scrollToIndex(selectedIndex);
    });
    return () => cancelAnimationFrame(frame);
  }, [selectedIndex, scrollToIndex]);

  const snapToIndex = useCallback(
    (y: number) => {
      const virtualIndex = Math.max(
        0,
        Math.min(count * MULTIPLIER - 1, Math.round(y / itemHeight))
      );
      const realIndex = virtualIndex % count;
      const centeredOffset = (middleBlock + realIndex) * itemHeight;

      if (Math.abs(y - centeredOffset) > SNAP_THRESHOLD) {
        scrollRef.current?.scrollTo({ y: centeredOffset, animated: false });
      }

      if (realIndex !== lastScrolledIndex.current) {
        lastScrolledIndex.current = realIndex;
        onIndexChange(realIndex);
      }

      isUserScrolling.current = false;
    },
    [count, itemHeight, middleBlock, onIndexChange]
  );

  const onScrollBeginDrag = useCallback(() => {
    isDragging.current = true;
    isUserScrolling.current = true;
  }, []);

  const onScrollEndDrag = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      isDragging.current = false;
      const velocity = e.nativeEvent.velocity?.y ?? 0;
      if (Math.abs(velocity) < VELOCITY_THRESHOLD) {
        snapToIndex(e.nativeEvent.contentOffset.y);
      }
    },
    [snapToIndex]
  );

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!isDragging.current) {
        snapToIndex(e.nativeEvent.contentOffset.y);
      }
    },
    [snapToIndex]
  );

  const onLayout = useCallback(() => {
    isLayoutReady.current = true;
    if (lastScrolledIndex.current !== selectedIndex) {
      scrollToIndex(selectedIndex);
    }
  }, [selectedIndex, scrollToIndex]);

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
        onLayout={onLayout}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEndDrag}
        onMomentumScrollEnd={onMomentumScrollEnd}
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
