/// <reference types="nativewind/types" />

import 'react-native';

declare module 'react-native' {
  interface ViewStyle {
    direction?: 'ltr' | 'rtl' | 'inherit';
  }
}

export {};
