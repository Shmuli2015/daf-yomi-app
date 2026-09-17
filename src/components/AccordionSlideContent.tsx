import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAccordionSlide, type AccordionCollapseScroll } from '../hooks/useAccordionSlide';

interface AccordionSlideContentProps {
  isExpanded: boolean;
  children: React.ReactNode;
  collapseScroll?: AccordionCollapseScroll;
  collapseCardIndex?: number;
  adaptCloseToHeight?: boolean;
}

export default function AccordionSlideContent({
  isExpanded,
  children,
  collapseScroll,
  collapseCardIndex,
  adaptCloseToHeight,
}: AccordionSlideContentProps) {
  const { isRendered, onContentLayout, animatedStyle, isHeightLocked, isAnimating } =
    useAccordionSlide(isExpanded, {
      collapseScroll,
      collapseCardIndex,
      adaptCloseToHeight,
    });

  if (!isRendered) {
    return null;
  }

  return (
    <Animated.View style={isHeightLocked ? animatedStyle : undefined}>
      <View
        onLayout={onContentLayout}
        style={isHeightLocked ? styles.measure : undefined}
        collapsable={false}
        renderToHardwareTextureAndroid={isAnimating}
        shouldRasterizeIOS={isAnimating}
      >
        {children}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  measure: {
    position: 'absolute',
    top: 0,
    start: 0,
    end: 0,
    width: '100%',
  },
});
