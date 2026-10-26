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

function chavrutaPrefetchLocations(
  loc: DafLocation,
  targets: DafLocation[],
): DafLocation[] {
  const ordered = [loc, ...targets];
  const seen = new Set<string>();
  const locations: DafLocation[] = [];

  for (const candidate of ordered) {
    const masechetEn = normalizeMasechetEn(candidate.masechetEn);
    if (seen.has(masechetEn)) {
      continue;
    }
    if (!getChavrutaSource(masechetEn)) {
      continue;
    }
    seen.add(masechetEn);
    locations.push({
      masechetEn,
      dafNum: candidate.dafNum,
      amud: candidate.amud,
    });
  }

  return locations;
}

async function prefetchSefariaTarget(
  target: DafLocation,
  gemaraNikud: boolean,
): Promise<void> {
  const key = `${target.masechetEn}:${target.dafNum}:${target.amud}:${gemaraNikud}`;
  if (inFlightSefaria.has(key)) {
    return;
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

async function prefetchChavrutaLocation(loc: DafLocation): Promise<void> {
  if (inFlightChavruta.has(loc.masechetEn)) {
    return;
  }
  inFlightChavruta.add(loc.masechetEn);
  try {
    const isCached = await hasCachedChavrutaMasechet(loc.masechetEn);
    if (!isCached) {
      await fetchChavrutaAmud(loc.masechetEn, loc.dafNum, loc.amud);
    }
  } catch {
  } finally {
    inFlightChavruta.delete(loc.masechetEn);
  }
}

export async function prefetchNextDaf(
  loc: DafLocation,
  options: PrefetchNextDafOptions = {},
): Promise<void> {
  const gemaraNikud = options.gemaraNikud !== false;
  const includeChavruta = options.includeChavruta ?? true;
  const targets = getNextDafPrefetchTargets(loc);

  const sefariaWork = Promise.all(
    targets.map((target) => prefetchSefariaTarget(target, gemaraNikud)),
  );
  const chavrutaWork = includeChavruta
    ? Promise.all(
        chavrutaPrefetchLocations(loc, targets).map((location) =>
          prefetchChavrutaLocation(location),
        ),
      )
    : Promise.resolve();

  await Promise.all([sefariaWork, chavrutaWork]);
}
