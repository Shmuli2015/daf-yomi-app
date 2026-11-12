import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { isShekalimMasechet } from '../utils/shekalimSefaria';
import { triggerSelection } from '../utils/haptics';
import { useReaderFontSize } from './useReaderFontSize';
import { useAppStore } from '../store/useAppStore';
import { clampReaderViewMode } from '../utils/readerViewMode';
import { describeSefariaLoadError } from '../utils/sefariaLoadErrorMessage';
import { useReaderPrefetch } from './useReaderPrefetch';

export type NavDirection = 'next' | 'prev' | null;

function locationRequestKey(loc: DafLocation, gemaraNikud: boolean): string {
  return `${normalizeMasechetEn(loc.masechetEn)}:${loc.dafNum}:${loc.amud}:${gemaraNikud ? '1' : '0'}`;
}

export function useDafReader(initialLocation: DafLocation) {
  const [location, setLocation] = useState<DafLocation>(initialLocation);
  const [navDirection, setNavDirection] = useState<NavDirection>(null);
  const storedViewMode = useAppStore(state => clampReaderViewMode(state.settings?.reader_view_mode));
  const storedShowNotes = useAppStore(state => state.settings?.show_chavruta_notes !== 0);
  const gemaraNikud = useAppStore(state => state.settings?.gemara_nikud !== 0);
  const persistViewMode = useAppStore(state => state.setReaderViewMode);
  const persistShowNotes = useAppStore(state => state.setShowChavrutaNotesEnabled);
  const persistGemaraNikud = useAppStore(state => state.setGemaraNikudEnabled);
  const { fontSize, increase: handleIncreaseFontSize, decrease: handleDecreaseFontSize } =
    useReaderFontSize();
  const [sefariaData, setSefariaData] = useState<SefariaPageData | null>(null);
  const [sefariaLoading, setSefariaLoading] = useState(true);
  const [sefariaError, setSefariaError] = useState<string | null>(null);
  const loadRequestKeyRef = useRef<string | null>(null);
  const sefariaAbortRef = useRef<AbortController | null>(null);

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
  const nikudAvailable = !mishnahOnly && !isShekalimMasechet(normalizedMasechet);
  const viewMode = useMemo<ViewMode>(() => {
    if (storedViewMode === 'steinsaltz' && !steinsaltzAvailable) return 'classic';
    return storedViewMode;
  }, [storedViewMode, steinsaltzAvailable]);
  const showChavrutaNotes = storedShowNotes;
  const chavruta = useChavrutaPage(
    { masechetEn: chavrutaLocation.masechetEn, dafNum: chavrutaLocation.dafNum, amud: chavrutaLocation.amud },
    viewMode === 'chavruta' && chavrutaAvailable,
  );

  const loadSefariaText = useCallback(async (loc: DafLocation) => {
    sefariaAbortRef.current?.abort();
    const controller = new AbortController();
    sefariaAbortRef.current = controller;
    const requestKey = locationRequestKey(loc, gemaraNikud);
    loadRequestKeyRef.current = requestKey;
    setSefariaLoading(true);
    setSefariaError(null);
    try {
      const data = await fetchSefariaPageText(loc.masechetEn, loc.dafNum, loc.amud, gemaraNikud, {
        signal: controller.signal,
      });
      if (controller.signal.aborted || loadRequestKeyRef.current !== requestKey) {
        return;
      }
      setSefariaData(data);
    } catch (err: unknown) {
      if (controller.signal.aborted) {
        return;
      }
      if (loadRequestKeyRef.current !== requestKey) {
        return;
      }
      setSefariaError(describeSefariaLoadError(err, { gemaraNikud, nikudAvailable }));
    } finally {
      if (loadRequestKeyRef.current === requestKey) {
        setSefariaLoading(false);
      }
    }
  }, [gemaraNikud, nikudAvailable]);

  const deferSefaria = viewMode === 'chavruta' && chavrutaAvailable;
  useReaderPrefetch(location, gemaraNikud, deferSefaria);

  useEffect(() => {
    return () => {
      sefariaAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!deferSefaria) {
      void loadSefariaText(location);
      return;
    }
    const requestKey = locationRequestKey(location, gemaraNikud);
    if (loadRequestKeyRef.current && loadRequestKeyRef.current !== requestKey) {
      sefariaAbortRef.current?.abort();
    }
  }, [deferSefaria, gemaraNikud, location, loadSefariaText]);

  useEffect(() => {
    if (!deferSefaria || chavruta.loading) {
      return;
    }
    void loadSefariaText(location);
  }, [chavruta.loading, deferSefaria, location, loadSefariaText]);

  const handleToggleViewMode = useCallback((mode: ViewMode) => {
    if (mode === viewMode) {
      return;
    }
    if (mode === 'steinsaltz' && !steinsaltzAvailable) {
      return;
    }
    void triggerSelection();
    persistViewMode(mode);
  }, [viewMode, steinsaltzAvailable, persistViewMode]);

  const handleToggleNotes = useCallback(() => {
    persistShowNotes(!showChavrutaNotes);
  }, [persistShowNotes, showChavrutaNotes]);

  const handleToggleGemaraNikud = useCallback(() => {
    persistGemaraNikud(!gemaraNikud);
  }, [persistGemaraNikud, gemaraNikud]);

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

  const handleNavigateTo = useCallback((newLocation: DafLocation) => {
    void triggerSelection();
    setNavDirection(null);
    setLocation(newLocation);
  }, []);

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
    gemaraNikud,
    nikudAvailable,
    chavrutaAvailable,
    steinsaltzAvailable,
    classicTabLabel,
    chavruta,
    loadSefariaText,
    handleToggleViewMode,
    handleIncreaseFontSize,
    handleDecreaseFontSize,
    handleToggleNotes,
    handleToggleGemaraNikud,
    canPrevAmud,
    canNextAmud,
    canPrevDaf,
    canNextDaf,
    handlePrevAmud,
    handleNextAmud,
    handlePrevDaf,
    handleNextDaf,
    handleNavigateTo,
  };
}
