import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../theme';
import { SectionHeader } from '../SectionHeader';
import { SettingItem } from '../SettingItem';
import type { SettingsSectionChrome } from '../settingsSection.types';
import { isLastVisible, matchesSetting } from '../../../utils/settingsSearch';
import {
  CACHE_ITEM,
  OFFLINE_PREFETCH_ITEM,
  OFFLINE_SEARCH_ITEMS,
} from '../../../utils/settingsSearchCatalog';
import type { OfflinePrefetchProgress, OfflinePrefetchStatus } from '../../../services/offlinePrefetch';
import type { OfflineMasechetTarget } from '../../../hooks/useOfflinePrefetch';
import OfflineMasechetPickerModal from '../Modals/OfflineMasechetPickerModal';
import { createSettingsOfflineSectionStyles } from './SettingsOfflineSection.styles';

type SettingsOfflineSectionProps = SettingsSectionChrome & {
  dayCount: number;
  daysStatus: OfflinePrefetchStatus | null;
  dafYomiMasechet: OfflineMasechetTarget | null;
  personalMasechet: OfflineMasechetTarget | null;
  isPrefetching: boolean;
  prefetchProgress: OfflinePrefetchProgress | null;
  activeTargetLabel: string | null;
  storageSizeFormatted?: string;
  onDownloadDays: () => void;
  onDownloadMasechet: (masechetEn: string, masechetHe: string) => void;
  onCancelDownload: () => void;
  onClearCacheOpen?: () => void;
};

export { OFFLINE_SEARCH_ITEMS };

function actionValue(status: OfflinePrefetchStatus | null): string {
  if (status?.ready) return 'הורד שוב';
  if (status?.label === 'חלקי') return 'המשך';
  return 'הורד';
}

export default function SettingsOfflineSection({
  styles: screenStyles,
  searchQuery,
  isFirst,
  embedded,
  dayCount,
  daysStatus,
  dafYomiMasechet,
  personalMasechet,
  isPrefetching,
  prefetchProgress,
  activeTargetLabel,
  storageSizeFormatted = '0 B',
  onDownloadDays,
  onDownloadMasechet,
  onCancelDownload,
  onClearCacheOpen,
}: SettingsOfflineSectionProps) {
  const theme = useTheme();
  const styles = useMemo(() => createSettingsOfflineSectionStyles(theme), [theme]);
  const [showPickerModal, setShowPickerModal] = useState(false);

  const cacheDescription = `מחיקת טקסטים שהורדו (${storageSizeFormatted}). אינו מוחק סימוני לימוד`;
  const showPrefetch = matchesSetting(searchQuery, OFFLINE_PREFETCH_ITEM);
  const showCache =
    onClearCacheOpen != null &&
    matchesSetting(searchQuery, { ...CACHE_ITEM, description: cacheDescription });

  if (!showPrefetch && !showCache) return null;

  const progressRatio =
    prefetchProgress && prefetchProgress.total > 0
      ? Math.min(1, prefetchProgress.completed / prefetchProgress.total)
      : 0;
  const progressLabel =
    prefetchProgress && prefetchProgress.total > 0
      ? `${prefetchProgress.completed} מתוך ${prefetchProgress.total}`
      : 'מתחילים...';

  const showPersonal = showPrefetch && personalMasechet != null;
  const showDafYomi = showPrefetch && dafYomiMasechet != null;
  const showPickerRow = showPrefetch;
  const visibilityFlags = [
    showPrefetch,
    showDafYomi,
    showPersonal,
    showPickerRow,
    showCache,
  ];

  return (
    <>
      {!embedded ? (
        <SectionHeader title="לימוד ללא רשת" icon="cloud-download-outline" isFirst={isFirst} />
      ) : null}
      <View style={embedded ? screenStyles.embeddedCard : screenStyles.card}>
        {showPrefetch && isPrefetching ? (
          <View style={styles.progressWrap}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressMessage} numberOfLines={2}>
                {activeTargetLabel
                  ? `מורידים את ${activeTargetLabel}`
                  : 'מורידים למכשיר'}
              </Text>
              <TouchableOpacity
                onPress={onCancelDownload}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="עצור הורדה"
                hitSlop={8}
              >
                <Text style={styles.stopText}>עצור</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
            </View>
            <Text style={styles.progressLabel}>{progressLabel}</Text>
          </View>
        ) : null}

        {showPrefetch ? (
          <SettingItem
            icon="calendar-outline"
            title={`${dayCount} ימים קרובים`}
            description="דפי הדף היומי לשבוע הקרוב"
            value={actionValue(daysStatus)}
            onPress={isPrefetching ? undefined : onDownloadDays}
            isLast={isLastVisible(visibilityFlags, 0)}
            highlightText={searchQuery}
          />
        ) : null}

        {showDafYomi && dafYomiMasechet ? (
          <SettingItem
            icon="book-outline"
            title={`מסכת ${dafYomiMasechet.masechetHe}`}
            description="כל עמודי מסכת הדף היומי הנוכחית"
            value={actionValue(dafYomiMasechet.status)}
            onPress={
              isPrefetching
                ? undefined
                : () =>
                    onDownloadMasechet(
                      dafYomiMasechet.masechetEn,
                      dafYomiMasechet.masechetHe,
                    )
            }
            isLast={isLastVisible(visibilityFlags, 1)}
            highlightText={searchQuery}
          />
        ) : null}

        {showPersonal && personalMasechet ? (
          <SettingItem
            icon="bookmark-outline"
            title={`מסלול אישי · ${personalMasechet.masechetHe}`}
            description="כל עמודי המסכת הפעילה במסלול האישי"
            value={actionValue(personalMasechet.status)}
            onPress={
              isPrefetching
                ? undefined
                : () =>
                    onDownloadMasechet(
                      personalMasechet.masechetEn,
                      personalMasechet.masechetHe,
                    )
            }
            isLast={isLastVisible(visibilityFlags, 2)}
            highlightText={searchQuery}
          />
        ) : null}

        {showPickerRow ? (
          <SettingItem
            icon="library-outline"
            title="בחר מסכת מהש״ס"
            description="הורדת מסכת שלמה לבחירה"
            onPress={isPrefetching ? undefined : () => setShowPickerModal(true)}
            isLast={isLastVisible(visibilityFlags, 3)}
            highlightText={searchQuery}
          />
        ) : null}

        {showCache && onClearCacheOpen ? (
          <SettingItem
            icon="folder-open-outline"
            title={CACHE_ITEM.title}
            description={cacheDescription}
            isDestructive
            onPress={isPrefetching ? undefined : onClearCacheOpen}
            isLast={isLastVisible(visibilityFlags, 4)}
            highlightText={searchQuery}
          />
        ) : null}
      </View>

      <OfflineMasechetPickerModal
        visible={showPickerModal}
        initialMasechetEn={dafYomiMasechet?.masechetEn}
        onClose={() => setShowPickerModal(false)}
        onDownload={onDownloadMasechet}
      />
    </>
  );
}
