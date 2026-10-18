import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { runAutoBackupIfDue } from '../services/autoBackup';
import { useAppStore } from '../store/useAppStore';

export function useAutoBackup(isReady: boolean) {
  const refreshSettings = useAppStore(state => state.refreshSettings);

  useEffect(() => {
    if (!isReady || Platform.OS !== 'android') return;

    let cancelled = false;
    const run = () => {
      void runAutoBackupIfDue().then(result => {
        if (cancelled) return;
        if (result !== 'skipped') refreshSettings();
      });
    };

    run();
    const subscription = AppState.addEventListener('change', nextState => {
      if (nextState === 'active') run();
    });

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, [isReady, refreshSettings]);
}
