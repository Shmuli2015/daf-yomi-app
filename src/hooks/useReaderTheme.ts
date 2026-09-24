import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { ReaderTheme } from '../components/SefariaReader/ReaderToolbar';
import {
  getNextReaderTheme,
  resolveEffectiveReaderTheme,
} from '../utils/readerTheme';

export function useReaderTheme(systemIsDark: boolean) {
  const storedTheme = useAppStore((state) => state.settings?.reader_theme);
  const readerTheme: ReaderTheme = resolveEffectiveReaderTheme(
    storedTheme,
    systemIsDark
  );

  const setReaderTheme = useCallback((theme: ReaderTheme) => {
    useAppStore.getState().updateReaderTheme(theme);
  }, []);

  const cycleReaderTheme = useCallback(() => {
    useAppStore.getState().updateReaderTheme(getNextReaderTheme(readerTheme));
  }, [readerTheme]);

  return { readerTheme, setReaderTheme, cycleReaderTheme };
}
