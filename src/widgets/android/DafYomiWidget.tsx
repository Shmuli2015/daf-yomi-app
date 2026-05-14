import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { ColorProp } from 'react-native-android-widget';
import { DARK_THEME, LIGHT_THEME, type ThemeScheme } from '../../theme';

const cv = (color: string): ColorProp => color as ColorProp;

export interface DafYomiWidgetProps {
  masechet: string;
  daf: string;
  isLearned: boolean;
  streak: number;
  themeScheme: ThemeScheme;
}

export function DafYomiWidget({
  masechet,
  daf,
  isLearned,
  streak,
  themeScheme,
}: DafYomiWidgetProps) {
  const theme = themeScheme === 'dark' ? DARK_THEME : LIGHT_THEME;
  const c = theme.colors;
  const btnLabel = isLearned ? '✓ למדתי היום' : 'סמן למדתי';

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        backgroundColor: cv(c.background),
        padding: 6,
      }}
    >
      <FlexWidget
        style={{
          flex: 1,
          width: 'match_parent',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          backgroundGradient: {
            orientation: 'TOP_BOTTOM',
            from: cv(c.accentLight),
            to: cv(c.surface),
          },
          borderRadius: theme.radius.lg,
          borderWidth: 1,
          borderColor: cv(c.accentBorder),
          paddingTop: 12,
          paddingBottom: 14,
          paddingHorizontal: 14,
          overflow: 'hidden',
        }}
      >
        <FlexWidget
          style={{
            flexDirection: 'row',
            width: 'match_parent',
            justifyContent: 'flex-end',
            marginBottom: 10,
          }}
        >
          <FlexWidget
            style={{
              height: 3,
              width: 40,
              backgroundColor: cv(c.accent),
              borderRadius: 2,
            }}
          />
        </FlexWidget>

        <TextWidget
          text="מסע דף · להיום"
          style={{
            width: 'match_parent',
            fontSize: 10,
            fontWeight: '800',
            letterSpacing: 0.8,
            color: cv(c.accent),
            fontFamily: 'sans-serif-medium',
            textAlign: 'right',
            marginBottom: 2,
          }}
        />

        <TextWidget
          text={masechet}
          truncate="END"
          maxLines={2}
          style={{
            width: 'match_parent',
            fontSize: 18,
            fontWeight: '800',
            color: cv(c.textPrimary),
            fontFamily: 'sans-serif-medium',
            textAlign: 'right',
          }}
        />

        <TextWidget
          text={daf}
          style={{
            width: 'match_parent',
            fontSize: 13,
            fontWeight: '600',
            color: cv(c.textSecondary),
            fontFamily: 'sans-serif',
            textAlign: 'right',
            marginTop: 4,
          }}
        />

        <FlexWidget
          style={{
            height: 1,
            width: 'match_parent',
            backgroundColor: cv(c.border),
            marginTop: 12,
            marginBottom: 12,
          }}
        />

        <FlexWidget
          clickAction="MARK_LEARNED"
          style={{
            backgroundColor: isLearned ? cv(c.success) : cv(c.accent),
            borderRadius: theme.radius.sm,
            paddingVertical: 11,
            paddingHorizontal: 12,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: 'match_parent',
          }}
        >
          <TextWidget
            text={btnLabel}
            style={{
              fontSize: 14,
              fontWeight: '800',
              color: cv('#FFFFFF'),
              fontFamily: 'sans-serif-medium',
              textAlign: 'center',
            }}
          />
        </FlexWidget>

        {streak > 1 && (
          <>
            <FlexWidget style={{ height: 10 }} />
            <TextWidget
              text={`רצף לימוד · ${streak} ימים`}
              style={{
                width: 'match_parent',
                fontSize: 11,
                fontWeight: '600',
                color: cv(c.textMuted),
                fontFamily: 'sans-serif',
                textAlign: 'center',
              }}
            />
          </>
        )}
      </FlexWidget>
    </FlexWidget>
  );
}
