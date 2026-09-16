import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme';
import type { Masechet } from '../../data/shas';
import {
  createMasechetSelectListStyles,
  MASECHET_ITEM_HEIGHT,
} from './MasechetSelectList.styles';

interface MasechetSelectListProps {
  masechtot: Masechet[];
  selectedEn: string;
  onSelect: (masechet: Masechet) => void;
}

export default function MasechetSelectList({
  masechtot,
  selectedEn,
  onSelect,
}: MasechetSelectListProps) {
  const theme = useTheme();
  const styles = useMemo(() => createMasechetSelectListStyles(theme), [theme]);
  const listRef = useRef<FlatList<Masechet>>(null);
  const selectedIndex = masechtot.findIndex((m) => m.en === selectedEn);
  const selectedIndexRef = useRef(selectedIndex);
  selectedIndexRef.current = selectedIndex;
  const scheduledRevealRef = useRef(false);
  const revealedRef = useRef(selectedIndex <= 0);
  const [isPositioned, setIsPositioned] = useState(selectedIndex <= 0);

  const initialOffset = selectedIndex > 0 ? selectedIndex * MASECHET_ITEM_HEIGHT : 0;

  const reveal = useCallback(() => {
    revealedRef.current = true;
    setIsPositioned(true);
  }, []);

  const positionToSelected = useCallback(() => {
    if (revealedRef.current) return;

    const index = selectedIndexRef.current;
    if (index > 0) {
      listRef.current?.scrollToOffset({
        offset: index * MASECHET_ITEM_HEIGHT,
        animated: false,
      });
    }

    if (scheduledRevealRef.current) return;
    scheduledRevealRef.current = true;

    if (index <= 0) {
      reveal();
      return;
    }

    requestAnimationFrame(() => {
      requestAnimationFrame(reveal);
    });
  }, [reveal]);

  useEffect(() => {
    if (isPositioned) return;
    const timeout = setTimeout(reveal, 120);
    return () => clearTimeout(timeout);
  }, [isPositioned, reveal]);

  return (
    <View style={[styles.listWrap, !isPositioned && styles.listInvisible]}>
      <FlatList
        ref={listRef}
        data={masechtot}
        keyExtractor={(item) => item.en}
        style={styles.list}
        extraData={selectedEn}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        initialNumToRender={masechtot.length}
        maxToRenderPerBatch={masechtot.length}
        windowSize={masechtot.length}
        removeClippedSubviews={false}
        getItemLayout={(_, index) => ({
          length: MASECHET_ITEM_HEIGHT,
          offset: MASECHET_ITEM_HEIGHT * index,
          index,
        })}
        contentOffset={{ x: 0, y: initialOffset }}
        onLayout={positionToSelected}
        onContentSizeChange={positionToSelected}
        onScrollToIndexFailed={({ index }) => {
          listRef.current?.scrollToOffset({
            offset: index * MASECHET_ITEM_HEIGHT,
            animated: false,
          });
          requestAnimationFrame(reveal);
        }}
        renderItem={({ item }) => {
          const isSelected = item.en === selectedEn;
          return (
            <TouchableOpacity
              style={[styles.item, isSelected && styles.itemSelected]}
              onPress={() => onSelect(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.itemText, isSelected && styles.itemTextSelected]}>
                {item.he}
              </Text>
              <Text style={styles.badge}>{item.pages} דפים</Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
