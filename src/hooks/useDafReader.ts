import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchSefariaPageText, type SefariaPageData } from '../services/sefariaTextApi';
import { useChavrutaPage } from './useChavrutaPage';
import { hasChavrutaSource } from '../data/chavrutaSources';
import type { ViewMode } from '../components/SefariaReader/ReaderToolbar';
import {
  getNextAmud,
  getNextDaf,
  getPrevAmud,
  getPrevDaf,
  normalizeMasechetEn,
  type DafLocation,
} from '../utils/dafNavigation';
import {
  isMishnahOnlySlot,
  resolveChavrutaLocation,
} from '../utils/mishnahOnlySefaria';
import { triggerSelection } from '../utils/haptics';
import { useReaderFontSize } from './useReaderFontSize';
import { useAppStore } from '../store/useAppStore';
import { clampReaderViewMode } from '../utils/readerViewMode';

export type NavDirection = 'next' | 'prev' | null;

export function useDafReader(initialLocation: DafLocation) {
  const [location, setLocation] = useState<DafLocation>(initialLocation);
  const [navDirection, setNavDirection] = useState<NavDirection>(null);
  const storedViewMode = useAppStore(state => clampReaderViewMode(state.settings?.reader_view_mode));
  const storedShowNotes = useAppStore(state => state.settings?.show_chavruta_notes !== 0);
  const persistViewMode = useAppStore(state => state.setReaderViewMode);
  const persistShowNotes = useAppStore(state => state.setShowChavrutaNotesEnabled);
  const { fontSize, increase: handleIncreaseFontSize, decrease: handleDecreaseFontSize } =
    useReaderFontSize();
  const [sefariaData, setSefariaData] = useState<SefariaPageData | null>(null);
  const [sefariaLoading, setSefariaLoading] = useState(true);
  const [sefariaError, setSefariaError] = useState<string | null>(null);

  const normalizedMasechet = normalizeMasechetEn(location.masechetEn);
  const mishnahOnly = isMishnahOnlySlot(normalizedMasechet, location.dafNum, location.amud);
  const chavrutaLocation = resolveChavrutaLocation(
    normalizedMasechet,
    location.dafNum,
    location.amud,
  );
  const chavrutaAvailable = hasChavrutaSource(chavrutaLocation.masechetEn);
  const steinsaltzAvailable = !mishnahOnly;
  const classicTabLabel = mishnahOnly ? 'משנה' : 'גמרא';
  const viewMode = useMemo<ViewMode>(() => {
    if (storedViewMode === 'chavruta' && !chavrutaAvailable) return 'classic';
    if (storedViewMode === 'steinsaltz' && !steinsaltzAvailable) return 'classic';
    return storedViewMode;
  }, [storedViewMode, chavrutaAvailable, steinsaltzAvailable]);
  const showChavrutaNotes = storedShowNotes;
  const chavruta = useChavrutaPage(
    { masechetEn: chavrutaLocation.masechetEn, dafNum: chavrutaLocation.dafNum, amud: chavrutaLocation.amud },
    viewMode === 'chavruta' && chavrutaAvailable,
  );

  const loadSefariaText = useCallback(async (loc: DafLocation) => {
    setSefariaLoading(true);
    setSefariaError(null);
    try {
      const data = await fetchSefariaPageText(loc.masechetEn, loc.dafNum, loc.amud);
      setSefariaData(data);
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : '';
      setSefariaError(/[\u0590-\u05FF]/.test(raw) ? raw : 'שגיאה בטעינת הטקסט');
    } finally {
      setSefariaLoading(false);
    }
  }, []);

  const prefetchAdjacentPages = useCallback((loc: DafLocation) => {
    const nextLoc = getNextAmud(loc);
    if (!nextLoc) return;
    fetchSefariaPageText(nextLoc.masechetEn, nextLoc.dafNum, nextLoc.amud).catch(() => {});
  }, []);

  useEffect(() => {
    void loadSefariaText(location);
    prefetchAdjacentPages(location);
  }, [location, loadSefariaText, prefetchAdjacentPages]);

  const handleToggleViewMode = useCallback((mode: ViewMode) => {
    if (mode === viewMode) {
      return;
    }
    if (mode === 'chavruta' && !chavrutaAvailable) {
      return;
    }
    if (mode === 'steinsaltz' && !steinsaltzAvailable) {
      return;
    }
    void triggerSelection();
    persistViewMode(mode);
  }, [viewMode, chavrutaAvailable, steinsaltzAvailable, persistViewMode]);

  const handleToggleNotes = useCallback(() => {
    persistShowNotes(!showChavrutaNotes);
  }, [persistShowNotes, showChavrutaNotes]);

  const canPrevAmud = getPrevAmud(location) !== null;
  const canNextAmud = getNextAmud(location) !== null;
  const canPrevDaf = getPrevDaf(location) !== null;
  const canNextDaf = getNextDaf(location) !== null;

  const handlePrevAmud = useCallback(() => {
    const prev = getPrevAmud(location);
    if (prev) {
      void triggerSelection();
      setNavDirection('prev');
      setLocation(prev);
    }
  }, [location]);

  const handleNextAmud = useCallback(() => {
    const next = getNextAmud(location);
    if (next) {
      void triggerSelection();
      setNavDirection('next');
      setLocation(next);
    }
  }, [location]);

  const handlePrevDaf = useCallback(() => {
    const prev = getPrevDaf(location);
    if (prev) {
      void triggerSelection();
      setNavDirection('prev');
      setLocation(prev);
    }
  }, [location]);

  const handleNextDaf = useCallback(() => {
    const next = getNextDaf(location);
    if (next) {
      void triggerSelection();
      setNavDirection('next');
      setLocation(next);
    }
  }, [location]);

  const pageKey = `${location.masechetEn}-${location.dafNum}-${location.amud}`;

  return {
    location,
    pageKey,
    navDirection,
    viewMode,
    fontSize,
    sefariaData,
    sefariaLoading,
    sefariaError,
    showChavrutaNotes,
    chavrutaAvailable,
    steinsaltzAvailable,
    classicTabLabel,
    chavruta,
    loadSefariaText,
    handleToggleViewMode,
    handleIncreaseFontSize,
    handleDecreaseFontSize,
    handleToggleNotes,
    canPrevAmud,
    canNextAmud,
    canPrevDaf,
    canNextDaf,
    handlePrevAmud,
    handleNextAmud,
    handlePrevDaf,
    handleNextDaf,
  };
}
