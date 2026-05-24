import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ViewerStyles } from './viewerStyles';

interface TzuratViewerErrorProps {
  styles: ViewerStyles;
  message: string;
  textPrimary: string;
  textSecondary: string;
  onRetry?: () => void;
  onOpenSefaria?: () => void;
}

export default function TzuratViewerError({
  styles,
  message,
  textPrimary,
  textSecondary,
  onRetry,
  onOpenSefaria,
}: TzuratViewerErrorProps) {
  return (
    <View style={styles.center}>
      <Ionicons name="document-outline" size={48} color={textSecondary} />
      <Text style={styles.errorTitle}>לא נמצאה תמונת דף</Text>
      <Text style={styles.errorBody}>{message}</Text>
      <View style={styles.actions}>
        {onRetry && (
          <TouchableOpacity style={styles.primaryBtn} onPress={onRetry} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>נסה שוב</Text>
          </TouchableOpacity>
        )}
        {onOpenSefaria && (
          <TouchableOpacity style={styles.secondaryBtn} onPress={onOpenSefaria} activeOpacity={0.8}>
            <Ionicons name="open-outline" size={16} color={textPrimary} />
            <Text style={styles.secondaryBtnText}>פתח בספריא</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
