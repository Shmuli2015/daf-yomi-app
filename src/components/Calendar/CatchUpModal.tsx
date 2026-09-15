import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomSheetModal from '../BottomSheetModal';
import { useTheme } from '../../theme';
import { createCatchUpModalStyles } from './CatchUpModal.styles';

export interface CatchUpItem {
  dateStr: string;
  masechet: string;
  daf: string;
  hebDateStr: string;
}

interface CatchUpModalProps {
  visible: boolean;
  onClose: () => void;
  items: CatchUpItem[];
  onConfirm: (selectedItems: CatchUpItem[]) => void;
}

export default function CatchUpModal({
  visible,
  onClose,
  items,
  onConfirm,
}: CatchUpModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createCatchUpModalStyles(theme), [theme]);

  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (visible) {
      setSelectedDates(new Set(items.map((i) => i.dateStr)));
    }
  }, [visible, items]);

  const toggleItem = (dateStr: string) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(dateStr)) {
        next.delete(dateStr);
      } else {
        next.add(dateStr);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedDates(new Set(items.map((i) => i.dateStr)));
  };

  const deselectAll = () => {
    setSelectedDates(new Set());
  };

  const selectedCount = selectedDates.size;
  const allSelected = selectedCount === items.length && items.length > 0;

  const handleConfirm = () => {
    const selectedList = items.filter((i) => selectedDates.has(i.dateStr));
    if (selectedList.length > 0) {
      onConfirm(selectedList);
    }
    onClose();
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <View style={styles.headerIconCircle}>
              <Ionicons name="flash" size={18} color={theme.colors.accent} />
            </View>
            <View>
              <Text style={styles.title}>השלמת פערים</Text>
              <Text style={styles.subtitle}>בחר את הדפים שלמדת כדי לסמנם יחד</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="סגור"
          >
            <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.actionBar}>
          <Text style={styles.countSummary}>
            נבחרו {selectedCount} מתוך {items.length} דפים
          </Text>
          <TouchableOpacity
            onPress={allSelected ? deselectAll : selectAll}
            activeOpacity={0.7}
            style={styles.toggleAllBtn}
          >
            <Text style={styles.toggleAllText}>
              {allSelected ? 'בטל בחירה' : 'בחר הכל'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item) => {
            const isChecked = selectedDates.has(item.dateStr);
            return (
              <TouchableOpacity
                key={item.dateStr}
                onPress={() => toggleItem(item.dateStr)}
                style={[
                  styles.itemRow,
                  isChecked && styles.itemRowSelected,
                ]}
                activeOpacity={0.75}
              >
                <View style={styles.itemRight}>
                  <Ionicons
                    name={isChecked ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isChecked ? theme.colors.accent : theme.colors.textMuted}
                  />
                  <View style={styles.itemTextContainer}>
                    <Text
                      style={[
                        styles.itemTitle,
                        isChecked && styles.itemTitleSelected,
                      ]}
                    >
                      {item.masechet} {item.daf}
                    </Text>
                    <Text style={styles.itemHebDate}>{item.hebDateStr}</Text>
                  </View>
                </View>

                <View style={styles.itemLeftBadge}>
                  <Text style={styles.itemBadgeText}>יומי</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={selectedCount === 0}
            style={[
              styles.confirmBtn,
              selectedCount === 0 && styles.confirmBtnDisabled,
            ]}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.white} />
            <Text style={styles.confirmBtnText}>
              סמן {selectedCount} דפים כנלמדים
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BottomSheetModal>
  );
}
