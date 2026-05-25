import React, { useMemo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';

interface TzuratNavigationBarProps {
  isLandscape?: boolean;
  canPrevAmud: boolean;
  canNextAmud: boolean;
  canPrevDaf: boolean;
  canNextDaf: boolean;
  onPrevAmud: () => void;
  onNextAmud: () => void;
  onPrevDaf: () => void;
  onNextDaf: () => void;
}

export default function TzuratNavigationBar({
  isLandscape = false,
  canPrevAmud,
  canNextAmud,
  canPrevDaf,
  canNextDaf,
  onPrevAmud,
  onNextAmud,
  onPrevDaf,
  onNextDaf,
}: TzuratNavigationBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme, isLandscape), [theme, isLandscape]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + (isLandscape ? 6 : 12) }]}>
      <NavButton
        label="דף קודם"
        icon="chevron-forward"
        disabled={!canPrevDaf}
        onPress={onPrevDaf}
        styles={styles}
        theme={theme}
      />
      <NavButton
        label="עמוד קודם"
        icon="chevron-forward"
        disabled={!canPrevAmud}
        onPress={onPrevAmud}
        styles={styles}
        theme={theme}
        compact
      />
      <NavButton
        label="עמוד הבא"
        icon="chevron-back"
        disabled={!canNextAmud}
        onPress={onNextAmud}
        styles={styles}
        theme={theme}
        compact
      />
      <NavButton
        label="דף הבא"
        icon="chevron-back"
        disabled={!canNextDaf}
        onPress={onNextDaf}
        styles={styles}
        theme={theme}
      />
    </View>
  );
}

function NavButton({
  label,
  icon,
  disabled,
  onPress,
  styles,
  theme,
  compact,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  disabled: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: ReturnType<typeof useTheme>;
  compact?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.75}
      style={[styles.btn, compact && styles.btnCompact, disabled && styles.btnDisabled]}
    >
      <Ionicons
        name={icon}
        size={compact ? 16 : 18}
        color={disabled ? theme.colors.textSecondary : theme.colors.accent}
      />
      <Text style={[styles.btnText, compact && styles.btnTextCompact, disabled && styles.btnTextDisabled]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>, isLandscape: boolean) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: isLandscape ? 4 : 8,
      paddingHorizontal: isLandscape ? 8 : 12,
      paddingTop: isLandscape ? 6 : 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    btn: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: isLandscape ? 6 : 10,
      paddingHorizontal: 4,
      borderRadius: isLandscape ? 10 : 14,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: isLandscape ? 2 : 4,
    },
    btnCompact: {
      flex: 0.85,
    },
    btnDisabled: {
      opacity: 0.45,
    },
    btnText: {
      color: theme.colors.textPrimary,
      fontSize: isLandscape ? 9 : 11,
      fontWeight: '800',
      textAlign: 'center',
    },
    btnTextCompact: {
      fontSize: isLandscape ? 8 : 10,
    },
    btnTextDisabled: {
      color: theme.colors.textSecondary,
    },
  });
