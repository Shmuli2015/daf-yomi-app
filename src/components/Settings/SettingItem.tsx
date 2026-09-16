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
  onLongPress?: () => void;
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
  onLongPress,
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
  const accessibilityLabel = description ? `${title}. ${description}` : title;
  const isSwitch = type === 'switch';
  const switchValue = Boolean(value);

  return (
    <TouchableOpacity
      onPress={
        isSwitch
          ? () => onPress?.(!switchValue)
          : onPress
      }
      onLongPress={onLongPress}
      delayLongPress={350}
      disabled={!onPress && !onLongPress}
      activeOpacity={0.7}
      style={[styles.row, isLast && styles.rowLast]}
      accessibilityRole={isSwitch ? 'switch' : 'button'}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={isSwitch ? { checked: switchValue } : undefined}
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
        {isSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onPress as (next: boolean) => void}
            pointerEvents="none"
            trackColor={{ false: theme.colors.border, true: theme.colors.accentLight }}
            thumbColor={switchValue ? theme.colors.accent : theme.colors.white}
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
