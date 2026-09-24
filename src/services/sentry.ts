import * as Sentry from '@sentry/react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { getPlayTrack } from './playTrack';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

function resolveSentryDsn(): string | undefined {
  const fromExtra = Constants.expoConfig?.extra?.sentryDsn;
  if (typeof fromExtra === 'string' && fromExtra.length > 0) {
    return fromExtra;
  }
  const fromEnv = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (typeof fromEnv === 'string' && fromEnv.length > 0) {
    return fromEnv;
  }
  return undefined;
}

function resolveSentryEnvironment(): string {
  const playTrack = getPlayTrack();
  if (playTrack && playTrack !== 'none') {
    return playTrack;
  }
  const profile = process.env.EAS_BUILD_PROFILE;
  if (typeof profile === 'string' && profile.length > 0) {
    return profile;
  }
  return 'development';
}

function resolveSentryRelease(): string | undefined {
  const version = Constants.expoConfig?.version;
  if (typeof version === 'string' && version.length > 0) {
    return version;
  }
  return undefined;
}

export function initSentry(): void {
  const dsn = resolveSentryDsn();
  if (!dsn || isExpoGo) {
    return;
  }

  Sentry.init({
    dsn,
    environment: resolveSentryEnvironment(),
    release: resolveSentryRelease(),
    sendDefaultPii: false,
    tracesSampleRate: 0,
  });
}

export function captureException(error: unknown): void {
  if (isExpoGo) {
    return;
  }
  Sentry.captureException(error);
}

export { Sentry };
