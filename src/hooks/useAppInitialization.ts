import { useEffect, useState, useCallback } from 'react';
import { initDB } from '../db/database';
import { useAppStore } from '../store/useAppStore';

const MIN_SPLASH_MS = 1800;
const SPLASH_HARD_MAX_MS = 6000;

export function useAppInitialization() {
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const loadInitialData = useAppStore(state => state.loadInitialData);

  useEffect(() => {
    const startTime = Date.now();
    try {
      initDB();
      loadInitialData();
    } catch (e) {
      console.warn('DB init error:', e);
    }
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);
    const readyTimer = setTimeout(() => setIsReady(true), remaining);
    const maxTimer = setTimeout(() => setIsReady(true), SPLASH_HARD_MAX_MS);
    return () => {
      clearTimeout(readyTimer);
      clearTimeout(maxTimer);
    };
  }, [loadInitialData]);

  const onSplashFinish = useCallback(() => {
    setShowSplash(false);
    useAppStore.getState().setAppReady(true);
  }, []);

  return {
    isReady,
    showSplash,
    onSplashFinish,
  };
}
