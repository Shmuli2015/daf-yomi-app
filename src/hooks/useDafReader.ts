import { useCallback, useEffect, useState } from 'react';
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

export function useDafReader(initialLocation: DafLocation) {
  const [location, setLocation] = useState<DafLocation>(initialLocation);
  const [viewMode, setViewMode] = useState<ViewMode>('classic');
  const { fontSize, increase: handleIncreaseFontSize, decrease: handleDecreaseFontSize } =
    useReaderFontSize();
  const [sefariaData, setSefariaData] = useState<SefariaPageData | null>(null);
  const [sefariaLoading, setSefariaLoading] = useState(true);
  const [sefariaError, setSefariaError] = useState<string | null>(null);
  const [showChavrutaNotes, setShowChavrutaNotes] = useState(true);

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

  useEffect(() => {
    if (viewMode === 'chavruta' && !chavrutaAvailable) {
      setViewMode('classic');
    }
    if (viewMode === 'steinsaltz' && !steinsaltzAvailable) {
      setViewMode('classic');
    }
  }, [viewMode, chavrutaAvailable, steinsaltzAvailable]);

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
    setViewMode(mode);
  }, [viewMode, chavrutaAvailable, steinsaltzAvailable]);

  const handleToggleNotes = useCallback(() => {
    setShowChavrutaNotes((prev) => !prev);
  }, []);

  const canPrevAmud = getPrevAmud(location) !== null;
  const canNextAmud = getNextAmud(location) !== null;
  const canPrevDaf = getPrevDaf(location) !== null;
  const canNextDaf = getNextDaf(location) !== null;

  const handlePrevAmud = useCallback(() => {
    const prev = getPrevAmud(location);
    if (prev) {
      void triggerSelection();
      setLocation(prev);
    }
  }, [location]);

  const handleNextAmud = useCallback(() => {
    const next = getNextAmud(location);
    if (next) {
      void triggerSelection();
      setLocation(next);
    }
  }, [location]);

  const handlePrevDaf = useCallback(() => {
    const prev = getPrevDaf(location);
    if (prev) {
      void triggerSelection();
      setLocation(prev);
    }
  }, [location]);

  const handleNextDaf = useCallback(() => {
    const next = getNextDaf(location);
    if (next) {
      void triggerSelection();
      setLocation(next);
    }
  }, [location]);

  return {
    location,
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
