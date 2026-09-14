import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useAccordionSlide } from '../hooks/useAccordionSlide';

interface AccordionSlideContentProps {
  isExpanded: boolean;
  children: React.ReactNode;
}

export default function AccordionSlideContent({
  isExpanded,
  children,
}: AccordionSlideContentProps) {
  const { isRendered, onContentLayout, animatedStyle } = useAccordionSlide(isExpanded);

  if (!isRendered) {
    return null;
  }

  return (
    <Animated.View style={animatedStyle}>
      <View
        onLayout={onContentLayout}
        style={styles.measure}
        collapsable={false}
        renderToHardwareTextureAndroid
        shouldRasterizeIOS
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
