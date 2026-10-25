import { fetchChavrutaAmud, hasCachedChavrutaMasechet } from './chavrutaApi';
import { fetchSefariaPageText } from './sefariaTextApi';
import { getChavrutaSource } from '../data/chavrutaSources';
import { normalizeMasechetEn, type DafLocation } from '../utils/dafNavigation';
import { getNextDafPrefetchTargets } from '../utils/readerPrefetchTargets';

export interface PrefetchNextDafOptions {
  gemaraNikud?: boolean;
  includeChavruta?: boolean;
}

const inFlightSefaria = new Set<string>();
const inFlightChavruta = new Set<string>();

export function clearReaderPrefetchInFlight(): void {
  inFlightSefaria.clear();
  inFlightChavruta.clear();
}

export async function prefetchNextDaf(
  loc: DafLocation,
  options: PrefetchNextDafOptions = {},
): Promise<void> {
  const gemaraNikud = options.gemaraNikud !== false;
  const includeChavruta = options.includeChavruta ?? true;
  const targets = getNextDafPrefetchTargets(loc);

  if (targets.length === 0) {
    return;
  }

  for (const target of targets) {
    const key = `${target.masechetEn}:${target.dafNum}:${target.amud}:${gemaraNikud}`;
    if (inFlightSefaria.has(key)) {
      continue;
    }
    inFlightSefaria.add(key);
    try {
      await fetchSefariaPageText(
        target.masechetEn,
        target.dafNum,
        target.amud,
        gemaraNikud,
        { requireDiskCache: true },
      );
    } catch {
    } finally {
      inFlightSefaria.delete(key);
    }
  }

  if (includeChavruta) {
    const distinctMasechtot = Array.from(
      new Set(targets.map((t) => normalizeMasechetEn(t.masechetEn))),
    );

    for (const masechetEn of distinctMasechtot) {
      if (!getChavrutaSource(masechetEn)) {
        continue;
      }
      if (inFlightChavruta.has(masechetEn)) {
        continue;
      }
      inFlightChavruta.add(masechetEn);
      try {
        const isCached = await hasCachedChavrutaMasechet(masechetEn);
        if (!isCached) {
          const firstTarget = targets.find(
            (t) => normalizeMasechetEn(t.masechetEn) === masechetEn,
          );
          if (firstTarget) {
            await fetchChavrutaAmud(
              firstTarget.masechetEn,
              firstTarget.dafNum,
              firstTarget.amud,
            );
          }
        }
      } catch {
      } finally {
        inFlightChavruta.delete(masechetEn);
      }
    }
  }
}
