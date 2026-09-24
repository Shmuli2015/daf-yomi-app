import React from 'react';
import { Sentry } from '../services/sentry';
import AppErrorFallback from './AppErrorFallback';

type AppErrorBoundaryProps = {
  children: React.ReactNode;
};

export default function AppErrorBoundary({ children }: AppErrorBoundaryProps) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ resetError }) => <AppErrorFallback resetError={resetError} />}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
