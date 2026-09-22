import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { READER_FONT_SIZE_MAX, READER_FONT_SIZE_MIN } from '../../utils/readerFontSize';
import { matchesSetting } from '../../utils/settingsSearch';
import { FONT_SIZE_SETTING } from '../../utils/settingsSearchCatalog';

export { FONT_SIZE_SETTING };

type SettingsFontSizeRowProps = {
  searchQuery: string;
  fontSize: number;
  onIncrease: () => void;
  onDecrease: () => void;
  isLast?: boolean;
};

export default function SettingsFontSizeRow({
  searchQuery,
  fontSize,
  onIncrease,
  onDecrease,
  isLast = false,
}: SettingsFontSizeRowProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  if (!matchesSetting(searchQuery, FONT_SIZE_SETTING)) return null;

  return (
    <View style={[styles.row, isLast && styles.rowLast]}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>{FONT_SIZE_SETTING.title}</Text>
        <Text style={styles.description}>{FONT_SIZE_SETTING.description}</Text>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.btn}
          onPress={onDecrease}
          disabled={fontSize <= READER_FONT_SIZE_MIN}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="הקטן גופן"
        >
          <Text style={[styles.btnText, fontSize <= READER_FONT_SIZE_MIN && styles.btnDisabled]}>A-</Text>
        </TouchableOpacity>
        <Text style={styles.value}>{fontSize}</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={onIncrease}
          disabled={fontSize >= READER_FONT_SIZE_MAX}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="הגדל גופן"
        >
          <Text style={[styles.btnText, fontSize >= READER_FONT_SIZE_MAX && styles.btnDisabled]}>A+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingVertical: 15,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      gap: 12,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    textBlock: {
      flex: 1,
    },
    title: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.colors.textPrimary,
    },
    description: {
      fontSize: 12.5,
      color: theme.colors.textSecondary,
      marginTop: 2,
      lineHeight: 17,
      opacity: 0.85,
    },
    controls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    btn: {
      minWidth: 36,
      height: 36,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.accentLight,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    btnText: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.colors.accent,
    },
    btnDisabled: {
      opacity: 0.35,
    },
    value: {
      minWidth: 24,
      textAlign: 'center',
      fontSize: 14,
      fontWeight: '800',
      color: theme.colors.textPrimary,
    },
  });
