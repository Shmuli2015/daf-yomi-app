import { useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import type { ReaderTheme, ViewMode } from '../components/SefariaReader/ReaderToolbar';
import { clampReaderViewMode } from '../utils/readerViewMode';
import { resolveEffectiveReaderTheme } from '../utils/readerTheme';

export function useSettingsReaderPrefs() {
  const systemScheme = useColorScheme();
  const readerViewMode = useAppStore(state =>
    clampReaderViewMode(state.settings?.reader_view_mode),
  );
  const storedReaderTheme = useAppStore(state => state.settings?.reader_theme);
  const readerTheme = resolveEffectiveReaderTheme(
    storedReaderTheme,
    (systemScheme || 'dark') === 'dark',
  );
  const showChavrutaNotes = useAppStore(state => state.settings?.show_chavruta_notes !== 0);
  const gemaraNikud = useAppStore(state => state.settings?.gemara_nikud !== 0);
  const hapticsEnabled = useAppStore(state => state.settings?.haptics_enabled !== 0);
  const keepScreenAwake = useAppStore(state => state.settings?.keep_screen_awake !== 0);
  const setReaderViewMode = useAppStore(state => state.setReaderViewMode);
  const updateReaderTheme = useAppStore(state => state.updateReaderTheme);
  const setShowChavrutaNotesEnabled = useAppStore(state => state.setShowChavrutaNotesEnabled);
  const setGemaraNikudEnabled = useAppStore(state => state.setGemaraNikudEnabled);
  const setHapticsEnabled = useAppStore(state => state.setHapticsEnabled);
  const setKeepScreenAwake = useAppStore(state => state.setKeepScreenAwake);

  const handleReaderViewModeSelect = useCallback(
    (mode: ViewMode) => {
      setReaderViewMode(mode);
    },
    [setReaderViewMode],
  );

  const handleReaderThemeSelect = useCallback(
    (theme: ReaderTheme) => {
      updateReaderTheme(theme);
    },
    [updateReaderTheme],
  );

  const handleGemaraNikudToggle = useCallback(
    (enabled: boolean) => {
      setGemaraNikudEnabled(enabled);
    },
    [setGemaraNikudEnabled],
  );

  const handleChavrutaNotesToggle = useCallback(
    (enabled: boolean) => {
      setShowChavrutaNotesEnabled(enabled);
    },
    [setShowChavrutaNotesEnabled],
  );

  const handleHapticsToggle = useCallback(
    (enabled: boolean) => {
      setHapticsEnabled(enabled);
    },
    [setHapticsEnabled],
  );

  const handleKeepScreenAwakeToggle = useCallback(
    (enabled: boolean) => {
      setKeepScreenAwake(enabled);
    },
    [setKeepScreenAwake],
  );

  return {
    readerViewMode,
    readerTheme,
    showChavrutaNotes,
    gemaraNikud,
    hapticsEnabled,
    keepScreenAwake,
    handleReaderViewModeSelect,
    handleReaderThemeSelect,
    handleGemaraNikudToggle,
    handleChavrutaNotesToggle,
    handleHapticsToggle,
    handleKeepScreenAwakeToggle,
  };
}
