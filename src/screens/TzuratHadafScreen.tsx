import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Linking, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ScreenOrientation from 'expo-screen-orientation';
import { StatusBar } from 'expo-status-bar';
import ConfettiCannon from 'react-native-confetti-cannon';
import TzuratHeader from '../components/TzuratHadaf/TzuratHeader';
import TzuratHadafViewer, { type TzuratPageContent } from '../components/TzuratHadaf/TzuratHadafViewer';
import TzuratNavigationBar from '../components/TzuratHadaf/TzuratNavigationBar';
import FullscreenExitButton from '../components/TzuratHadaf/FullscreenExitButton';
import TzuratMarkTrackModal from '../components/TzuratHadaf/TzuratMarkTrackModal';
import SiyumModal from '../components/Siyum/SiyumModal';
import ConfirmModal from '../components/ConfirmModal';
import DafMarkMenuModal from '../components/DafMarkMenuModal';
import ReaderToolbar, { type ViewMode, type ReaderTheme } from '../components/SefariaReader/ReaderToolbar';
import SefariaTextContainer from '../components/SefariaReader/SefariaTextContainer';
import { fetchSefariaPageText, type SefariaPageData } from '../services/sefariaTextApi';
import { useTheme } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import {
  buildSefariaTextUrl,
  buildSefariaTref,
  getNextAmud,
  getPrevAmud,
  getNextDaf,
  getPrevDaf,
  normalizeMasechetEn,
  type DafLocation,
} from '../utils/dafNavigation';
import { buildDafYomiPdfUrl, resolveDafYomiPageId } from '../utils/dafYomiPageId';
import {
  fetchDafYomiPage,
  peekCachedPdfUri,
  resolveCachedPdfUri,
} from '../services/dafYomiPages';
import {
  fetchVilnaManuscriptPage,
  peekCachedImageUri,
  resolveCachedImageUri,
  clearCachedManuscriptImage,
} from '../services/sefariaManuscripts';
import { SHAS_MASECHTOT } from '../data/shas';
import { useDafSwipeGesture } from '../hooks/useDafSwipeGesture';
import { useTzuratLearnedMark } from '../hooks/useTzuratLearnedMark';
import { triggerSelection } from '../utils/haptics';

type Route = RouteProp<RootStackParamList, 'TzuratHadaf'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'TzuratHadaf'>;

function getMasechetHe(masechetEn: string, fallback?: string): string | undefined {
  const normalized = normalizeMasechetEn(masechetEn);
  const match = SHAS_MASECHTOT.find((m) => m.en === normalized);
  return match?.he ?? fallback;
}

export default function TzuratHadafScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [location, setLocation] = useState<DafLocation>({
    masechetEn: route.params.masechetEn,
    dafNum: route.params.dafNum,
    amud: route.params.amud,
  });
  const [isLandscape, setIsLandscape] = useState(width > height);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMarkMenu, setShowMarkMenu] = useState(false);

  const [page, setPage] = useState<TzuratPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('pdf');
  const [fontSize, setFontSize] = useState<number>(18);
  const [readerTheme] = useState<ReaderTheme>(
    theme.colors.background === '#121212' ? 'dark' : 'light'
  );
  const [sefariaData, setSefariaData] = useState<SefariaPageData | null>(null);
  const [sefariaLoading, setSefariaLoading] = useState<boolean>(false);
  const [sefariaError, setSefariaError] = useState<string | null>(null);

  const lockPortrait = useCallback(async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    } catch {
    }
  }, []);

  useEffect(() => {
    lockPortrait();
    const unsubscribe = navigation.addListener('beforeRemove', () => {
      void lockPortrait();
    });
    return () => {
      unsubscribe();
      void lockPortrait();
    };
  }, [navigation, lockPortrait]);

  useEffect(() => {
    setIsLandscape(width > height);
  }, [width, height]);

  const handleToggleOrientation = useCallback(async () => {
    try {
      if (isLandscape) {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsLandscape(false);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsLandscape(true);
      }
    } catch {
    }
  }, [isLandscape]);

  const masechetHe = useMemo(
    () => getMasechetHe(location.masechetEn, route.params.masechetHe),
    [location.masechetEn, route.params.masechetHe],
  );

  const {
    personalEnabled,
    studyStatus,
    dafYomiStatus,
    personalStatus,
    dafYomiPartialAmud,
    personalPartialAmud,
    menuPartialAmud,
    menuStudyStatus,
    canMarkLearned,
    canMarkDafYomi,
    masechetTotalPages,
    handleToggleLearned,
    handleSelectTrack,
    handleOpenHalfMenuForTrack,
    handleSelectFull,
    handleSelectHalfA,
    handleSelectHalfB,
    handleConfirmUnmark,
    requestUnmarkPending,
    showTrackPicker,
    setShowTrackPicker,
    showConfirm,
    setShowConfirm,
    showSiyumModal,
    setShowSiyumModal,
    showConfetti,
    setShowConfetti,
  } = useTzuratLearnedMark({
    masechetEn: location.masechetEn,
    masechetHe,
    dafNum: location.dafNum,
  });

  const loadPdfPage = useCallback(async (loc: DafLocation) => {
    const tref = buildSefariaTref(loc.masechetEn, loc.dafNum, loc.amud);
    const pageId = resolveDafYomiPageId(loc.masechetEn, loc.dafNum, loc.amud);
    const remoteUrl = pageId != null ? buildDafYomiPdfUrl(pageId) : undefined;

    const cachedPdf = peekCachedPdfUri(tref) ?? (await resolveCachedPdfUri(tref));
    if (cachedPdf) {
      await clearCachedManuscriptImage(tref);
      setPage({
        kind: 'pdf',
        uri: cachedPdf,
        remoteUrl,
      });
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    setPage(null);

    try {
      const pdfPage = await fetchDafYomiPage(loc.masechetEn, loc.dafNum, loc.amud);
      if (pdfPage) {
        setPage(pdfPage);
        return;
      }

      const cachedImage = peekCachedImageUri(tref) ?? (await resolveCachedImageUri(tref));
      if (cachedImage) {
        setPage({ kind: 'image', uri: cachedImage });
        return;
      }

      const sefariaPage = await fetchVilnaManuscriptPage(loc.masechetEn, loc.dafNum, loc.amud);
      if (!sefariaPage) {
        setError('לא נמצאה תמונת צורת הדף לדף זה. ניתן לפתוח את הטקסט בספריא.');
        return;
      }
      setPage({ kind: 'image', uri: sefariaPage.imageUrl });
    } catch {
      setError('נדרש חיבור לאינטרנט כדי לצפות בצורת הדף.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSefariaText = useCallback(async (loc: DafLocation) => {
    setSefariaLoading(true);
    setSefariaError(null);
    try {
      const data = await fetchSefariaPageText(loc.masechetEn, loc.dafNum, loc.amud);
      setSefariaData(data);
    } catch (err: any) {
      setSefariaError(err.message || 'שגיאה בטעינת הטקסט מספריא');
    } finally {
      setSefariaLoading(false);
    }
  }, []);

  const prefetchAdjacentPages = useCallback((loc: DafLocation) => {
    const nextLoc = getNextAmud(loc);
    if (nextLoc) {
      const tref = buildSefariaTref(nextLoc.masechetEn, nextLoc.dafNum, nextLoc.amud);
      if (!peekCachedPdfUri(tref)) {
        fetchDafYomiPage(nextLoc.masechetEn, nextLoc.dafNum, nextLoc.amud).catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    loadPdfPage(location);
    if (viewMode === 'text') {
      loadSefariaText(location);
    }
    prefetchAdjacentPages(location);
  }, [location, loadPdfPage, loadSefariaText, viewMode, prefetchAdjacentPages]);

  const handleToggleViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'text' && !sefariaData) {
      loadSefariaText(location);
    }
  }, [location, loadSefariaText, sefariaData]);

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

  const swipeHandlers = useDafSwipeGesture({
    canSwipeNext: canNextAmud || canNextDaf,
    canSwipePrev: canPrevAmud || canPrevDaf,
    onSwipeNext: () => {
      if (canNextAmud) handleNextAmud();
      else if (canNextDaf) handleNextDaf();
    },
    onSwipePrev: () => {
      if (canPrevAmud) handlePrevAmud();
      else if (canPrevDaf) handlePrevDaf();
    },
    enabled: true,
  });

  const openSefaria = useCallback(() => {
    Linking.openURL(buildSefariaTextUrl(location.masechetEn, location.dafNum, location.amud));
  }, [location]);

  const layoutKey = `${width}x${height}`;

  return (
    <View style={styles.container}>
      <StatusBar hidden={isFullscreen} />

      {isFullscreen ? (
        <FullscreenExitButton onPress={() => setIsFullscreen(false)} />
      ) : (
        <>
          <TzuratHeader
            masechetHe={masechetHe}
            masechetEn={location.masechetEn}
            dafNum={location.dafNum}
            amud={location.amud}
            isLandscape={isLandscape}
            studyStatus={studyStatus}
            canMarkLearned={canMarkLearned}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
            onClose={() => navigation.goBack()}
            onToggleLearned={handleToggleLearned}
            onLongPressLearned={() => {
              if (personalEnabled) {
                setShowTrackPicker(true);
              } else {
                setShowMarkMenu(true);
              }
            }}
          />

          <ReaderToolbar
            viewMode={viewMode}
            onToggleViewMode={handleToggleViewMode}
            fontSize={fontSize}
            onIncreaseFontSize={() => setFontSize((s) => Math.min(30, s + 2))}
            onDecreaseFontSize={() => setFontSize((s) => Math.max(14, s - 2))}
            accentColor={theme.colors.accent}
          />
        </>
      )}

      <View style={styles.viewerContainer} {...swipeHandlers}>
        {viewMode === 'pdf' ? (
          <TzuratHadafViewer
            page={page}
            loading={loading}
            error={error}
            layoutKey={layoutKey}
            isLandscape={isLandscape}
            isFullscreen={isFullscreen}
            onToggleOrientation={handleToggleOrientation}
            onOpenSefaria={openSefaria}
            onRetry={() => loadPdfPage(location)}
          />
        ) : (
          <SefariaTextContainer
            data={sefariaData}
            loading={sefariaLoading}
            error={sefariaError}
            onRetry={() => loadSefariaText(location)}
            fontSize={fontSize}
            readerTheme={readerTheme}
            accentColor={theme.colors.accent}
          />
        )}
      </View>

      {!isFullscreen && (
        <TzuratNavigationBar
          isLandscape={isLandscape}
          canPrevAmud={canPrevAmud}
          canNextAmud={canNextAmud}
          canPrevDaf={canPrevDaf}
          canNextDaf={canNextDaf}
          onPrevAmud={handlePrevAmud}
          onNextAmud={handleNextAmud}
          onPrevDaf={handlePrevDaf}
          onNextDaf={handleNextDaf}
        />
      )}

      <TzuratMarkTrackModal
        visible={showTrackPicker}
        dafYomiStatus={dafYomiStatus}
        personalStatus={personalStatus}
        dafYomiPartialAmud={dafYomiPartialAmud}
        personalPartialAmud={personalPartialAmud}
        canMarkDafYomi={canMarkDafYomi}
        onSelectDafYomi={() => handleSelectTrack('dafYomi')}
        onSelectPersonal={() => handleSelectTrack('personal')}
        onLongPressDafYomi={() => {
          handleOpenHalfMenuForTrack('dafYomi');
          setShowMarkMenu(true);
        }}
        onLongPressPersonal={() => {
          handleOpenHalfMenuForTrack('personal');
          setShowMarkMenu(true);
        }}
        onCancel={() => setShowTrackPicker(false)}
      />

      <DafMarkMenuModal
        visible={showMarkMenu}
        onSelectFull={() => {
          handleSelectFull();
          setShowMarkMenu(false);
        }}
        onSelectHalfA={() => {
          handleSelectHalfA();
          setShowMarkMenu(false);
        }}
        onSelectHalfB={() => {
          handleSelectHalfB();
          setShowMarkMenu(false);
        }}
        partialAmud={menuPartialAmud}
        showUnmark={menuStudyStatus === 'partial'}
        onUnmark={() => {
          setShowMarkMenu(false);
          requestUnmarkPending();
        }}
        onCancel={() => setShowMarkMenu(false)}
      />

      <ConfirmModal
        visible={showConfirm}
        title="ביטול לימוד"
        message="האם אתה בטוח שברצונך לבטל את סימון הדף?"
        onConfirm={handleConfirmUnmark}
        onCancel={() => setShowConfirm(false)}
      />

      <SiyumModal
        visible={showSiyumModal}
        masechetHe={masechetHe || ''}
        totalPages={masechetTotalPages}
        onClose={() => setShowSiyumModal(false)}
      />

      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          <ConfettiCannon
            count={200}
            origin={{ x: width / 2, y: -50 }}
            fadeOut
            fallSpeed={3500}
            explosionSpeed={350}
            colors={[theme.colors.accent, '#FFFFFF', '#FFD700', theme.colors.success]}
            onAnimationEnd={() => setShowConfetti(false)}
          />
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    viewerContainer: {
      flex: 1,
    },
    confettiContainer: {
      ...StyleSheet.absoluteFill,
      zIndex: 1000,
      justifyContent: 'center',
      alignItems: 'center',
      direction: 'ltr',
    },
  });
