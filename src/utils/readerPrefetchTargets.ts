import {
  getNextAmud,
  getNextDaf,
  normalizeMasechetEn,
  type DafLocation,
} from './dafNavigation';
import { isAmudAvailable } from './shas';

export function getNextDafPrefetchTargets(loc: DafLocation): DafLocation[] {
  const normalizedMasechet = normalizeMasechetEn(loc.masechetEn);
  const targets: DafLocation[] = [];
  const seen = new Set<string>();

  const add = (candidate: DafLocation | null) => {
    if (!candidate) {
      return;
    }
    const masechet = normalizeMasechetEn(candidate.masechetEn);
    if (!isAmudAvailable(masechet, candidate.dafNum, candidate.amud)) {
      return;
    }
    const key = `${masechet}:${candidate.dafNum}:${candidate.amud}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    targets.push({
      masechetEn: masechet,
      dafNum: candidate.dafNum,
      amud: candidate.amud,
    });
  };

  const nextAmud = getNextAmud({ ...loc, masechetEn: normalizedMasechet });
  if (
    nextAmud &&
    nextAmud.masechetEn === normalizedMasechet &&
    nextAmud.dafNum === loc.dafNum
  ) {
    add(nextAmud);
  }

  const nextDaf = getNextDaf({ ...loc, masechetEn: normalizedMasechet });
  if (nextDaf) {
    const nextDafMasechet = normalizeMasechetEn(nextDaf.masechetEn);
    add({ masechetEn: nextDafMasechet, dafNum: nextDaf.dafNum, amud: 'a' });
    add({ masechetEn: nextDafMasechet, dafNum: nextDaf.dafNum, amud: 'b' });
  }

  if (nextAmud) {
    add(nextAmud);
  }

  return targets;
}
