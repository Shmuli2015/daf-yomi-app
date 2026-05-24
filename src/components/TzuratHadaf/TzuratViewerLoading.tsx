import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import type { ViewerStyles } from './viewerStyles';

interface TzuratViewerLoadingProps {
  styles: ViewerStyles;
  message?: string;
  compact?: boolean;
}

export default function TzuratViewerLoading({
  styles,
  message = 'טוען את דף הגמרא...',
  compact = false,
}: TzuratViewerLoadingProps) {
  const theme = useTheme();
  const spinnerStyles = useMemo(() => createSpinnerStyles(theme), [theme]);
  const pulse = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
      easing: Easing.out(Easing.cubic),
    }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 950,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 950,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
      ])
    );
    loop.start();

    return () => {
      loop.stop();
      pulse.setValue(1);
    };
  }, [fadeAnim, pulse]);

  return (
    <View style={compact ? styles.contentLoader : styles.center}>
      <Animated.View style={[spinnerStyles.content, { opacity: fadeAnim }]}>
        {!compact && (
          <View style={spinnerStyles.iconWrap}>
            <Ionicons name="book-outline" size={26} color={theme.colors.accent} />
          </View>
        )}
        <Animated.View style={[spinnerStyles.spinnerRing, { transform: [{ scale: pulse }] }]}>
          <View style={spinnerStyles.spinnerInner}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        </Animated.View>
        {!compact && !!message && <Text style={spinnerStyles.message}>{message}</Text>}
      </Animated.View>
    </View>
  );
}

const createSpinnerStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    content: {
      alignItems: 'center',
    },
    iconWrap: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.accentLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
    },
    spinnerRing: {
      width: 76,
      height: 76,
      borderRadius: 38,
      borderWidth: 2,
      borderColor: theme.colors.accentBorder,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      ...theme.shadow.cardMedium,
    },
    spinnerInner: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: theme.colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    message: {
      marginTop: 20,
      color: theme.colors.primary,
      fontSize: 16,
      fontWeight: '800',
      textAlign: 'center',
      letterSpacing: -0.2,
    },
  });
