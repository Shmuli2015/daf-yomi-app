import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../theme';
import {
  SUPPORT_FORM_CATEGORIES,
  SUPPORT_FORM_CATEGORY_LABELS,
  type SupportFormCategory,
} from '../../utils/supportFormValidation';
import { createSupportFormCategoryChipsStyles } from './SupportFormCategoryChips.styles';

type SupportFormCategoryChipsProps = {
  value: SupportFormCategory;
  onChange: (value: SupportFormCategory) => void;
};

export default function SupportFormCategoryChips({
  value,
  onChange,
}: SupportFormCategoryChipsProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSupportFormCategoryChipsStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      {SUPPORT_FORM_CATEGORIES.map(category => {
        const selected = category === value;
        return (
          <TouchableOpacity
            key={category}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onChange(category)}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={SUPPORT_FORM_CATEGORY_LABELS[category]}
          >
            <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
              {SUPPORT_FORM_CATEGORY_LABELS[category]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
