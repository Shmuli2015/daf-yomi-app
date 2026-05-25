import { Alert, Share } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import type { RefObject } from 'react';
import type { View } from 'react-native';

export const CARD_SIZE = 1080;

/** expo-sharing Android requires URI scheme `file` (see Expo SharingModule). */
export function toFileSharingUrl(pathOrUri: string): string {
  const trimmed = pathOrUri.trim();
  if (trimmed.startsWith('file://')) return trimmed;
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `file://${path}`;
}

export type StreakShareData = {
  variant: 'streak';
  streak: number;
  hebrewDate: string;
};

export type ShasShareData = {
  variant: 'shas';
  progress: number;
  percentage: string;
  learnedDafim: number;
  completedMasechtot: number;
};

export type ShareProgressData = StreakShareData | ShasShareData;

function isUserCancel(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const message = 'message' in error ? String((error as { message: unknown }).message) : '';
  return (
    message.includes('cancel') ||
    message.includes('Cancel') ||
    message.includes('User did not share')
  );
}

export async function captureAndShare(ref: RefObject<View | null>): Promise<boolean> {
  if (!ref.current) return false;

  try {
    const uri = await captureRef(ref, {
      format: 'png',
      quality: 1,
      width: CARD_SIZE,
      height: CARD_SIZE,
    });

    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) {
      throw new Error('Cache directory unavailable');
    }

    const dest = `${cacheDir}share-progress-${Date.now()}.png`;
    await FileSystem.copyAsync({ from: uri, to: dest });

    const shareUrl = toFileSharingUrl(dest);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(shareUrl, {
        mimeType: 'image/png',
        dialogTitle: 'שתף תמונה',
      });
    } else {
      await Share.share({ url: shareUrl, title: 'מסע דף' });
    }

    return true;
  } catch (error) {
    if (!isUserCancel(error)) {
      Alert.alert('שגיאה', 'לא הצלחנו ליצור את התמונה. נסה שוב.');
    }
    return false;
  }
}
