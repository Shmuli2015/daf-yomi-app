import React from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme';

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  hour: number;
  minute: number;
  setHour: (h: number) => void;
  setMinute: (m: number) => void;
  onSave: () => void;
}

export const TimePickerModal = ({
  visible,
  onClose,
  hour,
  minute,
  setHour,
  setMinute,
  onSave,
}: TimePickerModalProps) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card}>
          {/* Top accent bar */}
          <View style={styles.topAccent} />

          <Text style={styles.title}>בחר שעת התראה</Text>

          {/* Time picker */}
          <View style={styles.pickerRow}>
            {/* Hours */}
            <View style={styles.pickerColumn}>
              <TouchableOpacity
                onPress={() => setHour((hour + 1) % 24)}
                style={styles.chevronBtn}
                activeOpacity={0.6}
              >
                <Ionicons name="chevron-up" size={28} color={THEME.colors.accent} />
              </TouchableOpacity>
              <View style={styles.timeDisplay}>
                <Text style={styles.timeNumber}>{hour.toString().padStart(2, '0')}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setHour((hour + 23) % 24)}
                style={styles.chevronBtn}
                activeOpacity={0.6}
              >
                <Ionicons name="chevron-down" size={28} color={THEME.colors.accent} />
              </TouchableOpacity>
            </View>

            <Text style={styles.colon}>:</Text>

            {/* Minutes */}
            <View style={styles.pickerColumn}>
              <TouchableOpacity
                onPress={() => setMinute((minute + 5) % 60)}
                style={styles.chevronBtn}
                activeOpacity={0.6}
              >
                <Ionicons name="chevron-up" size={28} color={THEME.colors.accent} />
              </TouchableOpacity>
              <View style={styles.timeDisplay}>
                <Text style={styles.timeNumber}>{minute.toString().padStart(2, '0')}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setMinute((minute + 55) % 60)}
                style={styles.chevronBtn}
                activeOpacity={0.6}
              >
                <Ionicons name="chevron-down" size={28} color={THEME.colors.accent} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={onSave} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>שמור</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(30,41,59,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: THEME.colors.surface,
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: THEME.colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  topAccent: {
    height: 4,
    backgroundColor: THEME.colors.accent,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: THEME.colors.primary,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 28,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  chevronBtn: {
    padding: 8,
    opacity: 0.9,
  },
  timeDisplay: {
    width: 80,
    height: 72,
    borderRadius: 20,
    backgroundColor: THEME.colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(201,150,60,0.25)',
    marginVertical: 4,
  },
  timeNumber: {
    fontSize: 38,
    fontWeight: '900',
    color: THEME.colors.accent,
    letterSpacing: -1,
  },
  colon: {
    fontSize: 38,
    fontWeight: '900',
    color: THEME.colors.border,
    marginTop: -8,
  },
  saveBtn: {
    backgroundColor: THEME.colors.accent,
    marginHorizontal: 24,
    marginBottom: 24,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: THEME.colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  saveBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
