import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useTheme } from '../../theme';

type HomeConfettiOverlayProps = {
  visible: boolean;
  onAnimationEnd: () => void;
};

export default function HomeConfettiOverlay({
  visible,
  onAnimationEnd,
}: HomeConfettiOverlayProps) {
  const theme = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const styles = useMemo(() => createStyles(), []);

  if (!visible) return null;

  return (
    <View style={styles.confettiContainer} pointerEvents="none">
      <ConfettiCannon
        count={200}
        origin={{ x: windowWidth / 2, y: -50 }}
        fadeOut={true}
        fallSpeed={3500}
        explosionSpeed={350}
        colors={[
          theme.colors.accent,
          theme.colors.white,
          theme.colors.gold,
          theme.colors.success,
        ]}
        onAnimationEnd={onAnimationEnd}
      />
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
    confettiContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      justifyContent: 'center',
      alignItems: 'center',
      direction: 'ltr',
    },
  });
