import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { useTheme } from '../../theme';

export type TzuratPageContent = {
  kind: 'pdf' | 'image';
  uri: string;
  remoteUrl?: string;
};

interface TzuratHadafViewerProps {
  page: TzuratPageContent | null;
  loading: boolean;
  error: string | null;
  onOpenSefaria?: () => void;
  onRetry?: () => void;
}

function isLocalUri(uri: string): boolean {
  return uri.startsWith('file://') || uri.startsWith('/');
}

function buildZoomableHtml(imageUrl: string, backgroundColor: string): string {
  const safeUrl = imageUrl.replace(/"/g, '&quot;');
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=6, user-scalable=yes" />
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: ${backgroundColor};
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }
    body {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      min-height: 100%;
      padding: 12px;
    }
    img {
      display: block;
      width: 100%;
      max-width: 100%;
      height: auto;
      touch-action: pan-x pan-y pinch-zoom;
    }
  </style>
</head>
<body>
  <img src="${safeUrl}" alt="צורת הדף" />
</body>
</html>`;
}

function buildPdfJsHtml(pdfSource: string, backgroundColor: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=6, user-scalable=yes" />
  <style>
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: ${backgroundColor};
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }
    body {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      min-height: 100%;
      padding: 12px;
    }
    #status {
      width: 100%;
      text-align: center;
      padding: 24px 12px;
      font-family: sans-serif;
      color: #666;
    }
    canvas {
      display: block;
      width: 100%;
      max-width: 100%;
      height: auto;
      touch-action: pan-x pan-y pinch-zoom;
    }
  </style>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
</head>
<body>
  <div id="status">טוען PDF...</div>
  <canvas id="pdf-canvas"></canvas>
  <script>
    (function () {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const pdfSource = ${JSON.stringify(pdfSource)};

      pdfjsLib.getDocument(pdfSource).promise
        .then(function (pdf) { return pdf.getPage(1); })
        .then(function (page) {
          document.getElementById('status').style.display = 'none';
          const canvas = document.getElementById('pdf-canvas');
          const context = canvas.getContext('2d');
          const baseViewport = page.getViewport({ scale: 1 });
          const cssWidth = Math.max(window.innerWidth - 24, 1);
          const scale = cssWidth / baseViewport.width;
          const pixelRatio = window.devicePixelRatio || 1;
          const viewport = page.getViewport({ scale: scale * pixelRatio });
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = cssWidth + 'px';
          canvas.style.height = (viewport.height / pixelRatio) + 'px';
          return page.render({ canvasContext: context, viewport: viewport }).promise;
        })
        .then(function () {
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage('pdf-rendered');
        })
        .catch(function (err) {
          document.getElementById('status').textContent = 'לא ניתן להציג PDF';
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'pdfError', message: String(err && err.message ? err.message : err) })
          );
        });
    })();
  </script>
</body>
</html>`;
}

function buildGooglePdfHtml(remoteUrl: string, backgroundColor: string): string {
  const viewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(remoteUrl)}`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=6, user-scalable=yes" />
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: ${backgroundColor}; }
    iframe { width: 100%; height: 100%; border: 0; }
  </style>
</head>
<body>
  <iframe src="${viewerUrl.replace(/"/g, '&quot;')}" title="צורת הדף"></iframe>
</body>
</html>`;
}

export default function TzuratHadafViewer({
  page,
  loading,
  error,
  onOpenSefaria,
  onRetry,
}: TzuratHadafViewerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [contentLoading, setContentLoading] = useState(true);
  const [pdfHtml, setPdfHtml] = useState<string | null>(null);
  const [pdfRenderError, setPdfRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (!page || page.kind !== 'pdf') {
      setPdfHtml(null);
      setPdfRenderError(null);
      return;
    }

    let cancelled = false;

    (async () => {
      setContentLoading(true);
      setPdfRenderError(null);
      setPdfHtml(null);

      try {
        let pdfSource = page.uri;
        if (isLocalUri(page.uri)) {
          console.log('[tzuratHadaf] reading cached pdf for display', { uri: page.uri });
          const base64 = await FileSystem.readAsStringAsync(page.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          pdfSource = `data:application/pdf;base64,${base64}`;
        }

        if (cancelled) return;

        console.log('[tzuratHadaf] rendering pdf with pdf.js', {
          remoteUrl: page.remoteUrl,
          local: isLocalUri(page.uri),
        });
        setPdfHtml(buildPdfJsHtml(pdfSource, theme.colors.background));
      } catch (readError) {
        if (cancelled) return;

        console.log('[tzuratHadaf] failed to read local pdf, trying google viewer fallback', {
          uri: page.uri,
          remoteUrl: page.remoteUrl,
          error: readError instanceof Error ? readError.message : String(readError),
        });

        if (page.remoteUrl) {
          setPdfHtml(buildGooglePdfHtml(page.remoteUrl, theme.colors.background));
          return;
        }

        setPdfRenderError('לא ניתן להציג את קובץ ה-PDF.');
        setContentLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, theme.colors.background]);

  useEffect(() => {
    if (page?.kind === 'image') {
      setContentLoading(!isLocalUri(page.uri));
    }
  }, [page]);

  const imageHtml = useMemo(
    () =>
      page?.kind === 'image'
        ? buildZoomableHtml(page.uri, theme.colors.background)
        : null,
    [page, theme.colors.background]
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.hint}>טוען את דף הגמרא...</Text>
      </View>
    );
  }

  if (error || !page || (page.kind === 'pdf' && pdfRenderError)) {
    return (
      <View style={styles.center}>
        <Ionicons name="document-outline" size={48} color={theme.colors.textSecondary} />
        <Text style={styles.errorTitle}>לא נמצאה תמונת דף</Text>
        <Text style={styles.errorBody}>{error || pdfRenderError || 'לא ניתן לטעון את צורת הדף כרגע.'}</Text>
        <View style={styles.actions}>
          {onRetry && (
            <TouchableOpacity style={styles.primaryBtn} onPress={onRetry} activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>נסה שוב</Text>
            </TouchableOpacity>
          )}
          {onOpenSefaria && (
            <TouchableOpacity style={styles.secondaryBtn} onPress={onOpenSefaria} activeOpacity={0.8}>
              <Ionicons name="open-outline" size={16} color={theme.colors.textPrimary} />
              <Text style={styles.secondaryBtnText}>פתח בספריא</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  const webHtml = page.kind === 'pdf' ? pdfHtml : imageHtml;
  const webViewReady = page.kind === 'image' ? !!imageHtml : !!pdfHtml;

  if (!webViewReady) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.hint}>מציג את צורת הדף...</Text>
      </View>
    );
  }

  return (
    <View style={styles.viewer}>
      {contentLoading && (
        <View style={styles.imageLoader}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      )}
      <WebView
        originWhitelist={['*']}
        source={{ html: webHtml ?? '' }}
        style={styles.webview}
        scalesPageToFit
        setBuiltInZoomControls
        setDisplayZoomControls={false}
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        cacheEnabled
        mixedContentMode="always"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onLoadEnd={() => setContentLoading(false)}
        onError={(event) => {
          console.log('[tzuratHadaf] webview error', event.nativeEvent);
          setContentLoading(false);
          if (page.kind === 'pdf') {
            setPdfRenderError('לא ניתן להציג את קובץ ה-PDF.');
          }
        }}
        onMessage={(event) => {
          const data = event.nativeEvent.data;
          if (data === 'pdf-rendered') {
            console.log('[tzuratHadaf] pdf.js render complete');
            setContentLoading(false);
            return;
          }
          try {
            const parsed = JSON.parse(data) as { type?: string; message?: string };
            if (parsed.type === 'pdfError') {
              console.log('[tzuratHadaf] pdf.js render failed', parsed.message);
              if (page.kind === 'pdf' && page.remoteUrl) {
                setPdfHtml(buildGooglePdfHtml(page.remoteUrl, theme.colors.background));
                setContentLoading(true);
                return;
              }
              setPdfRenderError(parsed.message || 'לא ניתן להציג את קובץ ה-PDF.');
              setContentLoading(false);
            }
          } catch {
            // ignore non-json messages
          }
        }}
      />
      <View style={styles.zoomHint}>
        <Ionicons name="expand-outline" size={14} color={theme.colors.textMuted} />
        <Text style={styles.zoomHintText}>צבוט עם שתי אצבעות להגדלה</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    viewer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    webview: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    zoomHint: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 8,
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    zoomHintText: {
      color: theme.colors.textMuted,
      fontSize: 11,
      fontWeight: '600',
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      backgroundColor: theme.colors.background,
    },
    hint: {
      marginTop: 12,
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    errorTitle: {
      marginTop: 16,
      color: theme.colors.textPrimary,
      fontSize: 18,
      fontWeight: '900',
      textAlign: 'center',
    },
    errorBody: {
      marginTop: 8,
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
      lineHeight: 22,
    },
    actions: {
      marginTop: 24,
      gap: 10,
      width: '100%',
      maxWidth: 280,
    },
    primaryBtn: {
      backgroundColor: theme.colors.accent,
      paddingVertical: 14,
      borderRadius: 16,
      alignItems: 'center',
    },
    primaryBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },
    secondaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    secondaryBtnText: {
      color: theme.colors.textPrimary,
      fontSize: 15,
      fontWeight: '700',
    },
    imageLoader: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
      backgroundColor: theme.colors.background,
    },
  });
