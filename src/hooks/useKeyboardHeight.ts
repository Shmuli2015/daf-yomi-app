import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

export function useKeyboardHeight(enabled: boolean = true): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (!enabled || Platform.OS !== 'android') {
      setHeight(0);
      return undefined;
    }
    const showSubscription = Keyboard.addListener('keyboardDidShow', event => {
      setHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setHeight(0);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [enabled]);

  return height;
}
