import React, { useMemo, useState } from 'react';
import { Image, Linking, Text, TouchableOpacity } from 'react-native';
import { DARK_THEME, useTheme } from '../../theme';
import {
  SEFARIA_BADGE_DARK_URL,
  SEFARIA_BADGE_FALLBACK_TEXT,
  SEFARIA_BADGE_LIGHT_URL,
  SEFARIA_URL,
} from '../../data/contentLicenses';
import { createPoweredBySefariaBadgeStyles } from './PoweredBySefariaBadge.styles';

export function PoweredBySefariaBadge() {
  const theme = useTheme();
  const styles = useMemo(() => createPoweredBySefariaBadgeStyles(theme), [theme]);
  const [imageFailed, setImageFailed] = useState(false);

  const isDark = theme.colors.background === DARK_THEME.colors.background;
  const badgeUri = isDark ? SEFARIA_BADGE_DARK_URL : SEFARIA_BADGE_LIGHT_URL;

  const openSefaria = async () => {
    try {
      await Linking.openURL(SEFARIA_URL);
    } catch {
      return;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={openSefaria}
      activeOpacity={0.75}
      accessibilityRole="link"
      accessibilityLabel={SEFARIA_BADGE_FALLBACK_TEXT}
    >
      {imageFailed ? (
        <Text style={styles.fallbackText}>{SEFARIA_BADGE_FALLBACK_TEXT}</Text>
      ) : (
        <Image
          source={{ uri: badgeUri }}
          style={styles.badgeImage}
          resizeMode="contain"
          onError={() => setImageFailed(true)}
          accessibilityIgnoresInvertColors
        />
      )}
    </TouchableOpacity>
  );
}

export default PoweredBySefariaBadge;
