import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Linking, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ScreenOrientation from 'expo-screen-orientation';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useShallow } from 'zustand/react/shallow';
import TzuratHeader from '../components/TzuratHadaf/TzuratHeader';
import TzuratHadafViewer, { type TzuratPageContent } from '../components/TzuratHadaf/TzuratHadafViewer';
import TzuratNavigationBar from '../components/TzuratHadaf/TzuratNavigationBar';
import ConfirmModal from '../components/ConfirmModal';
import DafMarkMenuModal from '../components/DafMarkMenuModal';
import { getStudyStatus } from '../utils/dafStatus';
import { useTheme } from '../theme';
import { useAppStore } from '../store/useAppStore';
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
import { SHAS_MASECHTOT, numberToGematria } from '../data/shas';
import { getDafDateStr } from '../utils/shas';

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
  const [showConfirm, setShowConfirm] = useState(false);
  const [showMarkMenu, setShowMarkMenu] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const [page, setPage] = useState<TzuratPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { history, settings, toggleAnyDafLearned, setDafStudyStatus } = useAppStore(
    useShallow((s) => ({
      history: s.history,
      settings: s.settings,
      toggleAnyDafLearned: s.toggleAnyDafLearned,
      setDafStudyStatus: s.setDafStudyStatus,
    })),
  );

  const lockPortrait = useCallback(async () => {
    try {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    } catch {
      // orientation lock may fail on some platforms
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
      // ignore orientation errors
    }
  }, [isLandscape]);

  const masechetHe = useMemo(
    () => getMasechetHe(location.masechetEn, route.params.masechetHe),
    [location.masechetEn, route.params.masechetHe],
  );

  const dateStr = useMemo(
    () => (masechetHe ? getDafDateStr(masechetHe, location.dafNum) : null),
    [masechetHe, location.dafNum],
  );

  const dafHeStr = useMemo(
    () => `דף ${numberToGematria(location.dafNum)}`,
    [location.dafNum],
  );

  const studyStatus = useMemo(() => {
    if (!dateStr) return 'none' as const;
    const record = history.find((r) => r.date === dateStr);
    return getStudyStatus(record);
  }, [history, dateStr]);
  const isLearned = studyStatus === 'learned';

  const canMarkLearned = dateStr != null && masechetHe != null;

  const handleToggleLearned = useCallback(() => {
    if (!canMarkLearned || !dateStr || !masechetHe) return;
    if (studyStatus === 'learned') {
      setShowConfirm(true);
      return;
    }
    if (studyStatus === 'partial') {
      if (settings?.show_confetti === 1) setShowConfetti(true);
      setDafStudyStatus(dateStr, masechetHe, dafHeStr, 'learned');
      return;
    }
    if (settings?.show_confetti === 1) setShowConfetti(true);
    toggleAnyDafLearned(dateStr, masechetHe, dafHeStr);
  }, [canMarkLearned, dateStr, masechetHe, dafHeStr, studyStatus, settings, toggleAnyDafLearned, setDafStudyStatus]);

  const loadPage = useCallback(async (loc: DafLocation) => {
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

  useEffect(() => {
    loadPage(location);
  }, [location, loadPage]);

  const canPrevAmud = getPrevAmud(location) !== null;
  const canNextAmud = getNextAmud(location) !== null;
  const canPrevDaf = getPrevDaf(location) !== null;
  const canNextDaf = getNextDaf(location) !== null;

  const openSefaria = useCallback(() => {
    Linking.openURL(buildSefariaTextUrl(location.masechetEn, location.dafNum, location.amud));
  }, [location]);

  const layoutKey = `${width}x${height}`;

  return (
    <View style={styles.container}>
      <TzuratHeader
        masechetHe={masechetHe}
        masechetEn={location.masechetEn}
        dafNum={location.dafNum}
        amud={location.amud}
        isLandscape={isLandscape}
        studyStatus={studyStatus}
        canMarkLearned={canMarkLearned}
        onClose={() => navigation.goBack()}
        onToggleLearned={handleToggleLearned}
        onLongPressLearned={() => setShowMarkMenu(true)}
      />

      <TzuratHadafViewer
        page={page}
        loading={loading}
        error={error}
        layoutKey={layoutKey}
        isLandscape={isLandscape}
        onToggleOrientation={handleToggleOrientation}
        onOpenSefaria={openSefaria}
        onRetry={() => loadPage(location)}
      />

      <TzuratNavigationBar
        isLandscape={isLandscape}
        canPrevAmud={canPrevAmud}
        canNextAmud={canNextAmud}
        canPrevDaf={canPrevDaf}
        canNextDaf={canNextDaf}
        onPrevAmud={() => {
          const prev = getPrevAmud(location);
          if (prev) setLocation(prev);
        }}
        onNextAmud={() => {
          const next = getNextAmud(location);
          if (next) setLocation(next);
        }}
        onPrevDaf={() => {
          const prev = getPrevDaf(location);
          if (prev) setLocation(prev);
        }}
        onNextDaf={() => {
          const next = getNextDaf(location);
          if (next) setLocation(next);
        }}
      />

      <DafMarkMenuModal
        visible={showMarkMenu}
        onSelectFull={() => {
          if (dateStr && masechetHe) {
            if (settings?.show_confetti === 1) setShowConfetti(true);
            setDafStudyStatus(dateStr, masechetHe, dafHeStr, 'learned');
          }
          setShowMarkMenu(false);
        }}
        onSelectHalfA={() => {
          if (dateStr && masechetHe) {
            setDafStudyStatus(dateStr, masechetHe, dafHeStr, 'partial');
          }
          setShowMarkMenu(false);
        }}
        onSelectHalfB={() => {
          if (dateStr && masechetHe) {
            setDafStudyStatus(dateStr, masechetHe, dafHeStr, 'partial');
          }
          setShowMarkMenu(false);
        }}
        showUnmark={studyStatus === 'partial'}
        onUnmark={() => {
          setShowMarkMenu(false);
          setShowConfirm(true);
        }}
        onCancel={() => setShowMarkMenu(false)}
      />

      <ConfirmModal
        visible={showConfirm}
        title="ביטול לימוד"
        message="האם אתה בטוח שברצונך לבטל את סימון הדף?"
        onConfirm={() => {
          setShowConfirm(false);
          if (dateStr && masechetHe) {
            toggleAnyDafLearned(dateStr, masechetHe, dafHeStr);
          }
        }}
        onCancel={() => setShowConfirm(false)}
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
    confettiContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
      justifyContent: 'center',
      alignItems: 'center',
      direction: 'ltr',
    },
  });
