import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createGuideExpandControlsStyles } from './GuideExpandControls.styles';

interface GuideExpandControlsProps {
  onExpandAll: () => void;
  onCollapseAll: () => void;
  allExpanded: boolean;
  noneExpanded: boolean;
}

export function GuideExpandControls({
  onExpandAll,
  onCollapseAll,
  allExpanded,
  noneExpanded,
}: GuideExpandControlsProps) {
  const theme = useTheme();
  const styles = useMemo(() => createGuideExpandControlsStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onExpandAll}
        style={styles.button}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="פתח הכל"
      >
        <Ionicons
          name="expand-outline"
          size={14}
          color={allExpanded ? theme.colors.textMuted : theme.colors.accent}
        />
        <Text style={allExpanded ? styles.textDisabled : styles.textActive}>
          פתח הכל
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onCollapseAll}
        style={styles.button}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="סגור הכל"
      >
        <Ionicons
          name="contract-outline"
          size={14}
          color={noneExpanded ? theme.colors.textMuted : theme.colors.accent}
        />
        <Text style={noneExpanded ? styles.textDisabled : styles.textActive}>
          סגור הכל
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default GuideExpandControls;
