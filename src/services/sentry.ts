import * as Sentry from '@sentry/react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { getPlayTrack } from './playTrack';
import { isSentryEnvironmentEnabled, resolveSentryEnvironment } from './sentryEnvironment';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
let sentryReady = false;

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

function resolveBuildProfile(): string {
  const fromExtra = Constants.expoConfig?.extra?.buildProfile;
  if (typeof fromExtra === 'string' && fromExtra.length > 0) {
    return fromExtra;
  }
  const fromEnv = process.env.EAS_BUILD_PROFILE;
  if (typeof fromEnv === 'string' && fromEnv.length > 0) {
    return fromEnv;
  }
  return '';
}

function resolveSentryRelease(): string | undefined {
  const version = Constants.expoConfig?.version;
  if (typeof version === 'string' && version.length > 0) {
    return version;
  }
  return undefined;
}

type SentryBeforeSendEvent = Parameters<NonNullable<Sentry.ReactNativeOptions['beforeSend']>>[0];

function sanitizeSentryEvent(event: SentryBeforeSendEvent): SentryBeforeSendEvent {
  if (event.request?.url) {
    event.request.url = event.request.url.split('?')[0];
  }
  return event;
}

export function initSentry(): boolean {
  const dsn = resolveSentryDsn();
  const environment = resolveSentryEnvironment(getPlayTrack(), resolveBuildProfile());
  if (!dsn || isExpoGo || !isSentryEnvironmentEnabled(environment)) {
    sentryReady = false;
    return false;
  }

  Sentry.init({
    dsn,
    environment,
    release: resolveSentryRelease(),
    sendDefaultPii: false,
    tracesSampleRate: 0,
    beforeSend: sanitizeSentryEvent,
  });
  sentryReady = true;
  return true;
}

export function captureException(error: unknown): void {
  if (!sentryReady) {
    return;
  }
  Sentry.captureException(error);
}

export { Sentry };
