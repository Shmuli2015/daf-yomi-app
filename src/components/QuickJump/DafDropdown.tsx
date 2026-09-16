import React, { useCallback, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { numberToGematria } from '../../data/shas';
import { createDafDropdownStyles } from './dafDropdownStyles';

interface DafDropdownProps {
  selectedDaf: number;
  maxPages?: number;
  dafList?: number[];
  isOpen: boolean;
  onSelectDaf: (daf: number) => void;
  onClose: () => void;
}

const ITEM_HEIGHT = 40;

export default function DafDropdown({
  selectedDaf,
  maxPages,
  dafList,
  isOpen,
  onSelectDaf,
  onClose,
}: DafDropdownProps) {
  const theme = useTheme();
  const styles = useMemo(() => createDafDropdownStyles(theme), [theme]);
  const listRef = useRef<FlatList<number>>(null);

  const dafOptions = useMemo(() => {
    if (dafList && dafList.length > 0) {
      return dafList;
    }
    const count = maxPages ?? 0;
    return Array.from({ length: count }, (_, i) => i + 2);
  }, [dafList, maxPages]);

  const selectedIndex = dafOptions.indexOf(selectedDaf);
  const initialIndex = selectedIndex >= 0 ? selectedIndex : 0;
  const initialOffset = initialIndex * ITEM_HEIGHT;

  const scrollToSelected = useCallback(() => {
    if (initialIndex <= 0) return;
    listRef.current?.scrollToOffset({
      offset: initialOffset,
      animated: false,
    });
  }, [initialIndex, initialOffset]);

  if (!isOpen) return null;

  return (
    <>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.menuContainer}>
        <FlatList
          ref={listRef}
          data={dafOptions}
          keyExtractor={(item) => String(item)}
          style={styles.list}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          contentOffset={{ x: 0, y: initialOffset }}
          onLayout={scrollToSelected}
          onContentSizeChange={scrollToSelected}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled"
          renderItem={({ item: daf }) => {
            const isSelected = daf === selectedDaf;
            return (
              <TouchableOpacity
                style={[styles.item, isSelected && styles.itemSelected]}
                onPress={() => onSelectDaf(daf)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.itemText,
                    isSelected && styles.itemTextSelected,
                  ]}
                  numberOfLines={1}
                >
                  דף {numberToGematria(daf)} ({daf})
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark" size={16} color={theme.colors.accent} />
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </>
  );
}
