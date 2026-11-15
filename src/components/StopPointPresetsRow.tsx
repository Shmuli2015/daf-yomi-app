import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';
import { STOP_POINT_PRESETS } from '../constants/stopPointPresets';
import { createStopPointPresetsRowStyles } from './StopPointPresetsRow.styles';

interface StopPointPresetsRowProps {
  selectedValue?: string | null;
  onSelectPreset: (preset: string) => void;
}

export default function StopPointPresetsRow({
  selectedValue,
  onSelectPreset,
}: StopPointPresetsRowProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStopPointPresetsRowStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {STOP_POINT_PRESETS.map((preset) => {
        const isSelected = selectedValue === preset;
        return (
          <TouchableOpacity
            key={preset}
            style={[styles.chip, isSelected && styles.chipActive]}
            onPress={() => onSelectPreset(preset)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`בחר נקודת עצירה: ${preset}`}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
              {preset}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
