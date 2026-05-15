import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Constants from 'expo-constants';
import { THEME } from '../../theme';

type Props = {
  /** __DEV__ only — long-press version row to preview the app-update modal */
  onVersionLongPress?: () => void;
};

export function SettingsFooter({ onVersionLongPress }: Props) {
  const version = Constants.expoConfig?.version;

  return (
    <View style={styles.footer}>
      <View style={styles.divider} />
      <Text style={styles.text}>פותח באהבה ע״י שמואל רוזנברג</Text>
      <Text style={styles.text}>בהשראת AG</Text>
      {version ? (
        <Pressable
          onLongPress={onVersionLongPress}
          delayLongPress={550}
          disabled={!onVersionLongPress}
        >
          <Text style={styles.version}>גרסה {version}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    marginTop: 48,
    alignItems: 'center',
    gap: 12,
  },
  divider: {
    width: 40,
    height: 1,
    backgroundColor: THEME.colors.border,
    marginBottom: 4,
  },
  text: {
    color: THEME.colors.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  version: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    marginTop: 4,
    opacity: 0.6,
  },
});
