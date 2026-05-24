import { useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import type { TzuratPageContent } from './types';
import { buildGooglePdfHtml, buildPdfJsHtml, isLocalUri } from './viewerHtml';

interface UsePdfViewerHtmlResult {
  pdfHtml: string | null;
  pdfRenderError: string | null;
  setPdfHtml: (html: string | null) => void;
  setPdfRenderError: (error: string | null) => void;
}

export function usePdfViewerHtml(
  page: TzuratPageContent | null,
  backgroundColor: string,
  onPrepareStart: () => void,
  onPrepareFailed: () => void
): UsePdfViewerHtmlResult {
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
      onPrepareStart();
      setPdfRenderError(null);
      setPdfHtml(null);

      try {
        let pdfSource = page.uri;
        if (isLocalUri(page.uri)) {
          const base64 = await FileSystem.readAsStringAsync(page.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          pdfSource = `data:application/pdf;base64,${base64}`;
        }

        if (cancelled) return;

        setPdfHtml(buildPdfJsHtml(pdfSource, backgroundColor));
      } catch (readError) {
        if (cancelled) return;

        if (page.remoteUrl) {
          setPdfHtml(buildGooglePdfHtml(page.remoteUrl, backgroundColor));
          return;
        }

        setPdfRenderError('לא ניתן להציג את קובץ ה-PDF.');
        onPrepareFailed();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, backgroundColor, onPrepareStart, onPrepareFailed]);

  return { pdfHtml, pdfRenderError, setPdfHtml, setPdfRenderError };
}
