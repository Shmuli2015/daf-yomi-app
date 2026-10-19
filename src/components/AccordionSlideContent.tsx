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
  slideContent?: boolean;
}

export default function AccordionSlideContent({
  isExpanded,
  children,
  collapseScroll,
  collapseCardIndex,
  adaptCloseToHeight,
  slideContent = false,
}: AccordionSlideContentProps) {
  const {
    isRendered,
    onContentLayout,
    animatedStyle,
    animatedContentStyle,
    isHeightLocked,
    isAnimating,
  } = useAccordionSlide(isExpanded, {
    collapseScroll,
    collapseCardIndex,
    adaptCloseToHeight,
  });

  if (!isRendered) {
    return null;
  }

  return (
    <Animated.View style={isHeightLocked ? animatedStyle : undefined}>
      <Animated.View
        onLayout={onContentLayout}
        style={[
          isHeightLocked && styles.measure,
          slideContent && isHeightLocked && animatedContentStyle,
        ]}
        collapsable={false}
        renderToHardwareTextureAndroid={isAnimating}
        shouldRasterizeIOS={isAnimating}
      >
        {children}
      </Animated.View>
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
