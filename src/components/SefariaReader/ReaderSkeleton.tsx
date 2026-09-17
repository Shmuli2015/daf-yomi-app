import React, { useEffect, useMemo, useRef } from 'react';
import { View, Animated } from 'react-native';
import { useTheme } from '../../theme';
import { createReaderSkeletonStyles } from './ReaderSkeleton.styles';

export default function ReaderSkeleton() {
  const theme = useTheme();
  const styles = useMemo(() => createReaderSkeletonStyles(theme), [theme]);
  const opacityAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacityAnim]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.headerPlaceholder, { opacity: opacityAnim }]} />
      
      <Animated.View style={[styles.card, { opacity: opacityAnim }]}>
        <View style={styles.lineLong} />
        <View style={styles.lineLong} />
        <View style={styles.lineMedium} />
        <View style={styles.badgePlaceholder} />
      </Animated.View>

      <Animated.View style={[styles.card, { opacity: opacityAnim }]}>
        <View style={styles.lineLong} />
        <View style={styles.lineMedium} />
        <View style={styles.lineShort} />
      </Animated.View>

      <Animated.View style={[styles.card, { opacity: opacityAnim }]}>
        <View style={styles.lineLong} />
        <View style={styles.lineLong} />
        <View style={styles.lineShort} />
        <View style={styles.badgePlaceholder} />
      </Animated.View>

      <Animated.View style={[styles.card, { opacity: opacityAnim }]}>
        <View style={styles.lineLong} />
        <View style={styles.lineMedium} />
      </Animated.View>
    </View>
  );
}
