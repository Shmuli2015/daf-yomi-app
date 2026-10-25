import { useEffect, useRef } from 'react';
import type { DafLocation } from '../utils/dafNavigation';
import { prefetchNextDaf } from '../services/readerPrefetch';

const PREFETCH_DEBOUNCE_MS = 400;

export function useReaderPrefetch(
  location: DafLocation,
  gemaraNikud: boolean,
  includeChavruta = true,
): void {
  const locationRef = useRef(location);
  const gemaraNikudRef = useRef(gemaraNikud);
  const includeChavrutaRef = useRef(includeChavruta);

  locationRef.current = location;
  gemaraNikudRef.current = gemaraNikud;
  includeChavrutaRef.current = includeChavruta;

  useEffect(() => {
    const timer = setTimeout(() => {
      void prefetchNextDaf(locationRef.current, {
        gemaraNikud: gemaraNikudRef.current,
        includeChavruta: includeChavrutaRef.current,
      });
    }, PREFETCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [location.masechetEn, location.dafNum, location.amud, gemaraNikud, includeChavruta]);
}
