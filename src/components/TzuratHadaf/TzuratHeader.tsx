import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { formatDafLabel } from '../../utils/dafNavigation';
import type { Amud } from '../../utils/dafNavigation';

interface TzuratHeaderProps {
  masechetHe?: string;
  masechetEn: string;
  dafNum: number;
  amud: Amud;
  onClose: () => void;
}

export default function TzuratHeader({
  masechetHe,
  masechetEn,
  dafNum,
  amud,
  onClose,
}: TzuratHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const title = masechetHe || masechetEn;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
      <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
        <Ionicons name="close" size={22} color={theme.colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.titleBlock}>
        <Text style={styles.badge}>צורת הדף</Text>
        <Text style={styles.masechet} numberOfLines={1}>{title}</Text>
        <Text style={styles.daf}>{formatDafLabel(dafNum, amud)}</Text>
      </View>

      <View style={styles.spacer} />
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    closeBtn: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleBlock: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 8,
    },
    badge: {
      color: theme.colors.accent,
      fontSize: 11,
      fontWeight: '800',
      marginBottom: 2,
    },
    masechet: {
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '900',
    },
    daf: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: '700',
      marginTop: 2,
    },
    spacer: {
      width: 40,
    },
  });
