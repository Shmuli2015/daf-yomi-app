import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { WheelPicker } from './WheelPicker';
import BottomSheetModal from '../BottomSheetModal';

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  hour: number;
  minute: number;
  onSave: (h: number, m: number) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

export const TimePickerModal = ({
  visible,
  onClose,
  hour,
  minute,
  onSave,
}: TimePickerModalProps) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [selectedHour, setSelectedHour] = React.useState(hour);
  const [selectedMinuteIndex, setSelectedMinuteIndex] = React.useState(Math.round(minute / 5) % 12);

  React.useEffect(() => {
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
      <View style={styles.topAccent} />
      <Text style={styles.title}>בחר שעת התראה</Text>

      <View style={styles.pickerWrapper}>
        <View style={styles.wheelRow}>
          <WheelPicker
            items={HOURS}
            selectedIndex={selectedHour}
            onIndexChange={setSelectedHour}
          />
          <Text style={styles.colon}>:</Text>
          <WheelPicker
            items={MINUTES}
            selectedIndex={selectedMinuteIndex}
            onIndexChange={setSelectedMinuteIndex}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
        <Text style={styles.saveBtnText}>שמור</Text>
      </TouchableOpacity>
    </BottomSheetModal>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    topAccent: {
      height: 4,
      backgroundColor: theme.colors.accent,
      marginHorizontal: -20,
      marginBottom: 8,
    },
    title: {
      fontSize: 22,
      fontWeight: '900',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginTop: 16,
      marginBottom: 8,
    },
    pickerWrapper: {
      height: 240,
      justifyContent: 'center',
      alignItems: 'center',
      marginVertical: 16,
    },
    wheelRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 12,
    },
    colon: {
      fontSize: 32,
      fontWeight: '900',
      color: theme.colors.accent,
      opacity: 0.5,
      marginTop: -4,
    },
    saveBtn: {
      backgroundColor: theme.colors.accent,
      marginHorizontal: 12,
      marginBottom: 16,
      paddingVertical: 18,
      borderRadius: 20,
      alignItems: 'center',
      ...theme.shadow.gold,
    },
    saveBtnText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
  });
