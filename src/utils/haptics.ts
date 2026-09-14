import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export type ImpactStyle = 'light' | 'medium' | 'heavy';

export async function triggerImpact(style: ImpactStyle = 'light'): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const feedbackStyle =
      style === 'heavy'
        ? Haptics.ImpactFeedbackStyle.Heavy
        : style === 'medium'
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Light;
    await Haptics.impactAsync(feedbackStyle);
  } catch {
  }
}

export async function triggerSuccess(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
  }
}

export async function triggerWarning(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
  }
}

export async function triggerError(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
  }
}

export async function triggerSelection(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.selectionAsync();
  } catch {
  }
}
