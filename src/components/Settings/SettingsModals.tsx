import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { ThemeMode, useTheme } from '../../theme';
import { ThemeModeModal } from './ThemeModeModal';
import { GuideModal } from './GuideModal';
import { TimePickerModal } from './TimePickerModal';
import ConfirmModal from '../ConfirmModal';
import SuccessModal from '../SuccessModal';
import PulsingBookIcon from './PulsingBookIcon';
import { createSettingsScreenStyles } from './settingsScreenStyles';

export type SettingsModalsProps = {
  themeMode: ThemeMode;
  showThemeModal: boolean;
  onThemeModalClose: () => void;
  onThemeModeSelect: (mode: ThemeMode) => void;
  showGuideModal: boolean;
  onGuideModalClose: () => void;
  showTimePicker: boolean;
  onTimePickerClose: () => void;
  timePickerHour: number;
  timePickerMinute: number;
  onTimeSave: (hour: number, minute: number) => void;
  showResetModal: boolean;
  onResetModalClose: () => void;
  onConfirmReset: () => void;
  showSuccessModal: boolean;
  onSuccessModalClose: () => void;
  isSaving: boolean;
};

export default function SettingsModals({
  themeMode,
  showThemeModal,
  onThemeModalClose,
  onThemeModeSelect,
  showGuideModal,
  onGuideModalClose,
  showTimePicker,
  onTimePickerClose,
  timePickerHour,
  timePickerMinute,
  onTimeSave,
  showResetModal,
  onResetModalClose,
  onConfirmReset,
  showSuccessModal,
  onSuccessModalClose,
  isSaving,
}: SettingsModalsProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSettingsScreenStyles(theme), [theme]);

  return (
    <>
      <ThemeModeModal
        visible={showThemeModal}
        value={themeMode}
        onClose={onThemeModalClose}
        onSelect={onThemeModeSelect}
      />
      <GuideModal visible={showGuideModal} onClose={onGuideModalClose} />
      <TimePickerModal
        visible={showTimePicker}
        onClose={onTimePickerClose}
        hour={timePickerHour}
        minute={timePickerMinute}
        onSave={onTimeSave}
      />
      <ConfirmModal
        visible={showResetModal}
        title="מחיקת נתונים"
        message="האם אתה בטוח שברצונך למחוק את כל היסטוריית הלימוד? פעולה זו אינה ניתנת לביטול."
        onConfirm={onConfirmReset}
        onCancel={onResetModalClose}
      />
      <SuccessModal
        visible={showSuccessModal}
        title="הצלחנו!"
        message="הנתונים נמחקו בהצלחה. האפליקציה חזרה למצבה ההתחלתי."
        onClose={onSuccessModalClose}
      />

      {isSaving && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={styles.overlay}
        >
          <View style={styles.loaderCard}>
            <PulsingBookIcon />
            <Text style={styles.loaderText}>מעדכן הגדרות...</Text>
          </View>
        </Animated.View>
      )}
    </>
  );
}
