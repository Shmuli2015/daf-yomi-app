import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

export function useAccessibilityInfo() {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (isMounted) {
          setReduceMotionEnabled(Boolean(enabled));
        }
      })
      .catch(() => {});

    AccessibilityInfo.isScreenReaderEnabled()
      .then((enabled) => {
        if (isMounted) {
          setScreenReaderEnabled(Boolean(enabled));
        }
      })
      .catch(() => {});

    const reduceMotionSub = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => {
        if (isMounted) {
          setReduceMotionEnabled(Boolean(enabled));
        }
      }
    );

    const screenReaderSub = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => {
        if (isMounted) {
          setScreenReaderEnabled(Boolean(enabled));
        }
      }
    );

    return () => {
      isMounted = false;
      reduceMotionSub?.remove?.();
      screenReaderSub?.remove?.();
    };
  }, []);

  return { reduceMotionEnabled, screenReaderEnabled };
}

export function useAllowConfetti(
  active: boolean,
  setActive: (value: boolean) => void,
): boolean {
  const { reduceMotionEnabled } = useAccessibilityInfo();

  useEffect(() => {
    if (active && reduceMotionEnabled) {
      setActive(false);
    }
  }, [active, reduceMotionEnabled, setActive]);

  return active && !reduceMotionEnabled;
}

