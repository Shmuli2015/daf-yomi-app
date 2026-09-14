import React, { useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { numberToGematria } from '../../data/shas';
import { createQuickJumpStyles } from './quickJumpModalStyles';
import { useQuickJump } from './useQuickJump';
import DafDropdown from './DafDropdown';

interface QuickJumpModalProps {
  visible: boolean;
  initialMasechetEn?: string;
  onNavigate: (params: {
    masechetEn: string;
    masechetHe: string;
    dafNum: number;
    amud: 'a' | 'b';
  }) => void;
  onClose: () => void;
}

export default function QuickJumpModal({
  visible,
  initialMasechetEn,
  onNavigate,
  onClose,
}: QuickJumpModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createQuickJumpStyles(theme), [theme]);

  const {
    selectedMasechet,
    searchQuery,
    setSearchQuery,
    selectedDaf,
    dafList,
    isAmudBAvailable,
    isDafDropdownOpen,
    toggleDafDropdown,
    handleSelectDaf,
    amud,
    filteredMasechtot,
    handleSelectMasechet,
    handleSelectAmud,
    handleSubmit,
  } = useQuickJump({ initialMasechetEn, onNavigate, onClose });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <SafeAreaView style={styles.modalContainer} edges={['bottom']}>
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <View style={styles.titleGroup}>
              <Text style={styles.title}>קפיצה מהירה לדף</Text>
              <Text style={styles.subtitle}>בחירת מסכת, דף ועמוד מכל הש״ס</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.label}>בחר מסכת:</Text>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={18} color={theme.colors.textMuted} style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="חפש מסכת..."
                placeholderTextColor={theme.colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  style={styles.clearSearchButton}
                  onPress={() => setSearchQuery('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={16} color={theme.colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView style={styles.masechetList} showsVerticalScrollIndicator>
              {filteredMasechtot.map((m) => {
                const isSelected = m.en === selectedMasechet.en;
                return (
                  <TouchableOpacity
                    key={m.en}
                    style={[styles.masechetItem, isSelected && styles.masechetItemSelected]}
                    onPress={() => handleSelectMasechet(m)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.masechetItemText,
                        isSelected && styles.masechetItemTextSelected,
                      ]}
                    >
                      {m.he}
                    </Text>
                    <Text style={styles.masechetBadge}>{m.pages} דפים</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.rowFields}>
              <View style={styles.dafField}>
                <Text style={styles.label}>בחר דף:</Text>
                <TouchableOpacity
                  style={[styles.dropdownTrigger, isDafDropdownOpen && styles.dropdownTriggerActive]}
                  onPress={toggleDafDropdown}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownValueText}>
                    דף {numberToGematria(selectedDaf)} ({selectedDaf})
                  </Text>
                  <Ionicons
                    name={isDafDropdownOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={isDafDropdownOpen ? theme.colors.accent : theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.amudField}>
                <Text style={styles.label}>עמוד:</Text>
                <View style={styles.amudToggleContainer}>
                  <TouchableOpacity
                    style={[styles.amudButton, amud === 'a' && styles.amudButtonActive]}
                    onPress={() => handleSelectAmud('a')}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.amudButtonText,
                        amud === 'a' && styles.amudButtonTextActive,
                      ]}
                    >
                      עמוד א׳
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.amudButton,
                      amud === 'b' && styles.amudButtonActive,
                      !isAmudBAvailable && styles.amudButtonDisabled,
                    ]}
                    onPress={() => handleSelectAmud('b')}
                    disabled={!isAmudBAvailable}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.amudButtonText,
                        amud === 'b' && styles.amudButtonTextActive,
                        !isAmudBAvailable && styles.amudButtonTextDisabled,
                      ]}
                    >
                      עמוד ב׳
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Ionicons name="book-outline" size={20} color={theme.colors.surface} />
              <Text style={styles.submitButtonText}>
                פתח את {selectedMasechet.he} דף {numberToGematria(selectedDaf)} ({amud === 'a' ? "עמוד א׳" : "עמוד ב׳"})
              </Text>
            </TouchableOpacity>

            <DafDropdown
              selectedDaf={selectedDaf}
              dafList={dafList}
              maxPages={selectedMasechet.pages}
              isOpen={isDafDropdownOpen}
              onSelectDaf={handleSelectDaf}
              onClose={toggleDafDropdown}
            />
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
