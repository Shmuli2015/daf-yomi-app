import React, { useMemo } from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

export interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  value?: string | boolean;
  onPress?: (value?: any) => void;
  type?: 'switch' | 'arrow' | 'none';
  isDestructive?: boolean;
}

export const SettingItem = React.memo(function SettingItem({
  icon,
  title,
  description,
  value,
  onPress,
  type = 'arrow',
  isDestructive = false,
}: SettingItemProps) {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const iconBg = isDestructive ? theme.colors.dangerLight : theme.colors.accentLight;
  const iconColor = isDestructive ? theme.colors.danger : theme.colors.accent;
  const titleColor = isDestructive ? theme.colors.danger : theme.colors.textPrimary;

  return (
    <TouchableOpacity
      onPress={type === 'switch' ? undefined : onPress}
      disabled={type === 'switch'}
      activeOpacity={0.7}
      style={styles.row}
    >
      <View style={styles.left}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={19} color={iconColor} />
        </View>
        <View style={styles.textBlock}>
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
        </View>
      </View>

      <View style={styles.right}>
        {type === 'switch' ? (
          <Switch
            value={value as boolean}
            onValueChange={onPress as any}
            trackColor={{ false: theme.colors.border, true: 'rgba(201,150,60,0.35)' }}
            thumbColor={value ? theme.colors.accent : '#FFFFFF'}
            ios_backgroundColor={theme.colors.border}
          />
        ) : type === 'arrow' ? (
          <View style={styles.arrowRow}>
            {value !== undefined && value !== false && (
              <Text style={styles.valueText} numberOfLines={1}>
                {value as string}
              </Text>
            )}
            <Ionicons name="chevron-back" size={16} color={theme.colors.border} />
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
});

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 16,
    },
    iconBox: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textBlock: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '700',
      letterSpacing: -0.3,
    },
    description: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 2,
      lineHeight: 18,
      opacity: 0.8,
    },
    right: {
      paddingStart: 12,
    },
    arrowRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    valueText: {
      fontSize: 15,
      color: theme.colors.accent,
      fontWeight: '700',
    },
  });
