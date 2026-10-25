import { Platform, type TextProps, type TextStyle } from 'react-native';

export const rtlBodyTextProps: Pick<
  TextProps,
  'textBreakStrategy' | 'android_hyphenationFrequency'
> = {
  textBreakStrategy: 'simple',
  android_hyphenationFrequency: 'none',
};

const webInlineStyle: TextStyle =
  Platform.OS === 'web' ? ({ display: 'inline' } as unknown as TextStyle) : {};

export const rtlNestedRunStyle: TextStyle = {
  writingDirection: 'rtl',
  ...webInlineStyle,
};
