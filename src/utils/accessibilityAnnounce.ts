import { AccessibilityInfo } from 'react-native';

export function announceAccessibility(message: string): void {
  if (!message || typeof message !== 'string') {
    return;
  }
  try {
    AccessibilityInfo.announceForAccessibility(message);
  } catch {}
}
