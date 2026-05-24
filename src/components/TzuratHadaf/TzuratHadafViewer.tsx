import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';
import type { TzuratHadafViewerProps } from './types';
import { buildZoomableHtml, isLocalUri } from './viewerHtml';
import { createViewerStyles } from './viewerStyles';
import { usePdfViewerHtml } from './usePdfViewerHtml';
import TzuratViewerLoading from './TzuratViewerLoading';
import TzuratViewerError from './TzuratViewerError';
import TzuratPageWebView from './TzuratPageWebView';
import TzuratZoomHint from './TzuratZoomHint';

export type { TzuratPageContent } from './types';

export default function TzuratHadafViewer({
  page,
  loading,
  error,
  onOpenSefaria,
  onRetry,
}: TzuratHadafViewerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createViewerStyles(theme), [theme]);
  const [contentLoading, setContentLoading] = useState(true);

  const handlePdfPrepareStart = useCallback(() => {
    setContentLoading(true);
  }, []);

  const handlePdfPrepareFailed = useCallback(() => {
    setContentLoading(false);
  }, []);

  const { pdfHtml, pdfRenderError, setPdfHtml, setPdfRenderError } = usePdfViewerHtml(
    page,
    theme.colors.background,
    handlePdfPrepareStart,
    handlePdfPrepareFailed
  );

  useEffect(() => {
    if (!page) return;
    if (page.kind === 'pdf') {
      setContentLoading(true);
      return;
    }
    setContentLoading(!isLocalUri(page.uri));
  }, [page]);

  const imageHtml = useMemo(
    () =>
      page?.kind === 'image'
        ? buildZoomableHtml(page.uri, theme.colors.background)
        : null,
    [page, theme.colors.background]
  );

  if (loading) {
    return <TzuratViewerLoading styles={styles} message="טוען את דף הגמרא..." />;
  }

  if (error || !page || (page.kind === 'pdf' && pdfRenderError)) {
    return (
      <TzuratViewerError
        styles={styles}
        message={error || pdfRenderError || 'לא ניתן לטעון את צורת הדף כרגע.'}
        textPrimary={theme.colors.textPrimary}
        textSecondary={theme.colors.textSecondary}
        onRetry={onRetry}
        onOpenSefaria={onOpenSefaria}
      />
    );
  }

  const webHtml = page.kind === 'pdf' ? pdfHtml : imageHtml;
  const webViewReady = page.kind === 'image' ? !!imageHtml : !!pdfHtml;

  if (!webViewReady || !webHtml) {
    return <TzuratViewerLoading styles={styles} message="מציג את צורת הדף..." />;
  }

  return (
    <View style={styles.viewer}>
      <TzuratPageWebView
        page={page}
        html={webHtml}
        styles={styles}
        backgroundColor={theme.colors.background}
        contentLoading={contentLoading}
        onContentLoadEnd={() => setContentLoading(false)}
        onPdfRenderError={(message) => {
          setPdfRenderError(message);
          setContentLoading(false);
        }}
        onUseGoogleFallback={(html) => {
          setPdfHtml(html);
          setContentLoading(true);
        }}
      />
      <TzuratZoomHint styles={styles} textMuted={theme.colors.textMuted} />
    </View>
  );
}
