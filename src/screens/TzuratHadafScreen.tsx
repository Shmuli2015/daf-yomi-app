import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useKeepAwake } from 'expo-keep-awake';
import ConfettiCannon from 'react-native-confetti-cannon';
import TzuratHeader from '../components/TzuratHadaf/TzuratHeader';
import TzuratNavigationBar from '../components/TzuratHadaf/TzuratNavigationBar';
import FullscreenExitButton from '../components/TzuratHadaf/FullscreenExitButton';
import TzuratMarkTrackModal from '../components/TzuratHadaf/TzuratMarkTrackModal';
import SiyumModal from '../components/Siyum/SiyumModal';
import ConfirmModal from '../components/ConfirmModal';
import DafMarkMenuModal from '../components/DafMarkMenuModal';
import GuideModal from '../components/Guide/GuideModal';
import ReaderToolbar, { type ReaderTheme } from '../components/SefariaReader/ReaderToolbar';
import ReaderModePane from '../components/SefariaReader/ReaderModePane';
import SefariaTextContainer from '../components/SefariaReader/SefariaTextContainer';
import SteinsaltzTextContainer from '../components/SefariaReader/SteinsaltzTextContainer';
import ChavrutaTextContainer from '../components/ChavrutaReader/ChavrutaTextContainer';
import ReadingProgressBar from '../components/SefariaReader/ReadingProgressBar';
import { useDafReader } from '../hooks/useDafReader';
import { useTheme } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { normalizeMasechetEn } from '../utils/dafNavigation';
import { readerDisplayMasechetHe, isTamidStartDaf } from '../utils/mishnahOnlySefaria';
import { SHAS_MASECHTOT } from '../data/shas';
import { useDafSwipeGesture } from '../hooks/useDafSwipeGesture';
import { useTzuratLearnedMark } from '../hooks/useTzuratLearnedMark';

type Route = RouteProp<RootStackParamList, 'TzuratHadaf'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'TzuratHadaf'>;

function getMasechetHe(masechetEn: string, fallback?: string): string | undefined {
  const normalized = normalizeMasechetEn(masechetEn);
  const match = SHAS_MASECHTOT.find((m) => m.en === normalized);
  return match?.he ?? fallback;
}

export default function TzuratHadafScreen() {
  useKeepAwake();
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isLandscape = width > height;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMarkMenu, setShowMarkMenu] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const readerTheme: ReaderTheme = theme.colors.background === '#121212' ? 'dark' : 'light';

  const reader = useDafReader({
    masechetEn: route.params.masechetEn,
    dafNum: route.params.dafNum,
    amud: route.params.amud,
  });

  useEffect(() => {
    setScrollProgress(0);
  }, [reader.pageKey]);

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
            showNotes={reader.showChavrutaNotes}
            onToggleNotes={reader.handleToggleNotes}
            chavrutaAvailable={reader.chavrutaAvailable}
            steinsaltzAvailable={reader.steinsaltzAvailable}
            classicTabLabel={reader.classicTabLabel}
            onOpenGuide={() => setShowGuideModal(true)}
          />

          <ReadingProgressBar progress={scrollProgress} accentColor={theme.colors.accent} />
        </>
      )}

      <View style={styles.viewerContainer} {...swipeHandlers}>
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
              fontSize={reader.fontSize}
              readerTheme={readerTheme}
              accentColor={theme.colors.accent}
              classicTabLabel={reader.classicTabLabel}
              onScrollProgress={setScrollProgress}
            />
          ) : reader.viewMode === 'steinsaltz' ? (
            <SteinsaltzTextContainer
              data={reader.sefariaData}
              loading={reader.sefariaLoading}
              error={reader.sefariaError}
              onRetry={() => reader.loadSefariaText(reader.location)}
              fontSize={reader.fontSize}
              readerTheme={readerTheme}
              accentColor={theme.colors.accent}
              onScrollProgress={setScrollProgress}
            />
          ) : (
            <ChavrutaTextContainer
              data={reader.chavruta.data}
              loading={reader.chavruta.loading}
              error={reader.chavruta.error}
              onRetry={reader.chavruta.reload}
              fontSize={reader.fontSize}
              showNotes={reader.showChavrutaNotes}
              onScrollProgress={setScrollProgress}
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

      <GuideModal
        visible={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        initialTab="faq"
        initialQuery="קורא"
      />

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
