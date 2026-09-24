import Constants from 'expo-constants';

export function getPlayTrack(): string {
  const fromExtra = Constants.expoConfig?.extra?.playTrack;
  if (typeof fromExtra === 'string' && fromExtra.length > 0) {
    return fromExtra;
  }
  const fromEnv = process.env.EXPO_PUBLIC_PLAY_TRACK;
  if (typeof fromEnv === 'string' && fromEnv.length > 0) {
    return fromEnv;
  }
  return '';
}

export function isPlayProductionTrack(): boolean {
  return getPlayTrack() === 'production';
}
