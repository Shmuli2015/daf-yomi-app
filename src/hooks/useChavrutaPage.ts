import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchChavrutaAmud, type ChavrutaPageData } from '../services/chavrutaApi';
import { normalizeMasechetEn, type DafLocation } from '../utils/dafNavigation';

interface UseChavrutaPageResult {
  data: ChavrutaPageData | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

function locationKey(location: DafLocation): string {
  return `${normalizeMasechetEn(location.masechetEn)}:${location.dafNum}:${location.amud}`;
}

export function useChavrutaPage(location: DafLocation, enabled: boolean): UseChavrutaPageResult {
  const [data, setData] = useState<ChavrutaPageData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resultKey, setResultKey] = useState<string | null>(null);
  const [reloadNonce, setReloadNonce] = useState(0);
  const reloadNonceRef = useRef(0);

  const currentKey = locationKey(location);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    const forceRefresh = reloadNonce !== reloadNonceRef.current && reloadNonce > 0;
    reloadNonceRef.current = reloadNonce;

    void (async () => {
      try {
        const page = await fetchChavrutaAmud(
          location.masechetEn,
          location.dafNum,
          location.amud,
          { forceRefresh }
        );
        if (!cancelled) {
          setData(page);
          setError(null);
          setResultKey(currentKey);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'שגיאה בטעינת ביאור חברותא';
          setError(message);
          setData(null);
          setResultKey(currentKey);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentKey, enabled, location.amud, location.dafNum, location.masechetEn, reloadNonce]);

  const reload = useCallback(() => {
    setReloadNonce((value) => value + 1);
  }, []);

  const isCurrent = resultKey === currentKey;

  return {
    data,
    loading: enabled && !isCurrent && data == null,
    error: isCurrent ? error : null,
    reload,
  };
}
