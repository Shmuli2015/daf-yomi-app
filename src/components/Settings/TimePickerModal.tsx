import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { WheelPicker } from './WheelPicker';
import BottomSheetModal from '../BottomSheetModal';
import { createTimePickerModalStyles } from './TimePickerModal.styles';

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  hour: number;
  minute: number;
  onSave: (h: number, m: number) => void;
  title?: string;
  onDisable?: () => void;
  onApplyToActiveDays?: (h: number, m: number) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

export const TimePickerModal = ({
  visible,
  onClose,
  hour,
  minute,
  onSave,
  title = 'בחר שעת התראה',
  onDisable,
  onApplyToActiveDays,
}: TimePickerModalProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createTimePickerModalStyles(theme), [theme]);
  const [selectedHour, setSelectedHour] = useState(hour);
  const [selectedMinuteIndex, setSelectedMinuteIndex] = useState(Math.round(minute / 5) % 12);

  useEffect(() => {
    if (visible) {
      setSelectedHour(hour);
      setSelectedMinuteIndex(Math.round(minute / 5) % 12);
    }
  }, [visible, hour, minute]);

  const handleSave = () => {
    onSave(selectedHour, selectedMinuteIndex * 5);
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose}>
      <View style={styles.header}>
        <View style={styles.headerIconCircle}>
          <Ionicons name="time-outline" size={20} color={theme.colors.accent} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={onClose}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="סגור"
        >
          <Ionicons name="close" size={18} color={theme.colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.pickerBox}>
        <View style={styles.wheelRow}>
          <View style={styles.wheelColumn}>
            <Text style={styles.wheelLabel}>שעה</Text>
            <WheelPicker
              items={HOURS}
              selectedIndex={selectedHour}
              onIndexChange={setSelectedHour}
            />
          </View>
          <Text style={styles.colon}>:</Text>
          <View style={styles.wheelColumn}>
            <Text style={styles.wheelLabel}>דקות</Text>
            <WheelPicker
              items={MINUTES}
              selectedIndex={selectedMinuteIndex}
              onIndexChange={setSelectedMinuteIndex}
            />
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>שמור</Text>
        </TouchableOpacity>
        {onApplyToActiveDays ? (
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => onApplyToActiveDays(selectedHour, selectedMinuteIndex * 5)}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>החל על כל הימים הפעילים</Text>
          </TouchableOpacity>
        ) : null}
        {onDisable ? (
          <TouchableOpacity style={styles.secondaryBtn} onPress={onDisable} activeOpacity={0.8}>
            <Text style={styles.disableBtnText}>כבה יום זה</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </BottomSheetModal>
  );
};
