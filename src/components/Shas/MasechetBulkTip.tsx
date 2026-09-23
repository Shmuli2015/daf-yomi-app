import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

export default function MasechetBulkTip() {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.tip} accessibilityRole="text">
      <Ionicons name="hand-left-outline" size={15} color={theme.colors.accent} />
      <Text style={styles.tipText}>
        <Text style={styles.tipBold}>טיפ: </Text>
        לחיצה ארוכה על מסכת מסמנת או מבטלת את כל הדפים שלה
      </Text>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    tip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 12,
      marginBottom: 4,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 14,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.accentBorder,
    },
    tipText: {
      flex: 1,
      fontSize: 12,
      lineHeight: 17,
      color: theme.colors.textSecondary,
      fontWeight: '600',
      textAlign: Platform.OS === 'web' ? 'right' : 'left',
      writingDirection: 'rtl',
    },
    tipBold: {
      color: theme.colors.textPrimary,
      fontWeight: '800',
    },
  });
