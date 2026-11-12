import {
  getNextAmud,
  normalizeMasechetEn,
  type DafLocation,
} from './dafNavigation';
import { isAmudAvailable } from './shas';

export function getNextDafPrefetchTargets(loc: DafLocation): DafLocation[] {
  const normalizedMasechet = normalizeMasechetEn(loc.masechetEn);
  const nextAmud = getNextAmud({ ...loc, masechetEn: normalizedMasechet });
  if (!nextAmud) {
    return [];
  }
  const masechet = normalizeMasechetEn(nextAmud.masechetEn);
  if (!isAmudAvailable(masechet, nextAmud.dafNum, nextAmud.amud)) {
    return [];
  }
  return [
    {
      masechetEn: masechet,
      dafNum: nextAmud.dafNum,
      amud: nextAmud.amud,
    },
  ];
}
