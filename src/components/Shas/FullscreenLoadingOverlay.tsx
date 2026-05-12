import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../../theme';

interface FullscreenLoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export default function FullscreenLoadingOverlay({
  visible,
  message = 'מעדכן...',
}: FullscreenLoadingOverlayProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const pulse = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      fadeAnim.setValue(0);
      return;
    }

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
  }, [visible, fadeAnim, pulse]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        <Animated.View style={[styles.spinnerRing, { transform: [{ scale: pulse }] }]}>
          <View style={styles.spinnerInner}>
            <ActivityIndicator size="large" color={theme.colors.accent} />
          </View>
        </Animated.View>
        <Text style={styles.message}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.52)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10001,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg + 4,
      paddingVertical: theme.radius.xl + 4,
      paddingHorizontal: theme.radius.xl + 8,
      alignItems: 'center',
      minWidth: 232,
      maxWidth: 300,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.accentBorder,
      ...theme.shadow.cardMedium,
    },
    spinnerRing: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2,
      borderColor: theme.colors.accentBorder,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 22,
      backgroundColor: theme.colors.surface,
    },
    spinnerInner: {
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor: theme.colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    message: {
      fontSize: 17,
      fontWeight: '800',
      color: theme.colors.primary,
      textAlign: 'center',
      letterSpacing: -0.2,
    },
  });
