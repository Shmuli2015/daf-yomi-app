import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { createAppErrorFallbackStyles } from './AppErrorFallback.styles';

type AppErrorFallbackProps = {
  resetError: () => void;
};

export default function AppErrorFallback({ resetError }: AppErrorFallbackProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createAppErrorFallbackStyles(theme), [theme]);

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: Math.max(insets.top, 24),
          paddingBottom: Math.max(insets.bottom, 24),
        },
      ]}
    >
      <View style={styles.card}>
        <View style={styles.iconWrap}>
          <Ionicons name="book-outline" size={28} color={theme.colors.accent} />
        </View>
        <Text style={styles.title}>נתקלנו בתקלה קטנה</Text>
        <Text style={styles.message}>
          אפשר לנסות שוב ולהמשיך מהמקום שבו עצרת. הלימוד שלך נשמר במכשיר.
        </Text>
        <Pressable
          onPress={resetError}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          accessibilityRole="button"
          accessibilityLabel="נסה שוב"
        >
          <Text style={styles.buttonText}>נסה שוב</Text>
          <Ionicons name="refresh" size={18} color={theme.colors.white} />
        </Pressable>
      </View>
    </View>
  );
}
