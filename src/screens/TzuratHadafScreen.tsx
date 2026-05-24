import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Linking } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import TzuratHeader from '../components/TzuratHadaf/TzuratHeader';
import TzuratHadafViewer, { type TzuratPageContent } from '../components/TzuratHadaf/TzuratHadafViewer';
import TzuratNavigationBar from '../components/TzuratHadaf/TzuratNavigationBar';
import { useTheme } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import {
  buildSefariaTextUrl,
  buildSefariaTref,
  getNextAmud,
  getPrevAmud,
  getNextDaf,
  getPrevDaf,
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

type Route = RouteProp<RootStackParamList, 'TzuratHadaf'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'TzuratHadaf'>;

export default function TzuratHadafScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [location, setLocation] = useState<DafLocation>({
    masechetEn: route.params.masechetEn,
    dafNum: route.params.dafNum,
    amud: route.params.amud,
  });

  const [page, setPage] = useState<TzuratPageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async (loc: DafLocation) => {
    const tref = buildSefariaTref(loc.masechetEn, loc.dafNum, loc.amud);
    const pageId = resolveDafYomiPageId(loc.masechetEn, loc.dafNum, loc.amud);
    const remoteUrl = pageId != null ? buildDafYomiPdfUrl(pageId) : undefined;

    const cachedPdf = peekCachedPdfUri(tref) ?? (await resolveCachedPdfUri(tref));
    if (cachedPdf) {
      await clearCachedManuscriptImage(tref);
      console.log('[tzuratHadaf] displaying cached pdf', {
        tref,
        pageId,
        remoteUrl,
        uri: cachedPdf,
      });
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
        console.log('[tzuratHadaf] using cached sefaria fallback image', { tref, uri: cachedImage });
        setPage({ kind: 'image', uri: cachedImage });
        return;
      }

      console.log('[tzuratHadaf] falling back to Sefaria manuscripts', { tref });
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

  return (
    <View style={styles.container}>
      <TzuratHeader
        masechetHe={route.params.masechetHe}
        masechetEn={location.masechetEn}
        dafNum={location.dafNum}
        amud={location.amud}
        onClose={() => navigation.goBack()}
      />

      <TzuratHadafViewer
        page={page}
        loading={loading}
        error={error}
        onOpenSefaria={openSefaria}
        onRetry={() => loadPage(location)}
      />

      <TzuratNavigationBar
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
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  });
