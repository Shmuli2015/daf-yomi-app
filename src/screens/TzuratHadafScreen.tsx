import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, View, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useSharedValue } from 'react-native-reanimated';
import TzuratHeader from '../components/TzuratHadaf/TzuratHeader';
import TzuratNavigationBar from '../components/TzuratHadaf/TzuratNavigationBar';
import FullscreenExitButton from '../components/TzuratHadaf/FullscreenExitButton';
import TzuratMarkTrackModal from '../components/TzuratHadaf/TzuratMarkTrackModal';
import SiyumModal from '../components/Siyum/SiyumModal';
import ConfirmModal from '../components/ConfirmModal';
import DafMarkMenuModal from '../components/DafMarkMenuModal';
import GuideModal from '../components/Guide/GuideModal';
import SupportFormModal from '../components/SupportForm/SupportFormModal';
import QuickJumpModal from '../components/QuickJump/QuickJumpModal';
import ReaderToolbar, { type ReaderTheme } from '../components/SefariaReader/ReaderToolbar';
import ReaderModePane from '../components/SefariaReader/ReaderModePane';
import ReaderSearchBar from '../components/SefariaReader/ReaderSearchBar';
import SefariaTextContainer from '../components/SefariaReader/SefariaTextContainer';
import SteinsaltzTextContainer from '../components/SefariaReader/SteinsaltzTextContainer';
import ChavrutaTextContainer from '../components/ChavrutaReader/ChavrutaTextContainer';
import AutoScrollFloatingBar from '../components/SefariaReader/AutoScrollFloatingBar';
import type { AutoScrollSpeedLevel } from '../hooks/useAutoScroll';
import { buildReaderPositionKey } from '../utils/readerPositionAnchors';
import ChavrutaUnavailableState from '../components/ChavrutaReader/ChavrutaUnavailableState';
import ReadingProgressBar from '../components/SefariaReader/ReadingProgressBar';
import { useDafReader } from '../hooks/useDafReader';
import { useReaderKeepAwake } from '../hooks/useReaderKeepAwake';
import { useReaderTheme } from '../hooks/useReaderTheme';
import { useReaderSearch } from '../hooks/useReaderSearch';
import { getReaderThemePalette } from '../utils/readerTheme';
import { buildReaderSearchSegments } from '../utils/readerSearchSegments';
import { useTheme } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { normalizeMasechetEn } from '../utils/dafNavigation';
import { readerDisplayMasechetHe, isTamidStartDaf } from '../utils/mishnahOnlySefaria';
import { SHAS_MASECHTOT } from '../data/shas';
import { useDafSwipeGesture } from '../hooks/useDafSwipeGesture';
import { useReaderScrollMemory } from '../hooks/useReaderScrollMemory';
import { useTzuratLearnedMark } from '../hooks/useTzuratLearnedMark';

type Route = RouteProp<RootStackParamList, 'TzuratHadaf'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'TzuratHadaf'>;

function getMasechetHe(masechetEn: string, fallback?: string): string | undefined {
  const normalized = normalizeMasechetEn(masechetEn);
  const match = SHAS_MASECHTOT.find((m) => m.en === normalized);
  return match?.he ?? fallback;
}

export default function TzuratHadafScreen() {
  useReaderKeepAwake();
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isLandscape = width > height;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMarkMenu, setShowMarkMenu] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportInitialMessage, setSupportInitialMessage] = useState('');
  const [showQuickJumpModal, setShowQuickJumpModal] = useState(false);
  const [autoScrollActive, setAutoScrollActive] = useState(false);
  const [autoScrollLevel, setAutoScrollLevel] = useState<AutoScrollSpeedLevel>(3);
  const [autoScrollPaused, setAutoScrollPaused] = useState(false);
  const scrollProgress = useSharedValue(0);
  const isSystemDark = theme.colors.background === '#121212';
  const { readerTheme, setReaderTheme } = useReaderTheme(isSystemDark);
  const readerPalette = useMemo(
    () => getReaderThemePalette(readerTheme, theme.colors.accent),
    [readerTheme, theme.colors.accent],
  );

  const reader = useDafReader({
    masechetEn: route.params.masechetEn,
    dafNum: route.params.dafNum,
    amud: route.params.amud,
  });
  const { getOffset, setOffset } = useReaderScrollMemory(reader.pageKey);

  useEffect(() => {
    scrollProgress.value = 0;
  }, [reader.pageKey, scrollProgress]);

  const masechetHe = useMemo(
    () => getMasechetHe(reader.location.masechetEn, route.params.masechetHe),
    [reader.location.masechetEn, route.params.masechetHe],
  );

  const headerMasechetHe = useMemo(
    () =>
      readerDisplayMasechetHe(
        reader.location.masechetEn,
        reader.location.dafNum,
        reader.location.amud,
        masechetHe,
      ),
    [reader.location.masechetEn, reader.location.dafNum, reader.location.amud, masechetHe],
  );

  const searchSegments = useMemo(
    () =>
      buildReaderSearchSegments(
        reader.viewMode,
        reader.sefariaData,
        reader.chavruta.data,
      ),
    [reader.viewMode, reader.sefariaData, reader.chavruta.data],
  );
  const search = useReaderSearch({
    segments: searchSegments,
    resetKey: `${reader.pageKey}:${reader.viewMode}`,
  });

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
    closeTrackPicker,
    showHalfMenuInPicker,
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
    closeSiyum,
    showConfetti,
    setShowConfetti,
  } = useTzuratLearnedMark({
    masechetEn: reader.location.masechetEn,
    masechetHe,
    dafNum: reader.location.dafNum,
  });

  const handleNavigateNext = () => {
    if (reader.canNextAmud) reader.handleNextAmud();
    else if (reader.canNextDaf) reader.handleNextDaf();
  };

  const handleNavigatePrev = () => {
    if (reader.canPrevAmud) reader.handlePrevAmud();
    else if (reader.canPrevDaf) reader.handlePrevDaf();
  };

  const openReaderErrorSupport = useCallback(
    (source: string, error: string | null) => {
      const location = `${headerMasechetHe} דף ${reader.location.dafNum} ${reader.location.amud}`;
      const errorDetails = error?.trim() ? `\nפרטי השגיאה: ${error.trim()}` : '';
      setSupportInitialMessage(
        `נתקלתי בבעיה בטעינת ${source}.\nמיקום: ${location}${errorDetails}`,
      );
      setShowSupportForm(true);
    },
    [headerMasechetHe, reader.location.amud, reader.location.dafNum],
  );

  const swipeHandlers = useDafSwipeGesture({
    canSwipeNext: reader.canNextAmud || reader.canNextDaf,
    canSwipePrev: reader.canPrevAmud || reader.canPrevDaf,
    onSwipeNext: handleNavigateNext,
    onSwipePrev: handleNavigatePrev,
    enabled: true,
  });

  return (
    <View style={styles.container}>
      <StatusBar hidden={isFullscreen} />

      {isFullscreen ? (
        <FullscreenExitButton onPress={() => setIsFullscreen(false)} />
      ) : (
        <>
          <TzuratHeader
            masechetHe={headerMasechetHe}
            masechetEn={reader.location.masechetEn}
            dafNum={reader.location.dafNum}
            amud={reader.location.amud}
            isLandscape={isLandscape}
            studyStatus={studyStatus}
            canMarkLearned={canMarkLearned}
            isFullscreen={isFullscreen}
            onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
            onClose={() => navigation.goBack()}
            onToggleLearned={handleToggleLearned}
            onPressTitle={() => setShowQuickJumpModal(true)}
            onLongPressLearned={() => {
              if (personalEnabled) {
                setShowTrackPicker(true);
              } else {
                setShowMarkMenu(true);
              }
            }}
          />

          <ReaderToolbar
            viewMode={reader.viewMode}
            onToggleViewMode={reader.handleToggleViewMode}
            fontSize={reader.fontSize}
            onIncreaseFontSize={reader.handleIncreaseFontSize}
            onDecreaseFontSize={reader.handleDecreaseFontSize}
            accentColor={theme.colors.accent}
            readerTheme={readerTheme}
            onChangeReaderTheme={setReaderTheme}
            showNotes={reader.showChavrutaNotes}
            onToggleNotes={reader.handleToggleNotes}
            gemaraNikud={reader.gemaraNikud}
            onToggleGemaraNikud={reader.handleToggleGemaraNikud}
            nikudAvailable={reader.nikudAvailable}
            chavrutaAvailable={reader.chavrutaAvailable}
            steinsaltzAvailable={reader.steinsaltzAvailable}
            classicTabLabel={reader.classicTabLabel}
            onOpenGuide={() => setShowGuideModal(true)}
            autoScrollActive={autoScrollActive}
            onToggleAutoScroll={() => {
              setAutoScrollActive((prev) => !prev);
              setAutoScrollPaused(false);
            }}
            searchActive={search.isSearchActive}
            onToggleSearch={() => {
              if (search.isSearchActive) {
                search.closeSearch();
              } else {
                search.openSearch();
              }
            }}
          />

          {search.isSearchActive ? (
            <ReaderSearchBar
              query={search.searchQuery}
              onChangeQuery={search.setSearchQuery}
              matchCount={search.matches.length}
              activeMatchIndex={search.activeMatchIndex}
              onNext={search.goToNextMatch}
              onPrev={search.goToPrevMatch}
              onClose={search.closeSearch}
            />
          ) : null}

          <ReadingProgressBar progress={scrollProgress} accentColor={theme.colors.accent} />
        </>
      )}

      <View
        style={[styles.viewerContainer, { backgroundColor: readerPalette.backgroundColor }]}
        {...swipeHandlers}
      >
        <ReaderModePane
          viewMode={reader.viewMode}
          pageKey={reader.pageKey}
          navDirection={reader.navDirection}
        >
          {reader.viewMode === 'classic' ? (
            <SefariaTextContainer
              data={reader.sefariaData}
              loading={reader.sefariaLoading}
              error={reader.sefariaError}
              onRetry={() => reader.loadSefariaText(reader.location)}
              onReportError={() => openReaderErrorSupport('הטקסט', reader.sefariaError)}
              fontSize={reader.fontSize}
              readerTheme={readerTheme}
              accentColor={theme.colors.accent}
              classicTabLabel={reader.classicTabLabel}
              scrollProgress={scrollProgress}
              initialScrollOffset={getOffset('classic')}
              onScrollOffset={(offset) => setOffset('classic', offset)}
              positionKey={buildReaderPositionKey(reader.pageKey, 'classic')}
              autoScrollActive={autoScrollActive}
              autoScrollLevel={autoScrollLevel}
              autoScrollPaused={autoScrollPaused}
              onAutoScrollPause={() => setAutoScrollPaused(true)}
              searchQuery={search.isSearchActive ? search.searchQuery : ''}
              activeSearchSegmentId={search.activeMatch?.segmentId ?? null}
              activeSearchOccurrenceIndex={search.activeMatch?.occurrenceIndex ?? null}
            />
          ) : reader.viewMode === 'steinsaltz' ? (
            <SteinsaltzTextContainer
              data={reader.sefariaData}
              loading={reader.sefariaLoading}
              error={reader.sefariaError}
              onRetry={() => reader.loadSefariaText(reader.location)}
              onReportError={() => openReaderErrorSupport('ביאור שטיינזלץ', reader.sefariaError)}
              fontSize={reader.fontSize}
              readerTheme={readerTheme}
              accentColor={theme.colors.accent}
              scrollProgress={scrollProgress}
              initialScrollOffset={getOffset('steinsaltz')}
              onScrollOffset={(offset) => setOffset('steinsaltz', offset)}
              positionKey={buildReaderPositionKey(reader.pageKey, 'steinsaltz')}
              autoScrollActive={autoScrollActive}
              autoScrollLevel={autoScrollLevel}
              autoScrollPaused={autoScrollPaused}
              onAutoScrollPause={() => setAutoScrollPaused(true)}
              searchQuery={search.isSearchActive ? search.searchQuery : ''}
              activeSearchSegmentId={search.activeMatch?.segmentId ?? null}
              activeSearchOccurrenceIndex={search.activeMatch?.occurrenceIndex ?? null}
            />
          ) : !reader.chavrutaAvailable ? (
            <ChavrutaUnavailableState readerTheme={readerTheme} accentColor={theme.colors.accent} />
          ) : (
            <ChavrutaTextContainer
              data={reader.chavruta.data}
              loading={reader.chavruta.loading}
              error={reader.chavruta.error}
              onRetry={reader.chavruta.reload}
              onReportError={() => openReaderErrorSupport('ביאור חברותא', reader.chavruta.error)}
              fontSize={reader.fontSize}
              showNotes={reader.showChavrutaNotes}
              readerTheme={readerTheme}
              accentColor={theme.colors.accent}
              scrollProgress={scrollProgress}
              initialScrollOffset={getOffset('chavruta')}
              onScrollOffset={(offset) => setOffset('chavruta', offset)}
              positionKey={buildReaderPositionKey(reader.pageKey, 'chavruta')}
              autoScrollActive={autoScrollActive}
              autoScrollLevel={autoScrollLevel}
              autoScrollPaused={autoScrollPaused}
              onAutoScrollPause={() => setAutoScrollPaused(true)}
              searchQuery={search.isSearchActive ? search.searchQuery : ''}
              activeSearchSegmentId={search.activeMatch?.segmentId ?? null}
              activeSearchOccurrenceIndex={search.activeMatch?.occurrenceIndex ?? null}
            />
          )}
        </ReaderModePane>
      </View>

      {!isFullscreen && (
        <TzuratNavigationBar
          isLandscape={isLandscape}
          canPrevAmud={reader.canPrevAmud}
          canNextAmud={reader.canNextAmud}
          canPrevDaf={reader.canPrevDaf}
          canNextDaf={reader.canNextDaf}
          onPrevAmud={reader.handlePrevAmud}
          onNextAmud={reader.handleNextAmud}
          onPrevDaf={reader.handlePrevDaf}
          onNextDaf={reader.handleNextDaf}
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
        onLongPressDafYomi={() => handleOpenHalfMenuForTrack('dafYomi')}
        onLongPressPersonal={() => handleOpenHalfMenuForTrack('personal')}
        onCancel={closeTrackPicker}
        halfMenu={
          showHalfMenuInPicker
            ? {
                onSelectFull: () => {
                  handleSelectFull();
                  closeTrackPicker();
                },
                onSelectHalfA: () => {
                  handleSelectHalfA();
                  closeTrackPicker();
                },
                onSelectHalfB: () => {
                  handleSelectHalfB();
                  closeTrackPicker();
                },
                partialAmud: menuPartialAmud,
                showUnmark: menuStudyStatus === 'partial',
                onUnmark: () => {
                  closeTrackPicker();
                  requestUnmarkPending();
                },
                onCancel: closeTrackPicker,
              }
            : null
        }
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
        masechetHe={
          isTamidStartDaf(reader.location.masechetEn, reader.location.dafNum)
            ? 'קינים'
            : masechetHe || ''
        }
        totalPages={
          isTamidStartDaf(reader.location.masechetEn, reader.location.dafNum)
            ? SHAS_MASECHTOT.find((masechet) => masechet.en === 'Kinnim')?.pages ?? 3
            : masechetTotalPages
        }
        onClose={closeSiyum}
      />

      <QuickJumpModal
        visible={showQuickJumpModal}
        initialMasechetEn={reader.location.masechetEn}
        initialDafNum={reader.location.dafNum}
        initialAmud={reader.location.amud}
        onNavigate={(params) => {
          reader.handleNavigateTo({
            masechetEn: params.masechetEn,
            dafNum: params.dafNum,
            amud: params.amud,
          });
          setShowQuickJumpModal(false);
        }}
        onClose={() => setShowQuickJumpModal(false)}
      />

      <GuideModal
        visible={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        initialTab="faq"
        initialCategory="reader"
      />

      <SupportFormModal
        visible={showSupportForm}
        onClose={() => setShowSupportForm(false)}
        onMailOpenFailed={() =>
          Alert.alert(
            'אפליקציית הדוא״ל לא נפתחה',
            'אפשר לשלוח את הפנייה ישירות מהטופס.',
          )
        }
        initialCategory="bug"
        initialMessage={supportInitialMessage}
      />

      {autoScrollActive && (
        <AutoScrollFloatingBar
          isPaused={autoScrollPaused}
          level={autoScrollLevel}
          bottomOffset={isFullscreen ? 20 : 64}
          onTogglePlayPause={() => setAutoScrollPaused((prev) => !prev)}
          onChangeLevel={setAutoScrollLevel}
          onClose={() => {
            setAutoScrollActive(false);
            setAutoScrollPaused(false);
          }}
        />
      )}

      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          <ConfettiCannon
            count={200}
            origin={{ x: width / 2, y: -50 }}
            fadeOut
            fallSpeed={3500}
            explosionSpeed={350}
            colors={[theme.colors.accent, theme.colors.surface, theme.colors.accent, theme.colors.success]}
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
