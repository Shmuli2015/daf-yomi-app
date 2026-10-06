import { addDays } from 'date-fns';

import { getChavrutaSource } from '../data/chavrutaSources';
import {
  getDafDayDate,
  type DafDayBoundarySettings,
} from '../utils/dafDayBoundary';
import { getDafByDate } from '../utils/dafYomi';
import {
  normalizeMasechetEn,
  type Amud,
  type DafLocation,
} from '../utils/dafNavigation';
import { getMasechetDafim, isAmudAvailable } from '../utils/shas';
import { fetchChavrutaAmud, hasCachedChavrutaMasechet } from './chavrutaApi';
import { fetchSefariaPageText, hasCachedSefariaPageText } from './sefariaTextApi';

export const OFFLINE_PREFETCH_DAY_COUNT = 7;
const DEFAULT_CONCURRENCY = 2;

export type OfflinePrefetchProgress = {
  completed: number;
  total: number;
};

export type OfflinePrefetchStatus = {
  ready: boolean;
  cachedCount: number;
  totalCount: number;
  label: string | null;
};

export type OfflinePrefetchResult = {
  successCount: number;
  failureCount: number;
  cancelled: boolean;
  total: number;
};

export type OfflinePrefetchOptions = {
  dayCount?: number;
  gemaraNikud?: boolean;
  now?: Date;
  dafDaySettings?: DafDayBoundarySettings;
  onProgress?: (progress: OfflinePrefetchProgress) => void;
  shouldCancel?: () => boolean;
  concurrency?: number;
};

function locationKey(loc: DafLocation): string {
  return `${normalizeMasechetEn(loc.masechetEn)}|${loc.dafNum}|${loc.amud}`;
}

function statusFromCounts(cachedCount: number, totalCount: number): OfflinePrefetchStatus {
  if (totalCount === 0) {
    return { ready: false, cachedCount: 0, totalCount: 0, label: null };
  }
  const ready = cachedCount === totalCount;
  return {
    ready,
    cachedCount,
    totalCount,
    label: ready ? 'הורד' : cachedCount > 0 ? 'חלקי' : null,
  };
}

export function buildOfflinePrefetchAmudTargets(
  now: Date,
  settings: DafDayBoundarySettings = {},
  dayCount: number = OFFLINE_PREFETCH_DAY_COUNT,
): DafLocation[] {
  const safeDayCount = Math.max(1, Math.min(30, Math.round(dayCount)));
  const start = getDafDayDate(now, settings);
  const targets: DafLocation[] = [];
  const seen = new Set<string>();

  for (let offset = 0; offset < safeDayCount; offset += 1) {
    const day = getDafByDate(addDays(start, offset));
    const masechetEn = normalizeMasechetEn(day.masechetEn);
    const amudim: Amud[] = ['a', 'b'];
    for (const amud of amudim) {
      if (!isAmudAvailable(masechetEn, day.dafNum, amud)) {
        continue;
      }
      const loc: DafLocation = { masechetEn, dafNum: day.dafNum, amud };
      const key = locationKey(loc);
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      targets.push(loc);
    }
  }

  return targets;
}

export function buildMasechetAmudTargets(masechetEn: string): DafLocation[] {
  const normalized = normalizeMasechetEn(masechetEn);
  const dafim = getMasechetDafim(normalized);
  const targets: DafLocation[] = [];
  const amudim: Amud[] = ['a', 'b'];

  for (const dafNum of dafim) {
    for (const amud of amudim) {
      if (!isAmudAvailable(normalized, dafNum, amud)) {
        continue;
      }
      targets.push({ masechetEn: normalized, dafNum, amud });
    }
  }

  return targets;
}

export function buildOfflinePrefetchChavrutaTargets(targets: DafLocation[]): DafLocation[] {
  const chavrutaTargets: DafLocation[] = [];
  const seen = new Set<string>();
  for (const target of targets) {
    const masechetEn = normalizeMasechetEn(target.masechetEn);
    if (seen.has(masechetEn) || !getChavrutaSource(masechetEn)) {
      continue;
    }
    seen.add(masechetEn);
    chavrutaTargets.push({ ...target, masechetEn });
  }
  return chavrutaTargets;
}

async function runPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
  onItemSettled?: () => void,
  shouldCancel?: () => boolean,
): Promise<{ successCount: number; failureCount: number; cancelled: boolean }> {
  let index = 0;
  let successCount = 0;
  let failureCount = 0;
  let cancelled = false;

  const runners = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (index < items.length) {
      if (shouldCancel?.()) {
        cancelled = true;
        return;
      }
      const current = index;
      index += 1;
      const item = items[current];
      try {
        await worker(item);
        successCount += 1;
      } catch {
        failureCount += 1;
      } finally {
        onItemSettled?.();
      }
    }
  });

  await Promise.all(runners);
  if (shouldCancel?.()) {
    cancelled = true;
  }
  return { successCount, failureCount, cancelled };
}

async function getStatusForTargets(
  amudTargets: DafLocation[],
  gemaraNikud: boolean,
): Promise<OfflinePrefetchStatus> {
  const chavrutaTargets = buildOfflinePrefetchChavrutaTargets(amudTargets);
  const totalCount = amudTargets.length + chavrutaTargets.length;
  if (totalCount === 0) {
    return statusFromCounts(0, 0);
  }

  const amudFlags = await Promise.all(
    amudTargets.map((loc) =>
      hasCachedSefariaPageText(loc.masechetEn, loc.dafNum, loc.amud, gemaraNikud),
    ),
  );
  const chavrutaFlags = await Promise.all(
    chavrutaTargets.map((loc) => hasCachedChavrutaMasechet(loc.masechetEn)),
  );

  const cachedCount =
    amudFlags.filter(Boolean).length + chavrutaFlags.filter(Boolean).length;
  return statusFromCounts(cachedCount, totalCount);
}

async function runPrefetchForTargets(
  amudTargets: DafLocation[],
  options: OfflinePrefetchOptions = {},
): Promise<OfflinePrefetchResult> {
  const gemaraNikud = options.gemaraNikud !== false;
  const concurrency = options.concurrency ?? DEFAULT_CONCURRENCY;
  const chavrutaTargets = buildOfflinePrefetchChavrutaTargets(amudTargets);
  const total = amudTargets.length + chavrutaTargets.length;

  if (total === 0) {
    return { successCount: 0, failureCount: 0, cancelled: false, total: 0 };
  }

  let completed = 0;
  const markSettled = () => {
    completed += 1;
    options.onProgress?.({ completed, total });
  };
  options.onProgress?.({ completed, total });

  if (options.shouldCancel?.()) {
    return { successCount: 0, failureCount: 0, cancelled: true, total };
  }

  const sefariaResult = await runPool(
    amudTargets,
    concurrency,
    async (loc) => {
      await fetchSefariaPageText(loc.masechetEn, loc.dafNum, loc.amud, gemaraNikud);
    },
    markSettled,
    options.shouldCancel,
  );

  if (sefariaResult.cancelled || options.shouldCancel?.()) {
    return {
      successCount: sefariaResult.successCount,
      failureCount: sefariaResult.failureCount,
      cancelled: true,
      total,
    };
  }

  const chavrutaResult = await runPool(
    chavrutaTargets,
    1,
    async (loc) => {
      await fetchChavrutaAmud(loc.masechetEn, loc.dafNum, loc.amud);
    },
    markSettled,
    options.shouldCancel,
  );

  return {
    successCount: sefariaResult.successCount + chavrutaResult.successCount,
    failureCount: sefariaResult.failureCount + chavrutaResult.failureCount,
    cancelled: chavrutaResult.cancelled,
    total,
  };
}

export async function getOfflinePrefetchStatus(
  options: Pick<OfflinePrefetchOptions, 'dayCount' | 'gemaraNikud' | 'now' | 'dafDaySettings'> = {},
): Promise<OfflinePrefetchStatus> {
  const dayCount = options.dayCount ?? OFFLINE_PREFETCH_DAY_COUNT;
  const gemaraNikud = options.gemaraNikud !== false;
  const now = options.now ?? new Date();
  const settings = options.dafDaySettings ?? {};
  const amudTargets = buildOfflinePrefetchAmudTargets(now, settings, dayCount);
  return getStatusForTargets(amudTargets, gemaraNikud);
}

export async function getOfflineMasechetStatus(
  masechetEn: string,
  options: Pick<OfflinePrefetchOptions, 'gemaraNikud'> = {},
): Promise<OfflinePrefetchStatus> {
  const gemaraNikud = options.gemaraNikud !== false;
  const amudTargets = buildMasechetAmudTargets(masechetEn);
  return getStatusForTargets(amudTargets, gemaraNikud);
}

export async function prefetchOfflineDays(
  options: OfflinePrefetchOptions = {},
): Promise<OfflinePrefetchResult> {
  const dayCount = options.dayCount ?? OFFLINE_PREFETCH_DAY_COUNT;
  const now = options.now ?? new Date();
  const settings = options.dafDaySettings ?? {};
  const amudTargets = buildOfflinePrefetchAmudTargets(now, settings, dayCount);
  return runPrefetchForTargets(amudTargets, options);
}

export async function prefetchOfflineMasechet(
  masechetEn: string,
  options: OfflinePrefetchOptions = {},
): Promise<OfflinePrefetchResult> {
  const amudTargets = buildMasechetAmudTargets(masechetEn);
  return runPrefetchForTargets(amudTargets, options);
}
