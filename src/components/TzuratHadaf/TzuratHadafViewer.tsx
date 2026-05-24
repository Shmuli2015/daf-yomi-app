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
import { useTheme } from '../../theme';

interface TzuratHadafViewerProps {
  imageUrl: string | null;
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

export default function TzuratHadafViewer({
  imageUrl,
  loading,
  error,
  onOpenSefaria,
  onRetry,
}: TzuratHadafViewerProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    if (imageUrl && isLocalUri(imageUrl)) {
      setImageLoading(false);
    } else {
      setImageLoading(true);
    }
  }, [imageUrl]);

  const html = useMemo(
    () => (imageUrl ? buildZoomableHtml(imageUrl, theme.colors.background) : null),
    [imageUrl, theme.colors.background]
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
        <Text style={styles.hint}>טוען את דף הגמרא...</Text>
      </View>
    );
  }

  if (error || !imageUrl || !html) {
    return (
      <View style={styles.center}>
        <Ionicons name="document-outline" size={48} color={theme.colors.textSecondary} />
        <Text style={styles.errorTitle}>לא נמצאה תמונת דף</Text>
        <Text style={styles.errorBody}>{error || 'לא ניתן לטעון את צורת הדף כרגע.'}</Text>
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

  return (
    <View style={styles.viewer}>
      {imageLoading && (
        <View style={styles.imageLoader}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      )}
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
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onLoadEnd={() => setImageLoading(false)}
        onError={() => setImageLoading(false)}
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
