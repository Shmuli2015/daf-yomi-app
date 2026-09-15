import React, { useCallback, useEffect, useMemo, useRef } from 'react';
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
  const didInitialScroll = useRef(false);

  const scrollToSelected = useCallback(() => {
    const index = selectedIndexRef.current;
    if (index < 0) return;
    listRef.current?.scrollToOffset({
      offset: index * MASECHET_ITEM_HEIGHT,
      animated: false,
    });
  }, []);

  useEffect(() => {
    if (!didInitialScroll.current) return;
    const frame = requestAnimationFrame(scrollToSelected);
    return () => cancelAnimationFrame(frame);
  }, [masechtot, scrollToSelected]);

  const initialIndexRef = useRef(
    selectedIndex >= 0 && selectedIndex < masechtot.length ? selectedIndex : 0,
  );

  return (
    <View style={styles.listWrap}>
    <FlatList
      ref={listRef}
      data={masechtot}
      keyExtractor={(item) => item.en}
      style={styles.list}
      extraData={selectedEn}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator
      initialScrollIndex={masechtot.length > 0 ? initialIndexRef.current : undefined}
      getItemLayout={(_, index) => ({
        length: MASECHET_ITEM_HEIGHT,
        offset: MASECHET_ITEM_HEIGHT * index,
        index,
      })}
      onLayout={() => {
        if (didInitialScroll.current) return;
        didInitialScroll.current = true;
        scrollToSelected();
      }}
      onScrollToIndexFailed={({ index }) => {
        listRef.current?.scrollToOffset({
          offset: index * MASECHET_ITEM_HEIGHT,
          animated: false,
        });
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
