import React, { useMemo } from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createPersonalTrackAddMasechetButtonStyles } from './PersonalTrackAddMasechetButton.styles';

interface PersonalTrackAddMasechetButtonProps {
  onPress: () => void;
}

export default function PersonalTrackAddMasechetButton({
  onPress,
}: PersonalTrackAddMasechetButtonProps) {
  const theme = useTheme();
  const styles = useMemo(() => createPersonalTrackAddMasechetButtonStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="הוסף מסכת למסלול האישי"
    >
      <Ionicons name="add-circle-outline" size={18} color={theme.colors.accent} />
      <Text style={styles.label}>הוסף מסכת</Text>
    </TouchableOpacity>
  );
}
