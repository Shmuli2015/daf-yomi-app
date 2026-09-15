import React, { useMemo } from 'react';
import { View, type GestureResponderHandlers, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { createSheetDragHandleStyles } from './SheetDragHandle.styles';

interface SheetDragHandleProps {
  panHandlers?: GestureResponderHandlers;
  color?: string;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export default function SheetDragHandle({
  panHandlers,
  color,
  style,
  children,
}: SheetDragHandleProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSheetDragHandleStyles(theme), [theme]);

  return (
    <View
      {...panHandlers}
      style={[styles.hitArea, children ? styles.hitAreaWithContent : null, style]}
      collapsable={false}
    >
      <View style={[styles.bar, color ? { backgroundColor: color } : null]} />
      {children}
    </View>
  );
}
