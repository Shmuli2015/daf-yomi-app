import { StyleSheet, Platform } from 'react-native';
import type { Theme } from '../../theme';

export function createSegmentCardStyles(theme: Theme) {
  const textAlignment = Platform.OS === 'web' ? 'right' : 'left';

  return StyleSheet.create({
    card: {
      paddingVertical: 6,
      paddingHorizontal: 2,
      backgroundColor: 'transparent',
      alignItems: 'stretch',
      alignSelf: 'stretch',
      width: '100%',
    },
    cardMain: {
      gap: 6,
      alignItems: 'stretch',
    },
    cardExpanded: {},
    mishnahLabel: {
      fontSize: 16,
      fontWeight: '800',
      textAlign: textAlignment,
      writingDirection: 'rtl',
      alignSelf: 'stretch',
      width: '100%',
      marginBottom: 2,
    },
    text: {
      textAlign: textAlignment,
      writingDirection: 'rtl',
      alignSelf: 'stretch',
      width: '100%',
    },
    commentaryBadgeRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginTop: 4,
    },
    commBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: theme.radius.sm,
      gap: 5,
    },
    commBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      textAlign: textAlignment,
      writingDirection: 'rtl',
    },
    chevronIcon: {
      opacity: 0.8,
      marginRight: -2,
    },
  });
}
