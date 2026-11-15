import React, { useEffect, useRef, useMemo } from 'react';
import { Animated, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { createTzuratStopPointToastStyles } from './TzuratStopPointToast.styles';

interface TzuratStopPointToastProps {
  stopPoint: string | null;
  onPress: () => void;
  onDismiss: () => void;
}

export default function TzuratStopPointToast({
  stopPoint,
  onPress,
  onDismiss,
}: TzuratStopPointToastProps) {
  const theme = useTheme();
  const styles = useMemo(() => createTzuratStopPointToastStyles(theme), [theme]);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;

  useEffect(() => {
    if (!stopPoint) return;

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -12,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onDismiss();
      });
    }, 4000);

    return () => clearTimeout(timer);
  }, [stopPoint, onDismiss]);

  if (!stopPoint) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.touchableContent}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`נעצרת ב: ${stopPoint}, לחץ לעריכה`}
      >
        <Ionicons name="bookmark" size={18} color={theme.colors.accent} />
        <Text style={styles.text} numberOfLines={1} ellipsizeMode="tail">
          נעצרת ב: {stopPoint}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onDismiss}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="סגור הודעה"
      >
        <Ionicons name="close" size={16} color={theme.colors.textMuted} />
      </TouchableOpacity>
    </Animated.View>
  );
}
