import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Animated, type LayoutChangeEvent } from 'react-native';
import { useTheme } from '../../theme';
import { createReaderSkeletonStyles } from './ReaderSkeleton.styles';

type SkeletonLine = 'long' | 'medium' | 'short';

const PARAGRAPHS: Array<{ lines: SkeletonLine[]; badge: boolean }> = [
  { lines: ['long', 'long', 'medium'], badge: true },
  { lines: ['long', 'medium', 'short'], badge: false },
  { lines: ['long', 'long', 'short'], badge: true },
  { lines: ['long', 'medium'], badge: false },
];

interface ReaderSkeletonProps {
  showCommentaryBadges?: boolean;
}

export default function ReaderSkeleton({ showCommentaryBadges = false }: ReaderSkeletonProps) {
  const theme = useTheme();
  const styles = useMemo(() => createReaderSkeletonStyles(theme), [theme]);
  const opacityAnim = useRef(new Animated.Value(0.4)).current;
  const [paragraphCount, setParagraphCount] = useState(14);

  const handleLayout = (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    const blockHeight = showCommentaryBadges ? 78 : 56;
    const available = Math.max(0, height - 46);
    const next = Math.max(8, Math.ceil(available / blockHeight));
    setParagraphCount((current) => (current === next ? current : next));
  };
  const lineStyle = {
    long: styles.lineLong,
    medium: styles.lineMedium,
    short: styles.lineShort,
  };

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
    <View style={styles.container} onLayout={handleLayout}>
      <Animated.View style={[styles.header, { opacity: opacityAnim }]}>
        <View style={styles.titleLine} />
      </Animated.View>

      {Array.from({ length: paragraphCount }, (_, index) => {
        const paragraph = PARAGRAPHS[index % PARAGRAPHS.length];
        return (
        <Animated.View key={index} style={[styles.paragraph, { opacity: opacityAnim }]}>
          {paragraph.lines.map((line, lineIndex) => (
            <View key={lineIndex} style={lineStyle[line]} />
          ))}
          {showCommentaryBadges && paragraph.badge ? <View style={styles.badge} /> : null}
        </Animated.View>
        );
      })}
    </View>
  );
}
