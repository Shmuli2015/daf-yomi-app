import type { DafDayStartMode } from './dafDayBoundary';
import type { ExactAlarmStatus } from './exactAlarm';
import type { NotificationPermissionStatus } from './notificationPermission';
import { matchesAnySetting, matchesSetting, type SearchableSetting } from './settingsSearch';
import {
  AUTO_UPDATE_ITEM,
  BACKUP_SEARCH_ITEMS,
  CALENDAR_ITEM,
  CHECK_UPDATE_ITEM,
  CONFETTI_ITEM,
  DAF_DAY_START_ITEM,
  DAF_DAY_START_TIME_ITEM,
  DAF_DAY_START_WEEKLY_ITEM,
  DAILY_ITEM,
  DATA_SEARCH_ITEMS,
  DEV_SEARCH_ITEMS,
  EXACT_ITEM,
  HELP_SEARCH_ITEMS,
  MODE_ITEM,
  PERMISSION_ITEM,
  READER_SEARCH_ITEMS,
  SECULAR_ITEM,
  SHARE_APP_ITEM,
  SOUND_ITEM,
  THEME_ITEM,
  TIME_ITEM,
  TRACK_ITEM,
  WHATS_NEW_ITEM,
} from './settingsSearchCatalog';

export type VisibleSettingsSearchSection =
  | 'notifications'
  | 'reader'
  | 'display'
  | 'backup_data'
  | 'help_updates'
  | 'dev';

export type VisibleSettingsSearchContext = {
  notificationsEnabled: boolean;
  notifMode: 'daily' | 'custom';
  exactAlarmStatus: ExactAlarmStatus;
  hasExactAlarmHandler: boolean;
  permissionStatus: NotificationPermissionStatus;
  dafDayStartMode: DafDayStartMode;
  hasPersonalTrack: boolean;
  hasSaveBackup: boolean;
  hasShareBackup: boolean;
  hasImportBackup: boolean;
  hasClearCache: boolean;
  hasAutoUpdate: boolean;
  hasCheckUpdate: boolean;
  hasWhatsNew: boolean;
  hasShareDownload: boolean;
  showDevSection: boolean;
};

const [SAVE_ITEM, SHARE_BACKUP_ITEM, IMPORT_ITEM] = BACKUP_SEARCH_ITEMS;
const [CACHE_ITEM, RESET_ITEM] = DATA_SEARCH_ITEMS;

function getNotificationsSearchItems(ctx: VisibleSettingsSearchContext): SearchableSetting[] {
  const items: SearchableSetting[] = [DAILY_ITEM];

  if (ctx.notificationsEnabled) {
    items.push(MODE_ITEM, SOUND_ITEM);
    if (ctx.notifMode === 'daily') items.push(TIME_ITEM);
    if (ctx.exactAlarmStatus !== 'not_required' && ctx.hasExactAlarmHandler) {
      items.push(EXACT_ITEM);
    }
  }

  if (
    ctx.permissionStatus === 'denied' ||
    (ctx.notificationsEnabled && ctx.permissionStatus !== 'granted')
  ) {
    items.push(PERMISSION_ITEM);
  }

  return items;
}

function getDisplaySearchItems(ctx: VisibleSettingsSearchContext): SearchableSetting[] {
  const items: SearchableSetting[] = [THEME_ITEM, DAF_DAY_START_ITEM];
  if (ctx.dafDayStartMode === 'custom_hour') items.push(DAF_DAY_START_TIME_ITEM);
  if (ctx.dafDayStartMode === 'weekly') items.push(DAF_DAY_START_WEEKLY_ITEM);
  items.push(SECULAR_ITEM, CALENDAR_ITEM, CONFETTI_ITEM);
  if (ctx.hasPersonalTrack) items.push(TRACK_ITEM);
  return items;
}

function getReaderSearchItems(): SearchableSetting[] {
  return [...READER_SEARCH_ITEMS];
}

function getBackupDataSearchItems(ctx: VisibleSettingsSearchContext): SearchableSetting[] {
  const items: SearchableSetting[] = [];
  if (ctx.hasSaveBackup) items.push(SAVE_ITEM);
  if (ctx.hasShareBackup) items.push(SHARE_BACKUP_ITEM);
  if (ctx.hasImportBackup) items.push(IMPORT_ITEM);
  if (ctx.hasClearCache) items.push(CACHE_ITEM);
  items.push(RESET_ITEM);
  return items;
}

function getHelpUpdatesSearchItems(ctx: VisibleSettingsSearchContext): SearchableSetting[] {
  const items: SearchableSetting[] = [...HELP_SEARCH_ITEMS];
  if (ctx.hasAutoUpdate) items.push(AUTO_UPDATE_ITEM);
  if (ctx.hasCheckUpdate) items.push(CHECK_UPDATE_ITEM);
  if (ctx.hasWhatsNew) items.push(WHATS_NEW_ITEM);
  if (ctx.hasShareDownload) items.push(SHARE_APP_ITEM);
  return items;
}

function getDevSearchItems(ctx: VisibleSettingsSearchContext): SearchableSetting[] {
  return ctx.showDevSection ? [...DEV_SEARCH_ITEMS] : [];
}

export function getVisibleSectionSearchItems(
  section: VisibleSettingsSearchSection,
  ctx: VisibleSettingsSearchContext,
): SearchableSetting[] {
  switch (section) {
    case 'notifications':
      return getNotificationsSearchItems(ctx);
    case 'reader':
      return getReaderSearchItems();
    case 'display':
      return getDisplaySearchItems(ctx);
    case 'backup_data':
      return getBackupDataSearchItems(ctx);
    case 'help_updates':
      return getHelpUpdatesSearchItems(ctx);
    case 'dev':
      return getDevSearchItems(ctx);
  }
}

export function getVisibleSettingsSearchItems(
  ctx: VisibleSettingsSearchContext,
): SearchableSetting[] {
  return [
    ...getNotificationsSearchItems(ctx),
    ...getDisplaySearchItems(ctx),
    ...getReaderSearchItems(),
    ...getBackupDataSearchItems(ctx),
    ...getHelpUpdatesSearchItems(ctx),
    ...getDevSearchItems(ctx),
  ];
}

export function hasVisibleSectionMatch(
  query: string,
  section: VisibleSettingsSearchSection,
  ctx: VisibleSettingsSearchContext,
): boolean {
  return matchesAnySetting(query, getVisibleSectionSearchItems(section, ctx));
}

export function getMatchingSectionKeys(
  query: string,
  ctx: VisibleSettingsSearchContext,
): VisibleSettingsSearchSection[] {
  const sections: VisibleSettingsSearchSection[] = [
    'notifications',
    'reader',
    'display',
    'backup_data',
    'help_updates',
    'dev',
  ];
  return sections.filter(section => hasVisibleSectionMatch(query, section, ctx));
}

export function hasVisibleSettingsMatch(
  query: string,
  ctx: VisibleSettingsSearchContext,
): boolean {
  return matchesAnySetting(query, getVisibleSettingsSearchItems(ctx));
}

export function countVisibleSettingsMatches(
  query: string,
  ctx: VisibleSettingsSearchContext,
): number {
  if (!query.trim()) return 0;
  const items = getVisibleSettingsSearchItems(ctx);
  return items.filter(item => matchesSetting(query, item)).length;
}
