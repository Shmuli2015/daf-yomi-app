import React, { useMemo } from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import HighlightedText from './HighlightedText';
import { createSettingItemStyles } from './SettingItem.styles';

export interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  value?: string | boolean;
  onPress?: (value?: any) => void;
  type?: 'switch' | 'arrow' | 'none';
  isDestructive?: boolean;
  isLast?: boolean;
  highlightText?: string;
}

export const SettingItem = React.memo(function SettingItem({
  icon,
  title,
  description,
  value,
  onPress,
  type = 'arrow',
  isDestructive = false,
  isLast = false,
  highlightText,
}: SettingItemProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSettingItemStyles(theme), [theme]);

  const iconBg = isDestructive ? theme.colors.dangerLight : theme.colors.accentLight;
  const iconColor = isDestructive ? theme.colors.danger : theme.colors.accent;
  const titleColor = isDestructive ? theme.colors.danger : theme.colors.textPrimary;

  return (
    <TouchableOpacity
      onPress={type === 'switch' ? undefined : onPress}
      disabled={type === 'switch'}
      activeOpacity={0.7}
      style={[styles.row, isLast && styles.rowLast]}
    >
      <View style={styles.left}>
        <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={19} color={iconColor} />
        </View>
        <View style={styles.textBlock}>
          <HighlightedText
            text={title}
            highlight={highlightText}
            baseStyle={[styles.title, { color: titleColor }]}
            highlightStyle={styles.highlight}
          />
          {description ? (
            <HighlightedText
              text={description}
              highlight={highlightText}
              baseStyle={styles.description}
              highlightStyle={styles.highlight}
            />
          ) : null}
        </View>
      </View>

      <View style={styles.right}>
        {type === 'switch' ? (
          <Switch
            value={value as boolean}
            onValueChange={onPress as any}
            trackColor={{ false: theme.colors.border, true: theme.colors.accentLight }}
            thumbColor={value ? theme.colors.accent : '#FFFFFF'}
            ios_backgroundColor={theme.colors.border}
          />
        ) : type === 'arrow' ? (
          <View style={styles.arrowRow}>
            {value !== undefined && value !== false && (
              <View style={styles.badge}>
                <Text style={styles.valueText} numberOfLines={1}>
                  {value as string}
                </Text>
              </View>
            )}
            <Ionicons name="chevron-back" size={16} color={theme.colors.textMuted} />
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
});

export default SettingItem;
