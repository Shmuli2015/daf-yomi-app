import React from 'react';
import { View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import type { TzuratPageContent } from './types';
import { buildGooglePdfHtml } from './viewerHtml';
import type { ViewerStyles } from './viewerStyles';
import TzuratViewerLoading from './TzuratViewerLoading';

interface TzuratPageWebViewProps {
  page: TzuratPageContent;
  html: string;
  styles: ViewerStyles;
  backgroundColor: string;
  contentLoading: boolean;
  onContentLoadEnd: () => void;
  onPdfRenderError: (message: string) => void;
  onUseGoogleFallback: (html: string) => void;
}

function parsePdfErrorMessage(data: string): string | null {
  try {
    const parsed = JSON.parse(data) as { type?: string; message?: string };
    if (parsed.type === 'pdfError') {
      return parsed.message || 'לא ניתן להציג את קובץ ה-PDF.';
    }
  } catch {
    // ignore non-json messages
  }
  return null;
}

export default function TzuratPageWebView({
  page,
  html,
  styles,
  backgroundColor,
  contentLoading,
  onContentLoadEnd,
  onPdfRenderError,
  onUseGoogleFallback,
}: TzuratPageWebViewProps) {
  const handleMessage = (event: WebViewMessageEvent) => {
    const data = event.nativeEvent.data;
    if (data === 'pdf-rendered') {
      onContentLoadEnd();
      return;
    }

    const pdfError = parsePdfErrorMessage(data);
    if (!pdfError) return;

    if (page.kind === 'pdf' && page.remoteUrl) {
      onUseGoogleFallback(buildGooglePdfHtml(page.remoteUrl, backgroundColor));
      return;
    }
    onPdfRenderError(pdfError);
  };

  return (
    <View style={styles.webview}>
      {contentLoading && <TzuratViewerLoading styles={styles} compact />}
      <WebView
        originWhitelist={['*']}
        source={{ html }}
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
        onLoadEnd={() => {
          if (page.kind === 'image') {
            onContentLoadEnd();
          }
        }}
        onError={() => {
          onContentLoadEnd();
          if (page.kind === 'pdf') {
            onPdfRenderError('לא ניתן להציג את קובץ ה-PDF.');
          }
        }}
        onMessage={handleMessage}
      />
    </View>
  );
}
