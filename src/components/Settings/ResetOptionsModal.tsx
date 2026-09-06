import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { ResetOptionType, ResetOptionItem, ResetOptionsModalProps } from './ResetOptionsModal.types';
import { createResetOptionsModalStyles } from './ResetOptionsModal.styles';

const RESET_OPTIONS: ResetOptionItem[] = [
  {
    id: 'dafYomi',
    title: 'ניקוי נתוני הדף היומי',
    description: 'מחיקת כל סימוני הדף היומי, היסטוריית הלימוד והרצף. המסלול האישי וההגדרות יישמרו.',
    icon: 'calendar-outline',
  },
  {
    id: 'personalTrack',
    title: 'ניקוי מסלול אישי בלבד',
    description: 'מחיקת כל הדפים שסומנו במסלול האישי וההתקדמות במסכתות. הדף היומי וההגדרות יישמרו.',
    icon: 'bookmark-outline',
  },
  {
    id: 'all',
    title: 'איפוס כללי מלא',
    description: 'מחיקה מוחלטת של כל הנתונים (דף יומי ומסלול אישי) והחזרת ההגדרות למצב התחלתי.',
    icon: 'trash-outline',
    isDestructiveAll: true,
  },
];

export default function ResetOptionsModal({ visible, onClose, onConfirm }: ResetOptionsModalProps) {
  const theme = useTheme();
  const styles = useMemo(() => createResetOptionsModalStyles(theme), [theme]);
  const [selectedType, setSelectedType] = useState<ResetOptionType>('dafYomi');

  useEffect(() => {
    if (visible) {
      setSelectedType('dafYomi');
    }
  }, [visible]);

  if (!visible) return null;

  const confirmButtonLabel =
    selectedType === 'dafYomi'
      ? 'המשך לאיפוס דף יומי'
      : selectedType === 'personalTrack'
        ? 'המשך לאיפוס מסלול אישי'
        : 'המשך לאיפוס כללי';

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <View style={styles.dragHandle} />

          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.headerIconCircle}>
                <Ionicons name="alert-circle" size={20} color={theme.colors.danger} />
              </View>
              <Text style={styles.title}>איפוס ומחיקת נתונים</Text>
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>בחר איזה מידע ברצונך למחוק מהאפליקציה:</Text>

          <View style={styles.optionsList}>
            {RESET_OPTIONS.map((opt) => {
              const isSelected = selectedType === opt.id;
              const isDangerOption = opt.isDestructiveAll;

              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.optionCard,
                    isSelected &&
                      (isDangerOption
                        ? styles.optionCardSelectedDanger
                        : styles.optionCardSelected),
                  ]}
                  onPress={() => setSelectedType(opt.id)}
                  activeOpacity={0.75}
                >
                  <View style={styles.optionIconsGroup}>
                    <View style={styles.optionIconCircle}>
                      <Ionicons
                        name={opt.icon}
                        size={20}
                        color={
                          isSelected
                            ? isDangerOption
                              ? theme.colors.danger
                              : theme.colors.accent
                            : theme.colors.textSecondary
                        }
                      />
                    </View>

                    <View
                      style={[
                        styles.radioCircle,
                        isSelected &&
                          (isDangerOption
                            ? styles.radioCircleSelectedDanger
                            : styles.radioCircleSelected),
                      ]}
                    >
                      {isSelected && (
                        <View
                          style={[
                            styles.radioDot,
                            isDangerOption && styles.radioDotDanger,
                          ]}
                        />
                      )}
                    </View>
                  </View>

                  <View style={styles.optionTextContent}>
                    <Text style={styles.optionTitle}>{opt.title}</Text>
                    <Text style={styles.optionDescription}>{opt.description}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={18} color={theme.colors.danger} />
            <Text style={styles.warningText}>
              פעולת מחיקה זו היא בלתי הפיכה ולא ניתן יהיה לשחזר את הנתונים שנמחקו.
            </Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelButtonText}>ביטול</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => onConfirm(selectedType)}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>{confirmButtonLabel}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
