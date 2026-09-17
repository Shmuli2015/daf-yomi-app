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
  const dafIconSize = isLandscape ? 20 : 24;
  const amudIconSize = isLandscape ? 16 : 18;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + (isLandscape ? 6 : 12) }]}>
      <View style={styles.row}>
        <TzuratNavButton
          accessibilityLabel="דף קודם"
          icon="play-skip-forward"
          iconSize={dafIconSize}
          disabled={!canPrevDaf}
          onPress={onPrevDaf}
          styles={styles}
          theme={theme}
          iconOnly
        />
        <TzuratNavButton
          label="עמוד קודם"
          accessibilityLabel="עמוד קודם"
          icon="chevron-forward"
          iconSize={amudIconSize}
          disabled={!canPrevAmud}
          onPress={onPrevAmud}
          styles={styles}
          theme={theme}
        />
        <TzuratNavButton
          label="עמוד הבא"
          accessibilityLabel="עמוד הבא"
          icon="chevron-back"
          iconSize={amudIconSize}
          disabled={!canNextAmud}
          onPress={onNextAmud}
          styles={styles}
          theme={theme}
        />
        <TzuratNavButton
          accessibilityLabel="דף הבא"
          icon="play-skip-back"
          iconSize={dafIconSize}
          disabled={!canNextDaf}
          onPress={onNextDaf}
          styles={styles}
          theme={theme}
          iconOnly
        />
      </View>
    </View>
  );
}
