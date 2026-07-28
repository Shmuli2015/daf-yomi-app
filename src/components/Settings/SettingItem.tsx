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
  isLast?: boolean;
  highlightText?: string;
}

function HighlightedText({
  text,
  highlight,
  baseStyle,
  highlightStyle,
}: {
  text: string;
  highlight?: string;
  baseStyle: any;
  highlightStyle: any;
}) {
  if (!highlight || !highlight.trim()) {
    return <Text style={baseStyle}>{text}</Text>;
  }

  const query = highlight.trim().toLowerCase();
  const lowerText = text.toLowerCase();
  const index = lowerText.indexOf(query);

  if (index === -1) {
    return <Text style={baseStyle}>{text}</Text>;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <Text style={baseStyle}>
      {before}
      <Text style={highlightStyle}>{match}</Text>
      {after}
    </Text>
  );
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
  const styles = useMemo(() => createStyles(theme), [theme]);

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

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingVertical: 15,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    left: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 14,
    },
    iconBox: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(201,150,60,0.15)',
    },
    textBlock: {
      flex: 1,
    },
    title: {
      fontSize: 15,
      fontWeight: '700',
      letterSpacing: -0.2,
    },
    description: {
      fontSize: 12.5,
      color: theme.colors.textSecondary,
      marginTop: 2,
      lineHeight: 17,
      opacity: 0.85,
    },
    highlight: {
      backgroundColor: theme.colors.accentLight,
      color: theme.colors.accent,
      fontWeight: '900',
    },
    right: {
      paddingStart: 10,
    },
    arrowRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    badge: {
      backgroundColor: theme.colors.accentLight,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(201,150,60,0.2)',
    },
    valueText: {
      fontSize: 13,
      color: theme.colors.accent,
      fontWeight: '700',
    },
  });
