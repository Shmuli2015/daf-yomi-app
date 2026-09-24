import { useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { ViewMode } from '../components/SefariaReader/ReaderToolbar';
import { clampReaderViewMode } from '../utils/readerViewMode';

export function useSettingsReaderPrefs() {
  const readerViewMode = useAppStore(state =>
    clampReaderViewMode(state.settings?.reader_view_mode),
  );
  const showChavrutaNotes = useAppStore(state => state.settings?.show_chavruta_notes !== 0);
  const gemaraNikud = useAppStore(state => state.settings?.gemara_nikud !== 0);
  const hapticsEnabled = useAppStore(state => state.settings?.haptics_enabled !== 0);
  const keepScreenAwake = useAppStore(state => state.settings?.keep_screen_awake !== 0);
  const setReaderViewMode = useAppStore(state => state.setReaderViewMode);
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
    showChavrutaNotes,
    gemaraNikud,
    hapticsEnabled,
    keepScreenAwake,
    handleReaderViewModeSelect,
    handleGemaraNikudToggle,
    handleChavrutaNotesToggle,
    handleHapticsToggle,
    handleKeepScreenAwakeToggle,
  };
}
