import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useTheme } from '../../theme';
import { WheelPicker } from './WheelPicker';

interface TimePickerModalProps {
  visible: boolean;
  onClose: () => void;
  hour: number;
  minute: number;
  onSave: (h: number, m: number) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']; // steps of 5

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
  // Store as index (0-5), e.g. minute=30 → index=3
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
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* Dismiss backdrop — only outside the card */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={StyleSheet.absoluteFill} />
        </TouchableWithoutFeedback>

        {/* Card — plain View so scroll gestures reach the ScrollView */}
        <View style={styles.card}>
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
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor:
        theme.colors.surface === '#1E1E1E'
          ? 'rgba(12,12,12,0.85)'
          : 'rgba(15,23,42,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    card: {
      backgroundColor: theme.colors.surface,
      width: '100%',
      maxWidth: 340,
      borderRadius: 32,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadow.cardMedium,
      elevation: 20,
    },
    topAccent: {
      height: 4,
      backgroundColor: theme.colors.accent,
    },
    title: {
      fontSize: 22,
      fontWeight: '900',
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginTop: 32,
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
      marginHorizontal: 32,
      marginBottom: 32,
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
