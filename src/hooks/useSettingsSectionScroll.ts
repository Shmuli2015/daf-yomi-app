import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { ScrollViewInstance } from 'react-native';
import {
  scrollTo,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import type { AccordionCollapseScroll } from './useAccordionSlide';
import type { SettingsSectionKey } from './useSettingsAccordion';

export const SETTINGS_SECTION_ORDER: SettingsSectionKey[] = [
  'notifications',
  'reader',
  'display',
  'offline',
  'backup_data',
  'help_updates',
];

const SCROLL_GUARD_MS = 360;
const SCROLL_JUMP_THRESHOLD = 48;

export function settingsSectionIndex(section: SettingsSectionKey) {
  return SETTINGS_SECTION_ORDER.indexOf(section);
}

interface UseSettingsSectionScrollOptions {
  isSearching: boolean;
  offlineStaysOpen: boolean;
}

export function useSettingsSectionScroll({
  isSearching,
  offlineStaysOpen,
}: UseSettingsSectionScrollOptions) {
  const scrollRef = useAnimatedRef<ScrollViewInstance>();
  const scrollY = useSharedValue(0);
  const active = useSharedValue(0);
  const index = useSharedValue(-1);
  const startHeight = useSharedValue(-1);
  const initialNextY = useSharedValue(0);
  const startScrollY = useSharedValue(0);
  const pinnedScrollY = useSharedValue(0);
  const guardActive = useSharedValue(0);
  const guardScrollY = useSharedValue(0);
  const guardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearGuardTimer = useCallback(() => {
    if (guardTimerRef.current) {
      clearTimeout(guardTimerRef.current);
      guardTimerRef.current = null;
    }
  }, []);

  useEffect(() => clearGuardTimer, [clearGuardTimer]);

  const onCollapseEnd = useCallback(() => {
    guardActive.value = 0;
  }, [guardActive]);

  const collapseScroll: AccordionCollapseScroll = useMemo(
    () => ({
      scrollViewRef: scrollRef,
      active,
      index,
      startHeight,
      initialNextY,
      startScrollY,
      pinnedScrollY,
      onEnd: onCollapseEnd,
    }),
    [scrollRef, active, index, startHeight, initialNextY, startScrollY, pinnedScrollY, onCollapseEnd],
  );

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y;
      if (active.value === 1) {
        const expected = pinnedScrollY.value;
        if (y + 1 < expected) {
          scrollTo(scrollRef, 0, expected, false);
          scrollY.value = expected;
          return;
        }
        scrollY.value = y;
        return;
      }
      if (
        guardActive.value === 1 &&
        guardScrollY.value > SCROLL_JUMP_THRESHOLD &&
        y < guardScrollY.value - SCROLL_JUMP_THRESHOLD
      ) {
        scrollTo(scrollRef, 0, guardScrollY.value, false);
        scrollY.value = guardScrollY.value;
        return;
      }
      scrollY.value = y;
    },
  });

  const holdScroll = useCallback(() => {
    const y = scrollY.value;
    guardScrollY.value = y;
    guardActive.value = 1;
    clearGuardTimer();
    guardTimerRef.current = setTimeout(() => {
      guardActive.value = 0;
    }, SCROLL_GUARD_MS);
  }, [clearGuardTimer, guardActive, guardScrollY, scrollY]);

  const armCollapse = useCallback(
    (closing: SettingsSectionKey) => {
      const y = scrollY.value;
      clearGuardTimer();
      guardActive.value = 0;
      startHeight.value = -1;
      initialNextY.value = y;
      startScrollY.value = y;
      pinnedScrollY.value = y;
      index.value = settingsSectionIndex(closing);
      active.value = 1;
    },
    [
      active,
      clearGuardTimer,
      guardActive,
      index,
      initialNextY,
      pinnedScrollY,
      scrollY,
      startHeight,
      startScrollY,
    ],
  );

  const prepareSectionChange = useCallback(
    (current: SettingsSectionKey | null, next: SettingsSectionKey) => {
      const closingStaysOpen = current === 'offline' && offlineStaysOpen;
      const willCollapse = current != null && current !== next && !isSearching && !closingStaysOpen;
      if (willCollapse && settingsSectionIndex(current) < settingsSectionIndex(next)) {
        armCollapse(current);
        return;
      }
      holdScroll();
    },
    [armCollapse, holdScroll, isSearching, offlineStaysOpen],
  );

  return {
    scrollRef,
    onScroll,
    collapseScroll,
    prepareSectionChange,
  };
}
