import React, { useMemo } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import TzuratNavButton from './TzuratNavButton';
import { createTzuratNavigationStyles } from './TzuratNavigationBar.styles';

interface TzuratNavigationBarProps {
  isLandscape?: boolean;
  canPrevAmud: boolean;
  canNextAmud: boolean;
  canPrevDaf: boolean;
  canNextDaf: boolean;
  onPrevAmud: () => void;
  onNextAmud: () => void;
  onPrevDaf: () => void;
  onNextDaf: () => void;
}

export default function TzuratNavigationBar({
  isLandscape = false,
  canPrevAmud,
  canNextAmud,
  canPrevDaf,
  canNextDaf,
  onPrevAmud,
  onNextAmud,
  onPrevDaf,
  onNextDaf,
}: TzuratNavigationBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createTzuratNavigationStyles(theme, isLandscape), [theme, isLandscape]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + (isLandscape ? 6 : 12) }]}>
      <TzuratNavButton
        label="דף קודם"
        icon="chevron-forward"
        disabled={!canPrevDaf}
        onPress={onPrevDaf}
        styles={styles}
        theme={theme}
      />
      <TzuratNavButton
        label="עמוד קודם"
        icon="chevron-forward"
        disabled={!canPrevAmud}
        onPress={onPrevAmud}
        styles={styles}
        theme={theme}
        compact
      />
      <TzuratNavButton
        label="עמוד הבא"
        icon="chevron-back"
        disabled={!canNextAmud}
        onPress={onNextAmud}
        styles={styles}
        theme={theme}
        compact
      />
      <TzuratNavButton
        label="דף הבא"
        icon="chevron-back"
        disabled={!canNextDaf}
        onPress={onNextDaf}
        styles={styles}
        theme={theme}
      />
    </View>
  );
}
