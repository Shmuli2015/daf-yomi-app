import React, { useMemo } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createCommentaryLoadBannerStyles } from './CommentaryLoadBanner.styles';

interface CommentaryLoadBannerProps {
  onRetry: () => void;
  onDismiss: () => void;
}

export default function CommentaryLoadBanner({
  onRetry,
  onDismiss,
}: CommentaryLoadBannerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createCommentaryLoadBannerStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Text style={styles.message}>חלק מהפירושים לא נטענו</Text>
      <TouchableOpacity
        style={styles.retryBtn}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="נסה לטעון פירושים שוב"
      >
        <Text style={styles.retryText}>נסה שוב</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.dismissBtn}
        onPress={onDismiss}
        accessibilityRole="button"
        accessibilityLabel="סגור התראה"
      >
        <Ionicons name="close" size={16} color={theme.colors.danger} />
      </TouchableOpacity>
    </View>
  );
}
